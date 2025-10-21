import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  addDoc,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  ADMIN_ROLES,
  PERMISSIONS,
  hasPermission,
  getRoleDisplayName,
} from "../utils/adminRoles";
import {
  FaSignOutAlt,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaFileAlt,
  FaImage,
  FaLink,
  FaUser,
  FaCalendar,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import {
  AnimatedCard,
  GradientBackground,
  GlassCard,
} from "../components/Animations";
import AdminLayout from "../components/AdminLayout";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [scoringConfig, setScoringConfig] = useState({
    tiers: [50, 40, 30, 20, 15],
    defaultPoints: 10,
  });
  const [tiersInput, setTiersInput] = useState("50,40,30,20,15");
  const [defaultPointsInput, setDefaultPointsInput] = useState("10");
  const [savingScoring, setSavingScoring] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [scoringProfiles, setScoringProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [expectedRank, setExpectedRank] = useState(null);
  const [expectedPoints, setExpectedPoints] = useState(null);

  const updateExistingNotifications = async () => {
    try {
      console.log("🔄 Updating existing notifications with correct points...");

      // Get all notifications
      const notificationsSnap = await getDocs(collection(db, "notifications"));
      const notifications = notificationsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get all reports to calculate correct points
      const reportsSnap = await getDocs(collection(db, "reports"));
      const reports = reportsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group reports by rumorUrl
      const reportsByUrl = {};
      reports.forEach((report) => {
        if (report.rumorUrl) {
          if (!reportsByUrl[report.rumorUrl]) {
            reportsByUrl[report.rumorUrl] = [];
          }
          reportsByUrl[report.rumorUrl].push(report);
        }
      });

      // Sort each group by createdAt
      Object.keys(reportsByUrl).forEach((url) => {
        reportsByUrl[url].sort((a, b) => {
          const at = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bt = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return at - bt;
        });
      });

      let updatedCount = 0;

      // Update notifications with correct points
      for (const notification of notifications) {
        if (notification.reportId && notification.points === 10) {
          const report = reports.find((r) => r.id === notification.reportId);
          if (report && report.rumorUrl) {
            const sameReports = reportsByUrl[report.rumorUrl] || [];
            const index = sameReports.findIndex(
              (r) => r.id === notification.reportId
            );

            if (index >= 0) {
              const correctPoints =
                scoringConfig.tiers[index] ?? scoringConfig.defaultPoints;

              if (correctPoints !== notification.points) {
                await updateDoc(doc(db, "notifications", notification.id), {
                  points: correctPoints,
                });
                updatedCount++;
                console.log(
                  `✅ Updated notification ${notification.id}: ${notification.points} → ${correctPoints} points`
                );
              }
            }
          }
        }
      }

      console.log(
        `🎉 Updated ${updatedCount} notifications with correct points!`
      );
      alert(`تم تحديث ${updatedCount} إشعار بالنقاط الصحيحة!`);
    } catch (error) {
      console.error("Error updating notifications:", error);
      alert("حدث خطأ في تحديث الإشعارات");
    }
  };

  useEffect(() => {
    // Wait for auth state to be ready, then check
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthLoading(false);
        navigate("/admin/login", { replace: true });
        return;
      }

      try {
        // Check if user is admin and get admin data
        const adminDoc = await getDoc(doc(db, "admins", user.uid));

        if (!adminDoc.exists()) {
          // Check if it's the super admin
          if (user.email === "admin@mansa.com") {
            setCurrentAdmin({
              uid: user.uid,
              email: user.email,
              name: "مدير عام",
              role: ADMIN_ROLES.SUPER_ADMIN,
              permissions: Object.values(PERMISSIONS),
              isActive: true,
            });
          } else {
            setAuthLoading(false);
            navigate("/admin/login", { replace: true });
            return;
          }
        } else {
          const adminData = adminDoc.data();

          if (!adminData.isActive) {
            setAuthLoading(false);
            navigate("/admin/login", { replace: true });
            return;
          }

          setCurrentAdmin(adminData);
        }

        // Load scoring settings (admin can control via Firestore collection: scoring/current)
        try {
          const scoringDoc = await getDoc(doc(db, "scoring", "current"));
          if (scoringDoc.exists()) {
            const data = scoringDoc.data();
            setScoringConfig({
              tiers:
                Array.isArray(data.tiers) && data.tiers.length > 0
                  ? data.tiers
                  : [50, 40, 30, 20, 15],
              defaultPoints: Number.isFinite(data.defaultPoints)
                ? data.defaultPoints
                : 10,
            });
            setTiersInput(
              (Array.isArray(data.tiers) && data.tiers.length > 0
                ? data.tiers
                : [50, 40, 30, 20, 15]
              ).join(",")
            );
            setDefaultPointsInput(
              String(
                Number.isFinite(data.defaultPoints) ? data.defaultPoints : 10
              )
            );
          }
        } catch (e) {
          console.warn("Scoring settings not found, using defaults.");
        }

        // Load available scoring profiles (exclude 'current')
        try {
          const snap = await getDocs(collection(db, "scoring"));
          const list = snap.docs
            .filter((d) => d.id !== "current")
            .map((d) => ({ id: d.id, ...(d.data() || {}) }));
          setScoringProfiles(list);
        } catch (e) {
          console.warn("Could not load scoring profiles", e);
        }

        // Listen to reports collection
        const q = query(
          collection(db, "reports"),
          orderBy("createdAt", "desc")
        );
        const unsubscribeReports = onSnapshot(q, (snapshot) => {
          const reportsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReports(reportsData);
          setLoading(false);
        });

        setAuthLoading(false);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setAuthLoading(false);
        navigate("/admin/login", { replace: true });
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleSaveScoring = async () => {
    try {
      setSavingScoring(true);
      setSaveMsg("");
      const parsedTiers = tiersInput
        .split(",")
        .map((s) => Number(String(s).trim()))
        .filter((n) => Number.isFinite(n) && n >= 0);
      const parsedDefault = Number(defaultPointsInput);
      if (parsedTiers.length === 0 || !Number.isFinite(parsedDefault)) {
        setSaveMsg("المدخلات غير صالحة");
        setSavingScoring(false);
        return;
      }
      await setDoc(
        doc(db, "scoring", "current"),
        { tiers: parsedTiers, defaultPoints: parsedDefault },
        { merge: true }
      );
      setScoringConfig({ tiers: parsedTiers, defaultPoints: parsedDefault });
      setSaveMsg("تم الحفظ بنجاح");
    } catch (e) {
      console.error("Error saving scoring config:", e);
      setSaveMsg("حدث خطأ أثناء الحفظ");
    } finally {
      setSavingScoring(false);
      setTimeout(() => setSaveMsg(""), 2500);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      const reportDoc = await getDoc(reportRef);
      const reportData = reportDoc.data();

      // Update report status
      await updateDoc(reportRef, {
        status: status,
        reviewedAt: serverTimestamp(),
        reviewedBy: auth.currentUser.email,
        adminNotes: adminNotes || null,
      });

      // Send notification to user
      const notificationData = {
        userId: reportData.submittedBy,
        type: status === "approved" ? "report_approved" : "report_rejected",
        title: status === "approved" ? "تم قبول البلاغ" : "تم رفض البلاغ",
        message:
          status === "approved"
            ? `تم قبول البلاغ الذي أرسلته حول "${reportData.rumorUrl}". شكراً لك على مساهمتك في مكافحة الإشاعات!`
            : `تم رفض البلاغ الذي أرسلته حول "${reportData.rumorUrl}". يرجى مراجعة المعلومات المقدمة.`,
        points: status === "approved" ? 0 : 0, // Will be updated after calculation
        read: false,
        createdAt: serverTimestamp(),
        reportId: reportId,
      };

      // Update user points if approved - dynamic based on submission order
      if (status === "approved") {
        // Determine rank by submission time among ALL reports of same rumorUrl
        let awardPoints = scoringConfig.defaultPoints; // default for after tiers
        let same = []; // Initialize same array
        if (reportData.rumorUrl) {
          const sameRumorSnap = await getDocs(
            query(
              collection(db, "reports"),
              where("rumorUrl", "==", reportData.rumorUrl)
            )
          );
          same = sameRumorSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const at = a.createdAt?.toDate?.() || new Date(a.createdAt);
              const bt = b.createdAt?.toDate?.() || new Date(b.createdAt);
              return at - bt;
            });
          const index = Math.max(
            0,
            same.findIndex((r) => r.id === reportId)
          );
          const tier = scoringConfig.tiers;
          awardPoints = tier[index] ?? scoringConfig.defaultPoints;
        }

        // Update notification with actual awarded points
        notificationData.points = awardPoints;

        console.log("🔍 DEBUG - Points calculation:", {
          rumorUrl: reportData.rumorUrl,
          sameReportsCount: same.length,
          reportIndex: reportData.rumorUrl
            ? same.findIndex((r) => r.id === reportId)
            : -1,
          awardPoints: awardPoints,
          tiers: scoringConfig.tiers,
          defaultPoints: scoringConfig.defaultPoints,
        });

        const userRef = doc(db, "users", reportData.submittedBy);
        const userDoc = await getDoc(userRef);

        console.log("🔍 DEBUG - Updating user points:", {
          userId: reportData.submittedBy,
          userDocExists: userDoc.exists(),
          currentPoints: userDoc.exists() ? userDoc.data().totalPoints : 0,
          awardPoints: awardPoints,
        });

        if (userDoc.exists()) {
          const currentPoints = userDoc.data().totalPoints || 0;
          const newTotalPoints = currentPoints + awardPoints;
          console.log("🔍 DEBUG - Updating points:", {
            from: currentPoints,
            to: newTotalPoints,
            added: awardPoints,
          });
          await updateDoc(userRef, {
            totalPoints: newTotalPoints,
            totalReports: (userDoc.data().totalReports || 0) + 1,
          });
        } else {
          console.log("🔍 DEBUG - User document doesn't exist, creating it");
          await setDoc(userRef, {
            id: reportData.submittedBy,
            email: reportData.submittedByEmail,
            name: reportData.submittedByName,
            totalPoints: awardPoints,
            totalReports: 1,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
          });
        }

        // Persist awarded points on the report for analytics
        await updateDoc(reportRef, { pointsAwarded: awardPoints });

        // Update notification with actual awarded points
        notificationData.points = awardPoints;

        // Write a ledger entry
        await addDoc(collection(db, "points_ledger"), {
          userId: reportData.submittedBy,
          reportId,
          rumorUrl: reportData.rumorUrl || null,
          points: awardPoints,
          reason: "report_approved",
          createdAt: serverTimestamp(),
        });
      }

      // Create notification with correct points
      await addDoc(collection(db, "notifications"), notificationData);

      setSelectedReport(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  // Helper: when opening a report, compute expected rank/points for admin preview
  const openReportWithPreview = async (report) => {
    setSelectedReport(report);
    setExpectedRank(null);
    setExpectedPoints(null);
    try {
      if (!report?.rumorUrl) return;
      const snap = await getDocs(
        query(
          collection(db, "reports"),
          where("rumorUrl", "==", report.rumorUrl)
        )
      );
      const same = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const at = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bt = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return at - bt;
        });
      const idx = Math.max(
        0,
        same.findIndex((r) => r.id === report.id)
      );
      const rank = idx + 1;
      const pts = scoringConfig.tiers[idx] ?? scoringConfig.defaultPoints;
      setExpectedRank(rank);
      setExpectedPoints(pts);
    } catch (e) {
      console.warn("Could not compute rank preview", e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "في الانتظار";
      case "approved":
        return "موافق عليه";
      case "rejected":
        return "مرفوض";
      default:
        return "غير معروف";
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout currentAdmin={currentAdmin}>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <AnimatedCard>
            <GlassCard className="p-6 sm:p-8 lg:p-10 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
                جاري التحميل...
              </h2>
            </GlassCard>
          </AnimatedCard>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentAdmin={currentAdmin}>
      <div
        className="w-full max-w-full mx-auto px-0"
        style={{
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {/* Update Existing Notifications Button */}
        <div className="mb-4 sm:mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={updateExistingNotifications}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 cursor-pointer text-sm sm:text-base"
          >
            <span className="hidden sm:inline">
              🔄 تحديث الإشعارات الموجودة بالنقاط الصحيحة
            </span>
            <span className="sm:hidden">🔄 تحديث الإشعارات</span>
          </motion.button>
        </div>

        {/* Scoring Settings - removed as requested */}
        {false && currentAdmin && (
          <AnimatedCard>
            <GlassCard className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">إعدادات النقاط</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    المستويات (يفصل بينها فاصلة)
                  </label>
                  <input
                    type="text"
                    value={tiersInput}
                    onChange={(e) => setTiersInput(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="مثال: 50,40,30,20,15"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    النقاط الافتراضية بعد أول {scoringConfig.tiers.length}
                  </label>
                  <input
                    type="number"
                    value={defaultPointsInput}
                    onChange={(e) => setDefaultPointsInput(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    min={0}
                  />
                </div>
                <div className="md:col-span-3 grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      الملف النشط
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg"
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                    >
                      <option value="">(اختر ملفاً لحمله)</option>
                      {scoringProfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-end gap-2">
                    <input
                      type="text"
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="اسم ملف جديد (مثال: رمضان-2025)"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                    />
                    <button
                      onClick={async () => {
                        if (!newProfileName.trim()) return;
                        const id = newProfileName.trim();
                        await setDoc(doc(db, "scoring", id), {
                          name: id,
                          tiers: scoringConfig.tiers,
                          defaultPoints: scoringConfig.defaultPoints,
                        });
                        setScoringProfiles((prev) => [
                          ...prev.filter((p) => p.id !== id),
                          {
                            id,
                            name: id,
                            tiers: scoringConfig.tiers,
                            defaultPoints: scoringConfig.defaultPoints,
                          },
                        ]);
                        setNewProfileName("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                    >
                      حفظ كملف جديد
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedProfileId) return;
                        const snap = await getDoc(
                          doc(db, "scoring", selectedProfileId)
                        );
                        if (snap.exists()) {
                          const data = snap.data();
                          setScoringConfig({
                            tiers: Array.isArray(data.tiers)
                              ? data.tiers
                              : scoringConfig.tiers,
                            defaultPoints: Number.isFinite(data.defaultPoints)
                              ? data.defaultPoints
                              : scoringConfig.defaultPoints,
                          });
                          setTiersInput(
                            (Array.isArray(data.tiers)
                              ? data.tiers
                              : scoringConfig.tiers
                            ).join(",")
                          );
                          setDefaultPointsInput(
                            String(
                              Number.isFinite(data.defaultPoints)
                                ? data.defaultPoints
                                : scoringConfig.defaultPoints
                            )
                          );
                          // set as current
                          await setDoc(
                            doc(db, "scoring", "current"),
                            {
                              tiers: Array.isArray(data.tiers)
                                ? data.tiers
                                : scoringConfig.tiers,
                              defaultPoints: Number.isFinite(data.defaultPoints)
                                ? data.defaultPoints
                                : scoringConfig.defaultPoints,
                            },
                            { merge: true }
                          );
                          setSaveMsg("تم تحميل الملف وتعيينه كنشط");
                          setTimeout(() => setSaveMsg(""), 2500);
                        }
                      }}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg cursor-pointer"
                    >
                      تحميل الملف وتعيينه
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleSaveScoring}
                  disabled={savingScoring}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  {savingScoring ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </button>
                {saveMsg && (
                  <span className="text-sm text-gray-600">{saveMsg}</span>
                )}
              </div>
            </GlassCard>
          </AnimatedCard>
        )}
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-6 sm:mb-8 lg:mb-10"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              إدارة البلاغات
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              مراجعة وموافقة على البلاغات المقدمة
            </p>
          </div>
        </motion.div>

        {/* Reports List */}
        <div className="grid gap-4 sm:gap-6 w-full">
          {reports.length === 0 ? (
            <AnimatedCard>
              <GlassCard className="p-6 sm:p-8 lg:p-10 text-center">
                <FaFileAlt className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-2">
                  لا توجد بلاغات
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  لم يتم إرسال أي بلاغات بعد
                </p>
              </GlassCard>
            </AnimatedCard>
          ) : (
            reports.map((report) => (
              <AnimatedCard key={report.id}>
                <GlassCard className="p-4 sm:p-6 w-full">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-3 sm:gap-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                          بلاغ #{report.id.slice(-8)}
                        </h3>
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {getStatusText(report.status)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaUser className="w-3 h-3 sm:w-4 sm:h-4" />
                          {report.submittedByName}
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {report.createdAt
                            ?.toDate?.()
                            ?.toLocaleDateString("ar-SA") || "غير محدد"}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => openReportWithPreview(report)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-300 cursor-pointer text-sm sm:text-base self-start sm:self-auto"
                    >
                      <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">عرض التفاصيل</span>
                      <span className="sm:hidden">عرض</span>
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FaLink className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <p className="font-medium text-gray-700">
                          رابط الإشاعة:
                        </p>
                        <a
                          href={report.rumorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all text-xs sm:text-sm"
                        >
                          {report.rumorUrl}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaFileAlt className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <p className="font-medium text-gray-700">الوصف:</p>
                        <p className="text-gray-600 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {report.imageUrl && (
                      <div className="flex items-start gap-3">
                        <FaImage className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="font-medium text-gray-700">الصورة:</p>
                          <img
                            src={report.imageUrl}
                            alt="صورة البلاغ"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </AnimatedCard>
            ))
          )}
        </div>

        {/* Report Details Modal */}
        {selectedReport && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              zIndex: "50",
              "@media (min-width: 640px)": {
                padding: "16px",
              },
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 max-w-7xl w-full max-h-[95vh] overflow-y-auto"
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "16px",
                width: "100%",
                maxWidth: "1280px",
                maxHeight: "95vh",
                overflowY: "auto",
                "@media (min-width: 640px)": {
                  borderRadius: "16px",
                  padding: "24px",
                },
                "@media (min-width: 1024px)": {
                  padding: "32px",
                },
              }}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  تفاصيل البلاغ
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  "@media (min-width: 640px)": {
                    gap: "24px",
                  },
                  "@media (min-width: 1024px)": {
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "32px",
                  },
                }}
              >
                {/* Left Column - Text Content */}
                <div
                  className="space-y-4 sm:space-y-6"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    "@media (min-width: 640px)": {
                      gap: "24px",
                    },
                  }}
                >
                  {expectedRank && (
                    <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                      <p className="font-semibold text-sm sm:text-base lg:text-lg">
                        ترتيب هذا البلاغ بين البلاغات لنفس الإشاعة:{" "}
                        {expectedRank}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base">
                        النقاط المتوقعة في حال الموافقة: {expectedPoints}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      رابط الإشاعة:
                    </h3>
                    <a
                      href={selectedReport.rumorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all text-sm sm:text-base lg:text-lg underline"
                    >
                      {selectedReport.rumorUrl}
                    </a>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      الوصف:
                    </h3>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base lg:text-lg leading-relaxed">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      ملاحظات المدير:
                    </h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base lg:text-lg"
                      rows={3}
                      placeholder="أضف ملاحظاتك هنا..."
                    />
                  </div>
                </div>

                {/* Right Column - Image */}
                <div
                  className="space-y-4 sm:space-y-6"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    "@media (min-width: 640px)": {
                      gap: "24px",
                    },
                  }}
                >
                  {selectedReport.imageUrl && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                        الصورة:
                      </h3>
                      <div className="flex justify-center">
                        <img
                          src={selectedReport.imageUrl}
                          alt="صورة البلاغ"
                          className="max-w-full h-auto rounded-lg shadow-lg"
                          style={{ maxHeight: "300px" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "24px",
                  "@media (min-width: 640px)": {
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "24px",
                    marginTop: "32px",
                  },
                  "@media (min-width: 1024px)": {
                    gap: "32px",
                  },
                }}
              >
                {currentAdmin &&
                  hasPermission(
                    currentAdmin.role,
                    PERMISSIONS.APPROVE_REPORTS
                  ) && (
                    <motion.button
                      onClick={() =>
                        handleReviewReport(selectedReport.id, "approved")
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center cursor-pointer gap-2 px-8 sm:px-12 lg:px-20 bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-lg font-semibold transition-colors duration-300 text-base sm:text-lg w-full sm:w-auto"
                    >
                      <FaCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      موافقة
                    </motion.button>
                  )}
                {currentAdmin &&
                  hasPermission(
                    currentAdmin.role,
                    PERMISSIONS.REJECT_REPORTS
                  ) && (
                    <motion.button
                      onClick={() =>
                        handleReviewReport(selectedReport.id, "rejected")
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center px-8 sm:px-12 lg:px-20 justify-center cursor-pointer gap-2 bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 rounded-lg font-semibold transition-colors duration-300 text-base sm:text-lg w-full sm:w-auto"
                    >
                      <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                      رفض
                    </motion.button>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
