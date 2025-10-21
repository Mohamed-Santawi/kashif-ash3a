import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUsers,
  FaUserPlus,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

const AdminLayout = ({ children, currentAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationItems = [
    {
      name: "لوحة التحكم",
      path: "/admin/dashboard",
      icon: FaHome,
    },
    {
      name: "إدارة المديرين",
      path: "/admin/management",
      icon: FaUsers,
    },
    {
      name: "إدارة المستخدمين",
      path: "/admin/users",
      icon: FaUserPlus,
    },
    {
      name: "التحليلات",
      path: "/admin/analytics",
      icon: FaChartBar,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className="h-screen bg-gray-50 flex overflow-hidden"
      dir="rtl"
      style={{
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-72 sm:w-80 lg:w-64 bg-white shadow-2xl lg:shadow-none lg:static lg:z-auto ${
          sidebarOpen
            ? "fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto"
            : "hidden lg:block"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                لوحة الإدارة
              </h2>
              {currentAdmin && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  مرحباً، {currentAdmin.name || "مدير عام"}
                </p>
              )}
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-right transition-colors duration-200 ${
                    active
                      ? "bg-blue-100 text-blue-700 border-r-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">
                    {item.name}
                  </span>
                </motion.button>
              );
            })}

            {/* Logout button */}
            <motion.button
              onClick={() => {
                handleSignOut();
                setSidebarOpen(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 mt-4"
            >
              <FaSignOutAlt className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">
                تسجيل الخروج
              </span>
            </motion.button>
          </nav>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col overflow-hidden min-w-0"
        style={{
          maxWidth: "calc(100vw - 0px)",
          overflowX: "hidden",
        }}
      >
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between relative z-30">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">لوحة الإدارة</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-700 hover:text-gray-900 cursor-pointer z-40 relative"
          >
            {sidebarOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Top bar - Desktop only */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find((item) => isActive(item.path))?.name ||
                    "لوحة الإدارة"}
                </h1>
                {currentAdmin && (
                  <p className="text-sm text-gray-600 mt-1">
                    {currentAdmin.role === "super_admin"
                      ? "مدير عام"
                      : currentAdmin.role === "admin"
                      ? "مدير"
                      : currentAdmin.role === "moderator"
                      ? "مشرف"
                      : "مراقب"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentAdmin && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentAdmin.name || "مدير عام"}
                  </p>
                  <p className="text-xs text-gray-500">{currentAdmin.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 lg:ml-0"
          style={{
            maxWidth: "100%",
            overflowX: "hidden",
          }}
        >
          <div
            className="max-w-full lg:max-w-none w-full"
            style={{
              maxWidth: "100%",
              overflowX: "hidden",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
