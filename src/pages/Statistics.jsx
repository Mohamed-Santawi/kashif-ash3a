import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaTrophy,
  FaStar,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  GradientBackground,
  GlassCard,
  AnimatedCounter,
} from "../components/Animations";

const Statistics = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

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

  const stats = {
    totalReports: 24,
    correctReports: 18,
    incorrectReports: 6,
    totalPoints: user?.totalPoints || 0,
    accuracy: 75,
    rank: 15,
    totalUsers: 150,
  };

  const weeklyData = [
    { day: "السبت", reports: 3, points: 15 },
    { day: "الأحد", reports: 5, points: 25 },
    { day: "الاثنين", reports: 2, points: 10 },
    { day: "الثلاثاء", reports: 4, points: 20 },
    { day: "الأربعاء", reports: 6, points: 30 },
    { day: "الخميس", reports: 3, points: 15 },
    { day: "الجمعة", reports: 1, points: 5 },
  ];

  const monthlyData = [
    { month: "يناير", reports: 45, points: 225 },
    { month: "فبراير", reports: 52, points: 260 },
    { month: "مارس", reports: 38, points: 190 },
    { month: "أبريل", reports: 61, points: 305 },
    { month: "مايو", reports: 48, points: 240 },
    { month: "يونيو", reports: 55, points: 275 },
  ];

  const leaderboard = [
    { rank: 1, name: "أحمد محمد", points: 450, reports: 25 },
    { rank: 2, name: "فاطمة علي", points: 420, reports: 23 },
    { rank: 3, name: "محمد حسن", points: 380, reports: 21 },
    { rank: 4, name: "سارة أحمد", points: 350, reports: 19 },
    { rank: 5, name: "علي محمود", points: 320, reports: 18 },
  ];

  const currentData = timeRange === "week" ? weeklyData : monthlyData;
  const maxReports = Math.max(...currentData.map((d) => d.reports));
  const maxPoints = Math.max(...currentData.map((d) => d.points));

  return (
    <GradientBackground className="min-h-screen">
      <div className="space-y-8" dir="rtl">
        {/* Header */}
        <AnimatedSection>
          <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center"
                >
                  <FaChartLine className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    الإحصائيات الشخصية
                  </motion.h1>
                  <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-gray-600"
                  >
                    تابع أداءك في مكافحة الإشاعات
                  </motion.p>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { key: "week", label: "أسبوع" },
                  { key: "month", label: "شهر" },
                ].map((option) => (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeRange(option.key)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      timeRange === option.key
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-white/50 text-gray-700 hover:bg-white/70"
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Stats Cards */}
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "إجمالي البلاغات",
                value: stats.totalReports,
                icon: FaFileAlt,
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                change: "+12%",
                trend: "up",
              },
              {
                name: "البلاغات الصحيحة",
                value: stats.correctReports,
                icon: FaCheckCircle,
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-50",
                change: "+8%",
                trend: "up",
              },
              {
                name: "إجمالي النقاط",
                value: stats.totalPoints,
                icon: FaStar,
                color: "from-yellow-500 to-orange-500",
                bgColor: "bg-yellow-50",
                change: "+15%",
                trend: "up",
              },
              {
                name: "دقة التقدير",
                value: `${stats.accuracy}%`,
                icon: FaTrophy,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                change: "+5%",
                trend: "up",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <GlassCard
                  className={`p-6 rounded-2xl ${stat.bgColor} border border-white/20 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}
                    >
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" && (
                        <FaArrowUp className="w-4 h-4 text-green-600" />
                      )}
                      {stat.trend === "down" && (
                        <FaArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      {stat.trend === "neutral" && (
                        <FaMinus className="w-4 h-4 text-gray-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter
                        value={typeof stat.value === "number" ? stat.value : 0}
                      />
                      {typeof stat.value === "string" &&
                      stat.value.includes("%")
                        ? stat.value
                        : ""}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reports Chart */}
          <AnimatedSection>
            <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
              >
                <FaChartBar className="w-6 h-6 text-blue-600" />
                البلاغات حسب {timeRange === "week" ? "الأسبوع" : "الشهر"}
              </motion.h2>
              <div className="space-y-4">
                {currentData.map((data, index) => (
                  <motion.div
                    key={data.day || data.month}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          {data.day || data.month}
                        </span>
                        <span className="text-sm text-gray-500">
                          {data.reports} بلاغ
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(data.reports / maxReports) * 100}%`,
                          }}
                          transition={{
                            delay: 0.5 + index * 0.1,
                            duration: 0.8,
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Points Chart */}
          <AnimatedSection>
            <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
              >
                <FaChartPie className="w-6 h-6 text-green-600" />
                النقاط حسب {timeRange === "week" ? "الأسبوع" : "الشهر"}
              </motion.h2>
              <div className="space-y-4">
                {currentData.map((data, index) => (
                  <motion.div
                    key={data.day || data.month}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          {data.day || data.month}
                        </span>
                        <span className="text-sm text-gray-500">
                          {data.points} نقطة
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(data.points / maxPoints) * 100}%`,
                          }}
                          transition={{
                            delay: 0.5 + index * 0.1,
                            duration: 0.8,
                          }}
                          className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>

        {/* Leaderboard */}
        <AnimatedSection>
          <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
            >
              <FaTrophy className="w-6 h-6 text-yellow-600" />
              لوحة المتصدرين
            </motion.h2>
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    user.rank <= 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                      : "bg-white/50 border border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        user.rank === 1
                          ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                          : user.rank === 2
                          ? "bg-gradient-to-br from-gray-400 to-gray-500"
                          : user.rank === 3
                          ? "bg-gradient-to-br from-orange-600 to-red-500"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                      }`}
                    >
                      {user.rank}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">
                        {user.reports} بلاغ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {user.points} نقطة
                    </p>
                    {user.rank <= 3 && (
                      <p className="text-sm text-yellow-600 font-medium">
                        متصدر
                      </p>
                    )}
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

export default Statistics;
