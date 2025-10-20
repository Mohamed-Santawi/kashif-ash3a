import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaHome,
  FaFileAlt,
  FaUser,
  FaBell,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaShieldAlt,
  FaUsers,
  FaStar,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { AnimatedCard, GradientBackground } from "./Animations";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [livePoints, setLivePoints] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen for unread notifications count
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id || user.uid),
      where("read", "==", false)
    );

    const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
      setUnreadNotifications(snapshot.docs.length);
    });

    // Listen for live points from Firestore
    const userId = user.id || user.uid;
    console.log(
      "🔍 DEBUG Layout - Setting up points listener for user:",
      userId
    );
    console.log("🔍 DEBUG Layout - Full user object:", user);

    let unsubscribePoints = null;

    // Only listen to Firestore if it's a real Firebase UID (not fallback auth)
    if (!userId.startsWith("user-") && !userId.startsWith("admin-")) {
      console.log(
        "🔍 DEBUG Layout - Using Firestore listener for real Firebase UID"
      );
      try {
        const userDocRef = doc(db, "users", userId);
        unsubscribePoints = onSnapshot(userDocRef, (snap) => {
          console.log("🔍 DEBUG Layout - Points listener fired:", {
            exists: snap.exists(),
            data: snap.exists() ? snap.data() : null,
            userId: userId,
          });
          if (snap.exists()) {
            const data = snap.data();
            const points = data.totalPoints || 0;
            console.log("🔍 DEBUG Layout - Setting livePoints to:", points);
            setLivePoints(points);
          } else {
            console.log(
              "🔍 DEBUG Layout - User document doesn't exist in Firestore"
            );
            setLivePoints(0);
          }
        });
      } catch (e) {
        console.error("🔍 DEBUG Layout - Error setting up points listener:", e);
        setLivePoints(user.totalPoints || 0);
      }
    } else {
      console.log(
        "🔍 DEBUG Layout - Using fallback auth, points from localStorage:",
        user.totalPoints
      );
      // For fallback auth, use localStorage points
      setLivePoints(user.totalPoints || 0);
    }

    return () => {
      unsubscribeNotifications();
      if (unsubscribePoints) unsubscribePoints();
    };
  }, [user]);

  const navigation = [
    { name: "الرئيسية", href: "/", icon: FaHome },
    { name: "إرسال بلاغ", href: "/report", icon: FaFileAlt },
    { name: "الملف الشخصي", href: "/profile", icon: FaUser },
    { name: "الإشعارات", href: "/notifications", icon: FaBell },
    { name: "الإحصائيات", href: "/statistics", icon: FaChartLine },
  ];

  const adminNavigation = [
    { name: "لوحة التحكم", href: "/admin", icon: FaCog },
    { name: "مراجعة البلاغات", href: "/admin/reports", icon: FaFileAlt },
    { name: "إدارة الأعضاء", href: "/admin/users", icon: FaUsers },
    { name: "الإحصائيات العامة", href: "/admin/statistics", icon: FaChartLine },
  ];

  const currentNavigation =
    user?.role === "admin" ? adminNavigation : navigation;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate even if logout fails
      navigate("/login", { replace: true });
    }
  };

  return (
    <GradientBackground className="min-h-screen">
      <div className="flex flex-col min-h-screen" dir="rtl">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/10 backdrop-blur-lg border-b border-white/20 p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                منصة منع الإشاعات
              </h1>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            {sidebarOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-full lg:w-72 bg-white/10 backdrop-blur-lg border-l border-white/20 p-4 lg:min-h-screen lg:sticky lg:top-0 lg:self-start ${
              sidebarOpen
                ? "fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto"
                : "hidden lg:block"
            }`}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center space-x-3 space-x-reverse"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">م</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold mr-2 text-gray-900">
                      منصة منع الإشاعات
                    </h1>
                    <p className="text-sm mr-2 text-gray-600">
                      مجتمع مكافحة الإشاعات
                    </p>
                  </div>
                </Link>
                {/* Mobile Close Button */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* User Info */}
            {user && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 p-3 bg-white/20 rounded-xl border border-white/30"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base mr-2 text-gray-900 truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs sm:text-sm mr-2 text-gray-600 truncate">
                      {user.email}
                    </p>
                    {user.role === "user" && (
                      <div className="flex items-center mt-1">
                        <FaStar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-yellow-500 ml-1" />
                        <span className="text-xs sm:text-sm mr-2 font-medium text-gray-700">
                          {livePoints} نقطة
                        </span>
                      </div>
                    )}
                  </div>
                  {user.role === "admin" && (
                    <div className="flex items-center flex-shrink-0">
                      <FaShieldAlt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium text-blue-600 mr-1">
                        مدير
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <motion.nav
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-1"
            >
              {currentNavigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center text-base sm:text-lg space-x-3 space-x-reverse px-3 py-2 rounded-lg transition-all duration-300 relative ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-white/20 hover:text-gray-900"
                      }`}
                    >
                      <div className="relative">
                        <item.icon
                          className={`w-4 h-4 sm:w-5 sm:h-5 ml-2 ${
                            isActive ? "text-white" : "text-gray-500"
                          }`}
                        />
                        {item.name === "الإشعارات" &&
                          unreadNotifications > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold"
                            >
                              {unreadNotifications > 99
                                ? "99+"
                                : unreadNotifications}
                            </motion.div>
                          )}
                      </div>
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute right-0 w-1 h-6 sm:h-8 bg-white rounded-l-full"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Logout Button */}
            {user && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6"
              >
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full cursor-pointer flex items-center space-x-3 space-x-reverse px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                >
                  <FaSignOutAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-base sm:text-lg font-medium mr-2">
                    تسجيل الخروج
                  </span>
                </button>
              </motion.div>
            )}
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-1 p-3 sm:p-4 lg:p-6"
          >
            <AnimatedCard>{children}</AnimatedCard>
          </motion.main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </GradientBackground>
  );
};

export default Layout;
