import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot as onSnapshotCol,
} from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "../utils/firebase";
import {
  FaUser,
  FaEnvelope,
  FaStar,
  FaCalendarAlt,
  FaShieldAlt,
  FaEdit,
  FaCog,
  FaHistory,
  FaTrophy,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  GradientBackground,
  GlassCard,
} from "../components/Animations";

const Profile = () => {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [socialMediaSaving, setSocialMediaSaving] = useState(false);
  const [socialMediaSuccess, setSocialMediaSuccess] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [statsLive, setStatsLive] = useState({
    totalReports: 0,
    approvedReports: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    } else if (user) {
      console.log(
        "🔍 Profile: User data from AuthContext:",
        JSON.stringify(
          {
            id: user.id,
            uid: user.uid,
            email: user.email,
            name: user.name,
            role: user.role,
            totalPoints: user.totalPoints,
          },
          null,
          2
        )
      );
    }
  }, [user, authLoading, navigate]);

  // Listen to users/{uid}
  useEffect(() => {
    if (!user) return;
    const userId = user.id || user.uid;
    console.log("🔍 Profile: Listening to user document:", userId);
    const ref = doc(db, "users", userId);
    const unsub = onSnapshot(ref, (snap) => {
      const firestoreData = snap.data();
      console.log(
        "🔍 Profile: User document snapshot:",
        JSON.stringify(
          {
            exists: snap.exists(),
            data: firestoreData
              ? {
                  name: firestoreData.name,
                  email: firestoreData.email,
                  totalPoints: firestoreData.totalPoints,
                  role: firestoreData.role,
                }
              : null,
          },
          null,
          2
        )
      );
      if (snap.exists()) {
        const userData = { id: snap.id, ...snap.data() };
        console.log(
          "🔍 Profile: Setting profile data:",
          JSON.stringify(
            {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              totalPoints: userData.totalPoints,
              role: userData.role,
            },
            null,
            2
          )
        );
        console.log("🔍 Profile: Name from Firestore:", userData.name);
        console.log("🔍 Profile: Name from AuthContext:", user.name);
        setProfile(userData);
      } else {
        console.log("🔍 Profile: User document does not exist, creating it...");
        // Create user document if it doesn't exist
        setDoc(ref, {
          name: user.name || "",
          email: user.email || "",
          role: "user",
          totalPoints: 0,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        }).catch(console.error);
      }
    });
    return () => unsub();
  }, [user]);

  // Listen to reports stats for this user
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "reports"),
      where("submittedBy", "==", user.id || user.uid)
    );
    const unsub = onSnapshotCol(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const total = list.length;
      const approved = list.filter((r) => r.status === "approved").length;
      setStatsLive({ totalReports: total, approvedReports: approved });
    });
    return () => unsub();
  }, [user]);

  if (authLoading) {
    return (
      <GradientBackground className="min-h-screen flex items-center justify-center">
        <AnimatedCard>
          <GlassCard className="p-10 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-700">
              جاري التحميل...
            </h2>
          </GlassCard>
        </AnimatedCard>
      </GradientBackground>
    );
  }

  const stats = [
    {
      name: "إجمالي النقاط",
      value: profile?.totalPoints ?? 0,
      icon: FaStar,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
    },
    {
      name: "البلاغات المرسلة",
      value: statsLive.totalReports,
      icon: FaHistory,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "البلاغات الصحيحة",
      value: statsLive.approvedReports,
      icon: FaTrophy,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "مستوى الثقة",
      value:
        statsLive.totalReports > 0
          ? Math.round(
              ((statsLive.approvedReports || 0) /
                (statsLive.totalReports || 1)) *
                100
            ) + "%"
          : "—",
      icon: FaShieldAlt,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <GradientBackground className="min-h-screen">
      <div className="space-y-8" dir="rtl">
        {/* Profile Header */}
        <AnimatedSection>
          <GlassCard className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaUser className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  title="تعديل الملف الشخصي"
                >
                  <FaEdit className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.button>
              </motion.div>

              <div className="flex-1 text-center lg:text-right">
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-2 truncate"
                >
                  {(() => {
                    const displayName =
                      profile?.name || user?.name || "اسم المستخدم";
                    console.log(
                      "🔍 Profile: Display name calculation:",
                      JSON.stringify(
                        {
                          profileName: profile?.name,
                          userName: user?.name,
                          finalName: displayName,
                        },
                        null,
                        2
                      )
                    );
                    return displayName;
                  })()}
                </motion.h1>
                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 flex items-center justify-center lg:justify-start gap-2"
                >
                  <FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5" />
                  {profile?.email || user?.email}
                </motion.p>
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4"
                >
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-sm sm:text-base">
                    <FaStar className="w-4 h-4 sm:w-5 sm:h-5" />
                    {profile?.totalPoints ?? 0} نقطة
                  </div>
                  {(profile?.role || user?.role) === "admin" && (
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-sm sm:text-base">
                      <FaShieldAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">مدير النظام</span>
                      <span className="sm:hidden">مدير</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Profile editing section */}
              <div className="w-full lg:w-auto">
                <div className="flex items-center gap-2 mb-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  >
                    <FaEdit className="w-4 h-4" />
                    {editingProfile ? "إلغاء التعديل" : "تعديل الملف الشخصي"}
                  </motion.button>
                </div>

                {editingProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-4 bg-white/50 rounded-xl border border-white/30"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم
                      </label>
                      <input
                        type="text"
                        value={profile?.name || ""}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...(p || {}),
                            name: e.target.value,
                          }))
                        }
                        placeholder="اسمك الكامل"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={profile?.email || user?.email || ""}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...(p || {}),
                            email: e.target.value,
                          }))
                        }
                        placeholder="بريدك الإلكتروني"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={saving}
                        onClick={async () => {
                          try {
                            setSaving(true);
                            setProfileSuccess("");
                            const ref = doc(db, "users", user.id || user.uid);
                            const updateData = {
                              name: profile.name || "",
                              email: profile.email || user.email || "",
                              // Preserve existing data
                              totalPoints: profile?.totalPoints || 0,
                              role: profile?.role || "user",
                              lastActive: serverTimestamp(),
                            };
                            console.log(
                              "🔍 Profile: Updating user document with:",
                              JSON.stringify(
                                {
                                  name: updateData.name,
                                  email: updateData.email,
                                },
                                null,
                                2
                              )
                            );
                            await updateDoc(ref, updateData);

                            console.log("✅ Profile updated successfully");
                            setProfileSuccess("تم حفظ البيانات بنجاح!");

                            // Update AuthContext for immediate reflection
                            updateUser({
                              name: updateData.name,
                              email: updateData.email,
                            });

                            // Update localStorage user for immediate reflection
                            const stored = localStorage.getItem("user");
                            if (stored) {
                              const parsed = JSON.parse(stored);
                              parsed.name = profile.name || parsed.name;
                              parsed.email = profile.email || parsed.email;
                              console.log(
                                "🔍 Profile: Updating localStorage with:",
                                JSON.stringify(
                                  {
                                    id: parsed.id,
                                    name: parsed.name,
                                    email: parsed.email,
                                    role: parsed.role,
                                    totalPoints: parsed.totalPoints,
                                  },
                                  null,
                                  2
                                )
                              );
                              localStorage.setItem(
                                "user",
                                JSON.stringify(parsed)
                              );
                            }

                            setProfileSuccess("تم حفظ التغييرات بنجاح!");
                            setTimeout(() => setProfileSuccess(""), 3000);
                            setEditingProfile(false);
                          } catch (e) {
                            console.error("Error saving profile:", e);
                            setProfileSuccess("حدث خطأ أثناء الحفظ");
                            setTimeout(() => setProfileSuccess(""), 3000);
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-60"
                      >
                        <FaCog className="w-5 h-5" />
                        {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileSuccess("");
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        إلغاء
                      </motion.button>
                    </div>

                    {profileSuccess && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          profileSuccess.includes("نجاح")
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {profileSuccess}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Password Change Section */}
        <AnimatedSection>
          <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                تغيير كلمة المرور
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChangingPassword(!changingPassword)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                <FaCog className="w-4 h-4" />
                {changingPassword ? "إلغاء التغيير" : "تغيير كلمة المرور"}
              </motion.button>
            </motion.div>

            {changingPassword && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-4 bg-white/50 rounded-xl border border-white/30"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="أدخل كلمة المرور الحالية"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="أدخل كلمة المرور الجديدة"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={saving}
                    onClick={async () => {
                      try {
                        setSaving(true);
                        setPasswordSuccess("");

                        // Validate passwords
                        if (
                          passwordData.newPassword !==
                          passwordData.confirmPassword
                        ) {
                          setPasswordSuccess("كلمات المرور غير متطابقة");
                          setTimeout(() => setPasswordSuccess(""), 3000);
                          return;
                        }

                        if (passwordData.newPassword.length < 6) {
                          setPasswordSuccess(
                            "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
                          );
                          setTimeout(() => setPasswordSuccess(""), 3000);
                          return;
                        }

                        // Re-authenticate user
                        const credential = EmailAuthProvider.credential(
                          user.email,
                          passwordData.currentPassword
                        );
                        await reauthenticateWithCredential(
                          auth.currentUser,
                          credential
                        );

                        // Update password
                        await updatePassword(
                          auth.currentUser,
                          passwordData.newPassword
                        );

                        setPasswordSuccess("تم تغيير كلمة المرور بنجاح!");
                        setTimeout(() => setPasswordSuccess(""), 3000);
                        setChangingPassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      } catch (e) {
                        console.error("Error changing password:", e);
                        if (e.code === "auth/wrong-password") {
                          setPasswordSuccess("كلمة المرور الحالية غير صحيحة");
                        } else if (e.code === "auth/weak-password") {
                          setPasswordSuccess("كلمة المرور الجديدة ضعيفة جداً");
                        } else {
                          setPasswordSuccess("حدث خطأ أثناء تغيير كلمة المرور");
                        }
                        setTimeout(() => setPasswordSuccess(""), 3000);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-60"
                  >
                    <FaCog className="w-5 h-5" />
                    {saving ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordSuccess("");
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    إلغاء
                  </motion.button>
                </div>

                {passwordSuccess && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      passwordSuccess.includes("نجاح")
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {passwordSuccess}
                  </motion.div>
                )}
              </motion.div>
            )}
          </GlassCard>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <GlassCard
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${stat.bgColor} border border-white/20 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} text-white`}
                    >
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      {stat.name}
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>

        {/* Social Media Links */}
        <AnimatedSection>
          <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              روابط التواصل الاجتماعي
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "facebook",
                  label: "فيسبوك",
                  icon: FaFacebook,
                  color: "text-blue-600",
                },
                {
                  name: "twitter",
                  label: "تويتر",
                  icon: FaTwitter,
                  color: "text-blue-400",
                },
                {
                  name: "instagram",
                  label: "إنستغرام",
                  icon: FaInstagram,
                  color: "text-pink-500",
                },
                {
                  name: "linkedin",
                  label: "لينكد إن",
                  icon: FaLinkedin,
                  color: "text-blue-700",
                },
                {
                  name: "youtube",
                  label: "يوتيوب",
                  icon: FaYoutube,
                  color: "text-red-600",
                },
                {
                  name: "tiktok",
                  label: "تيك توك",
                  icon: FaTiktok,
                  color: "text-black",
                },
              ].map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.div
                    key={social.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <IconComponent className={`w-6 h-6 ${social.color}`} />
                    <input
                      type="url"
                      placeholder={`رابط ${social.label}`}
                      value={profile?.socialMedia?.[social.name] || ""}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...(p || {}),
                          socialMedia: {
                            ...(p?.socialMedia || {}),
                            [social.name]: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </motion.div>
                );
              })}
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-6 flex flex-col items-end gap-3"
            >
              {socialMediaSuccess && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    socialMediaSuccess.includes("نجاح")
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {socialMediaSuccess}
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={socialMediaSaving || !profile}
                onClick={async () => {
                  try {
                    setSocialMediaSaving(true);
                    setSocialMediaSuccess("");
                    const ref = doc(db, "users", user.id || user.uid);
                    await updateDoc(ref, {
                      socialMedia: profile.socialMedia || {},
                    });
                    setSocialMediaSuccess("تم حفظ الروابط بنجاح!");
                    setTimeout(() => setSocialMediaSuccess(""), 3000);
                  } catch (e) {
                    console.error("Error saving social media:", e);
                    setSocialMediaSuccess("حدث خطأ أثناء الحفظ");
                    setTimeout(() => setSocialMediaSuccess(""), 3000);
                  } finally {
                    setSocialMediaSaving(false);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-60"
              >
                <FaCog className="w-5 h-5" />
                {socialMediaSaving ? "جارٍ الحفظ..." : "حفظ الروابط"}
              </motion.button>
            </motion.div>
          </GlassCard>
        </AnimatedSection>

        {/* Recent Activity */}
        <AnimatedSection>
          <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              النشاط الأخير
            </motion.h2>
            <div className="space-y-4">
              {[
                {
                  action: "أرسلت بلاغ جديد",
                  time: "منذ ساعتين",
                  points: "+10",
                },
                {
                  action: "رد صحيح على إشاعة",
                  time: "منذ 5 ساعات",
                  points: "+5",
                },
                { action: "أرسلت بلاغ جديد", time: "منذ يوم", points: "+10" },
                {
                  action: "رد صحيح على إشاعة",
                  time: "منذ يومين",
                  points: "+5",
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {activity.time}
                    </span>
                    <span className="text-green-600 font-bold">
                      {activity.points}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>
      </div>
    </GradientBackground>
  );
};

export default Profile;
