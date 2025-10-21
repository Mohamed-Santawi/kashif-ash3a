import React, { lazy, Suspense, memo, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileAlt,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaBell,
  FaStar,
  FaRocket,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaGlobe,
  FaLightbulb,
  FaHandsHelping,
  FaCalendarAlt,
  FaEye,
  FaTimesCircle,
  FaInfoCircle,
  FaLink,
  FaUser,
} from "react-icons/fa";

// Add CSS animations
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .report-card {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease-out forwards;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = animationStyles;
  document.head.appendChild(styleSheet);
}
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  GradientBackground,
  GlassCard,
  InViewCard,
  InViewText,
} from "../components/Animations";

// Lazy load heavy components
const FloatingCard = lazy(() =>
  import("../components/Animations").then((module) => ({
    default: module.FloatingCard,
  }))
);
const PulseCard = lazy(() =>
  import("../components/Animations").then((module) => ({
    default: module.PulseCard,
  }))
);

// Simple loading component
const LoadingCard = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const Home = memo(() => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsInitialized, setReportsInitialized] = useState(false);
  const [livePoints, setLivePoints] = useState(0);
  const [modalReport, setModalReport] = useState(null);

  // Debug: Track reports state changes
  useEffect(() => {
    console.log("🔍 DEBUG - Reports state changed:", {
      reportsCount: reports.length,
      loadingReports,
      reportsInitialized,
      timestamp: new Date().toISOString(),
      reports: reports.map((r) => ({
        id: r.id,
        submittedByName: r.submittedByName,
      })),
    });
  }, [reports, loadingReports, reportsInitialized]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Listen to user's live totalPoints from Firestore
  useEffect(() => {
    if (!user) return;
    try {
      const userId = user.id || user.uid;
      console.log("🔍 DEBUG - Setting up points listener for user:", userId);
      console.log("🔍 DEBUG - Full user object:", user);

      // Check if this is an old hardcoded ID
      if (userId === "user-1" || userId === "admin-1") {
        console.log(
          "🔍 DEBUG - WARNING: Using old hardcoded user ID. Please logout and login again to get Firebase UID."
        );
        setLivePoints(0);
        return;
      }

      // Check if this is a new generated ID (from fallback auth)
      if (userId.startsWith("user-") || userId.startsWith("admin-")) {
        console.log("🔍 DEBUG - Using fallback auth ID:", userId);
        // For fallback auth, we'll use localStorage points for now
        setLivePoints(user.totalPoints || 0);
        return;
      }

      const userDocRef = doc(db, "users", userId);
      const unsub = onSnapshot(userDocRef, (snap) => {
        console.log("🔍 DEBUG - Points listener fired:", {
          exists: snap.exists(),
          data: snap.exists() ? snap.data() : null,
          userId: userId,
        });
        if (snap.exists()) {
          const data = snap.data();
          const points = data.totalPoints || 0;
          console.log("🔍 DEBUG - Setting livePoints to:", points);
          setLivePoints(points);
        } else {
          console.log("🔍 DEBUG - User document doesn't exist in Firestore");
          setLivePoints(0);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error("🔍 DEBUG - Error in points listener:", e);
    }
  }, [user]);

  // Open modal if ?report=ID present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reportId = params.get("report");
    if (reportId) {
      (async () => {
        try {
          const ref = doc(db, "reports", reportId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setModalReport({ id: snap.id, ...snap.data() });
          }
        } catch (e) {
          // ignore
        }
      })();
    } else {
      setModalReport(null);
    }
  }, [location.search]);

  useEffect(() => {
    if (!user) return;

    // Listen for recent notifications
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.id || user.uid),
      limit(5)
    );

    const unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt in descending order (most recent first)
        const sortedNotifications = notificationList.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bTime - aTime;
        });

        setRecentNotifications(sortedNotifications);
        setLoadingNotifications(false);
      }
    );

    // Listen for approved reports (public feed)
    const reportsQuery = query(
      collection(db, "reports"),
      where("status", "==", "approved"),
      limit(10)
    );

    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      console.log("🔍 DEBUG - Firestore snapshot received:", {
        docsCount: snapshot.docs.length,
        timestamp: new Date().toISOString(),
      });

      const reportsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt in descending order (most recent first)
      const sortedReports = reportsList.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });

      console.log("🔍 DEBUG - Setting reports:", {
        count: sortedReports.length,
        timestamp: new Date().toISOString(),
        reports: sortedReports.map((r) => ({
          id: r.id,
          submittedByName: r.submittedByName,
        })),
      });

      setReports(sortedReports);
      setLoadingReports(false);

      // Mark as initialized after a short delay to prevent re-render
      setTimeout(() => {
        setReportsInitialized(true);
        console.log("🔍 DEBUG - Reports marked as initialized");
      }, 50);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeReports();
    };
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

  const features = [
    {
      name: "إرسال بلاغ",
      description:
        "أبلغ عن الإشاعات الكاذبة بسهولة مع إمكانية رفع الصور والروابط",
      icon: FaFileAlt,
      href: "/report",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "الإحصائيات",
      description: "تابع إحصائياتك الشخصية وعدد النقاط التي حصلت عليها",
      icon: FaChartLine,
      href: "/statistics",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "الإشعارات",
      description: "احصل على إشعارات فورية عند وجود إشاعات جديدة للرد عليها",
      icon: FaBell,
      href: "/notifications",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      name: "نظام النقاط",
      description: "احصل على نقاط مقابل كل رد صحيح على الإشاعات",
      icon: FaStar,
      href: "/statistics",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const stats = [
    {
      name: "إجمالي البلاغات",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaFileAlt,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "الإشاعات المكذوبة",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaExclamationTriangle,
      color: "from-red-500 to-red-600",
    },
    {
      name: "الأعضاء النشطين",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaUsers,
      color: "from-green-500 to-green-600",
    },
    {
      name: "النقاط الممنوحة",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaStar,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  return (
    <GradientBackground className="min-h-screen">
      <div
        className="space-y-16"
        dir="rtl"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "64px",
          maxWidth: "100vw",
          overflowX: "hidden",
          "@media (max-width: 640px)": {
            gap: "48px",
          },
        }}
      >
        {/* Hero Section */}
        <AnimatedSection className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 opacity-90"></div>
          <div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
            style={{
              position: "relative",
              zIndex: "10",
              maxWidth: "1280px",
              margin: "0 auto",
              paddingLeft: "16px",
              paddingRight: "16px",
              paddingTop: "48px",
              paddingBottom: "48px",
              "@media (min-width: 640px)": {
                paddingLeft: "24px",
                paddingRight: "24px",
                paddingTop: "64px",
                paddingBottom: "64px",
              },
              "@media (min-width: 1024px)": {
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingTop: "80px",
                paddingBottom: "80px",
              },
            }}
          >
            <div
              className="text-center"
              style={{
                textAlign: "center",
              }}
            >
              <AnimatedText className="mb-4 sm:mb-6">
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    fontSize: "30px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    "@media (min-width: 640px)": {
                      fontSize: "36px",
                      marginBottom: "24px",
                    },
                    "@media (min-width: 768px)": {
                      fontSize: "48px",
                    },
                    "@media (min-width: 1024px)": {
                      fontSize: "60px",
                    },
                    "@media (min-width: 1280px)": {
                      fontSize: "72px",
                    },
                  }}
                >
                  مرحباً بك في{" "}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    منصة منع الإشاعات
                  </span>
                </motion.h1>
              </AnimatedText>

              <AnimatedText delay={0.2} className="mb-6 sm:mb-8">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed px-4">
                  منصة تفاعلية تسمح للمواطنين بالإبلاغ عن الإشاعات الكاذبة
                  ومكافحتها من خلال المشاركة المجتمعية
                </p>
              </AnimatedText>

              {user ? (
                <AnimatedText delay={0.4}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                    <GlassCard className="px-4 sm:px-6 py-2 sm:py-3">
                      <span className="text-white font-medium text-sm sm:text-base">
                        نقاطك الحالية:{" "}
                        <span className="text-yellow-400 font-bold">
                          {livePoints}
                        </span>
                      </span>
                    </GlassCard>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/report"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-lg transition-all duration-300"
                      >
                        <FaRocket className="text-lg sm:text-xl" />
                        <span className="hidden sm:inline">
                          إرسال بلاغ جديد
                        </span>
                        <span className="sm:hidden">إرسال بلاغ</span>
                      </Link>
                    </motion.div>
                  </div>
                </AnimatedText>
              ) : (
                <AnimatedText delay={0.4}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-lg transition-all duration-300"
                      >
                        <FaHandsHelping className="text-lg sm:text-xl" />
                        <span className="hidden sm:inline">انضم إلينا</span>
                        <span className="sm:hidden">انضم</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                      >
                        <FaGlobe className="text-lg sm:text-xl" />
                        <span className="hidden sm:inline">تسجيل الدخول</span>
                        <span className="sm:hidden">دخول</span>
                      </Link>
                    </motion.div>
                  </div>
                </AnimatedText>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Reports Feed */}
        {user && (
          <AnimatedSection
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              paddingLeft: "16px",
              paddingRight: "16px",
              "@media (min-width: 640px)": {
                paddingLeft: "24px",
                paddingRight: "24px",
              },
              "@media (min-width: 1024px)": {
                paddingLeft: "32px",
                paddingRight: "32px",
              },
            }}
          >
            <InViewText
              className="text-center mb-6 sm:mb-8"
              margin="-20% 0px -20% 0px"
            >
              <h2
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4"
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  "@media (min-width: 640px)": {
                    fontSize: "30px",
                    marginBottom: "16px",
                  },
                }}
              >
                البلاغات المعتمدة
              </h2>
              <p
                className="text-base sm:text-lg text-gray-600 px-4"
                style={{
                  fontSize: "16px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  "@media (min-width: 640px)": {
                    fontSize: "18px",
                  },
                }}
              >
                آخر البلاغات التي تم اعتمادها من قبل الإدارة
              </p>
            </InViewText>

            {loadingReports ? (
              <div className="space-y-6 min-h-[400px]">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <InViewCard className="p-6 rounded-2xl">
                      <div className="animate-pulse">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </InViewCard>
                  </div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <AnimatedCard>
                <GlassCard className="p-12 text-center rounded-2xl">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <FaFileAlt className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    لا توجد بلاغات معتمدة بعد
                  </h3>
                  <p className="text-gray-600">
                    ستظهر هنا البلاغات التي تم اعتمادها من قبل الإدارة
                  </p>
                </GlassCard>
              </AnimatedCard>
            ) : !reportsInitialized ? (
              <div className="space-y-6 min-h-[400px]">
                {console.log(
                  "🔍 DEBUG - Rendering loading state (not initialized)"
                )}
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <GlassCard className="p-6 rounded-2xl">
                      <div className="animate-pulse">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="space-y-6 min-h-[400px]"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  minHeight: "400px",
                }}
              >
                {console.log(
                  "🔍 DEBUG - About to render reports:",
                  reports.length,
                  "initialized:",
                  reportsInitialized
                )}
                {reports.map((report, index) => {
                  console.log(
                    `🔍 DEBUG - Rendering report ${index + 1} (${report.id}):`,
                    {
                      index,
                      delay: index * 0.15,
                      submittedByName: report.submittedByName,
                      timestamp: new Date().toISOString(),
                    }
                  );

                  return (
                    <InViewCard
                      key={report.id}
                      className="w-full"
                      id={`report-${report.id}`}
                    >
                      <div
                        className="p-4 sm:p-6 rounded-2xl border border-white/20 transition-all duration-300 hover:shadow-xl bg-white/70 backdrop-blur"
                        style={{
                          padding: "16px",
                          borderRadius: "16px",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          backdropFilter: "blur(10px)",
                          "@media (min-width: 640px)": {
                            padding: "24px",
                          },
                        }}
                      >
                        <div
                          className="flex items-start gap-3 sm:gap-4"
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            "@media (min-width: 640px)": {
                              gap: "16px",
                            },
                          }}
                        >
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: "0",
                              "@media (min-width: 640px)": {
                                width: "48px",
                                height: "48px",
                              },
                            }}
                          >
                            <FaCheckCircle
                              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                              style={{
                                width: "20px",
                                height: "20px",
                                "@media (min-width: 640px)": {
                                  width: "24px",
                                  height: "24px",
                                },
                              }}
                            />
                          </div>
                          <div
                            className="flex-1 min-w-0"
                            style={{
                              flex: "1",
                              minWidth: "0",
                            }}
                          >
                            <div
                              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                marginBottom: "8px",
                                "@media (min-width: 640px)": {
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: "8px",
                                },
                              }}
                            >
                              <h3
                                className="text-base sm:text-lg font-bold text-gray-900 truncate"
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  "@media (min-width: 640px)": {
                                    fontSize: "18px",
                                  },
                                }}
                              >
                                {report.submittedByName ||
                                  report.submittedByEmail}
                              </h3>
                              <span
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium self-start"
                                style={{
                                  paddingLeft: "8px",
                                  paddingRight: "8px",
                                  paddingTop: "4px",
                                  paddingBottom: "4px",
                                  fontSize: "12px",
                                  borderRadius: "9999px",
                                  fontWeight: "500",
                                  alignSelf: "flex-start",
                                }}
                              >
                                معتمد
                              </span>
                            </div>
                            <p
                              className="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed"
                              style={{
                                fontSize: "14px",
                                marginBottom: "12px",
                                lineHeight: "1.6",
                                "@media (min-width: 640px)": {
                                  fontSize: "16px",
                                },
                              }}
                            >
                              {report.description}
                            </p>
                            {report.rumorUrl && (
                              <div className="mb-3">
                                <a
                                  href={report.rumorUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center gap-1"
                                >
                                  <FaLink className="w-3 h-3" />
                                  <span className="hidden sm:inline">
                                    عرض الرابط
                                  </span>
                                  <span className="sm:hidden">رابط</span>
                                </a>
                              </div>
                            )}
                            {report.imageUrl && (
                              <div className="mb-3 w-full max-w-xs">
                                {/* Reserve height to prevent layout shift before image load */}
                                <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={report.imageUrl}
                                    alt="صورة البلاغ"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>
                                  {report.createdAt
                                    ?.toDate?.()
                                    ?.toLocaleDateString("ar-SA") ||
                                    new Date(
                                      report.createdAt
                                    ).toLocaleDateString("ar-SA")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaUser className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">
                                  مراجع من: {report.reviewedBy}
                                </span>
                                <span className="sm:hidden">
                                  {report.reviewedBy}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </InViewCard>
                  );
                })}
              </div>
            )}
          </AnimatedSection>
        )}

        {/* Features Grid */}
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InViewText
            className="text-center mb-8 sm:mb-12"
            margin="-20% 0px -20% 0px"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              المميزات الرئيسية
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              اكتشف كيف يمكنك المساهمة في مكافحة الإشاعات الكاذبة
            </p>
          </InViewText>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "16px",
              "@media (min-width: 640px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
              },
              "@media (min-width: 1024px)": {
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "32px",
              },
            }}
          >
            {features.map((feature, index) => (
              <InViewCard key={feature.name} className="group">
                <motion.div whileHover={{ y: -5 }} className="group">
                  <Link to={feature.href} className="block h-full">
                    <div
                      className={`h-full p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl ${feature.bgColor} border border-white/20 hover:shadow-2xl transition-all duration-300 group-hover:scale-105`}
                    >
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </InViewCard>
            ))}
          </div>
        </AnimatedSection>

        {/* How it Works */}
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedText className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              كيف يعمل النظام؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              خطوات بسيطة لمكافحة الإشاعات الكاذبة
            </p>
          </AnimatedText>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <AnimatedCard delay={0.1}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaFileAlt className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  1. إرسال البلاغ
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  أرسل رابط أو صورة للإشاعة المشكوك فيها مع وصف مختصر
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaShieldAlt className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  2. المراجعة
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  تقوم الإدارة بفحص البلاغ وتحديد ما إذا كانت الإشاعة صحيحة أم
                  كاذبة
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaStar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  3. النقاط
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  احصل على نقاط مقابل كل رد صحيح على الإشاعات الكاذبة
                </p>
              </div>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Call to Action */}
        {!user && (
          <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <InViewCard>
              <div className="text-center py-16 px-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <FaHeart className="w-12 h-12 text-red-400" />
                  </div>
                  <h2 className="text-4xl font-bold mb-6">
                    انضم إلى مجتمع مكافحة الإشاعات
                  </h2>
                  <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                    ساهم في بناء مجتمع أكثر وعياً وثقافة من خلال مكافحة الإشاعات
                    الكاذبة
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <FaLightbulb className="text-2xl" />
                      ابدأ الآن مجاناً
                    </Link>
                  </motion.div>
                </div>
              </div>
            </InViewCard>
          </AnimatedSection>
        )}
      </div>
    </GradientBackground>
  );
});

export default Home;
