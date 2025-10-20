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
    <div className="h-screen bg-gray-50 flex" dir="rtl">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-2xl lg:static lg:z-auto lg:shadow-none lg:w-64">
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">لوحة الإدارة</h2>
              {currentAdmin && (
                <p className="text-sm text-gray-600 mt-1">
                  مرحباً، {currentAdmin.name || "مدير عام"}
                </p>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors duration-200 ${
                    active
                      ? "bg-blue-100 text-blue-700 border-r-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </motion.button>
              );
            })}

            {/* Logout button */}
            <motion.button
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 mt-4"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </motion.button>
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FaBars className="w-6 h-6" />
              </button>
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
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
