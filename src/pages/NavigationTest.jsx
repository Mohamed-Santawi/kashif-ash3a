import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NavigationTest = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          اختبار التنقل
        </h1>

        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            صفحة تسجيل الدخول
          </Link>

          <Link
            to="/register"
            className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
          >
            صفحة التسجيل
          </Link>

          <Link
            to="/register-test"
            className="block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors"
          >
            صفحة التسجيل التجريبية
          </Link>

          <Link
            to="/admin/login"
            className="block w-full bg-red-600 text-white text-center py-3 px-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            صفحة تسجيل دخول المدير
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          اضغط على الروابط أعلاه لاختبار التنقل
        </div>
      </motion.div>
    </div>
  );
};

export default NavigationTest;

