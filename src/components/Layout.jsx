import React from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "react-icons/fa";
import { AnimatedCard, GradientBackground } from "./Animations";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

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

  return (
    <GradientBackground className="min-h-screen">
      <div className="flex flex-col lg:flex-row h-screen" dir="rtl">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-72 bg-white/10 backdrop-blur-lg border-l border-white/20 p-4 lg:h-screen lg:overflow-y-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Link
              to="/"
              className="flex items-center space-x-3 space-x-reverse"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">م</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  منصة منع الإشاعات
                </h1>
                <p className="text-sm text-gray-600">مجتمع مكافحة الإشاعات</p>
              </div>
            </Link>
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FaUser className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.role === "user" && (
                    <div className="flex items-center mt-1">
                      <FaStar className="w-4 h-4 text-yellow-500 ml-1" />
                      <span className="text-sm font-medium text-gray-700">
                        {user.totalPoints} نقطة
                      </span>
                    </div>
                  )}
                </div>
                {user.role === "admin" && (
                  <div className="flex items-center">
                    <FaShieldAlt className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600 mr-1">
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
                    className={`flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/20 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
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
                onClick={logout}
                className="w-full flex items-center space-x-3 space-x-reverse px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
              >
                <FaSignOutAlt className="w-5 h-5" />
                <span className="font-medium">تسجيل الخروج</span>
              </button>
            </motion.div>
          )}
        </motion.aside>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-1 p-4 lg:p-6 lg:h-screen lg:overflow-y-auto"
        >
          <AnimatedCard>{children}</AnimatedCard>
        </motion.main>
      </div>
    </GradientBackground>
  );
};

export default Layout;
