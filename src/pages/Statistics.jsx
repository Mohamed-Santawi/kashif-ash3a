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
  FaCrown,
  FaMedal,
  FaAward,
} from "react-icons/fa";
import {
  AnimatedCard,
  AnimatedText,
  GradientBackground,
  GlassCard,
  AnimatedCounter,
  InViewCard,
  InViewText,
} from "../components/Animations";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  doc,
} from "firebase/firestore";
import { db } from "../utils/firebase";

const Statistics = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("week");
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    correctReports: 0,
    incorrectReports: 0,
    totalPoints: user?.totalPoints || 0,
    accuracy: 0,
    rank: 0,
    totalUsers: 0,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [weeklyData, setWeeklyData] = useState([
    { day: "السبت", reports: 0, points: 0 },
    { day: "الأحد", reports: 0, points: 0 },
    { day: "الاثنين", reports: 0, points: 0 },
    { day: "الثلاثاء", reports: 0, points: 0 },
    { day: "الأربعاء", reports: 0, points: 0 },
    { day: "الخميس", reports: 0, points: 0 },
    { day: "الجمعة", reports: 0, points: 0 },
  ]);
  const [monthlyData, setMonthlyData] = useState([
    { month: "يناير", reports: 0, points: 0 },
    { month: "فبراير", reports: 0, points: 0 },
    { month: "مارس", reports: 0, points: 0 },
    { month: "أبريل", reports: 0, points: 0 },
    { month: "مايو", reports: 0, points: 0 },
    { month: "يونيو", reports: 0, points: 0 },
    { month: "يوليو", reports: 0, points: 0 },
    { month: "أغسطس", reports: 0, points: 0 },
    { month: "سبتمبر", reports: 0, points: 0 },
    { month: "أكتوبر", reports: 0, points: 0 },
    { month: "نوفمبر", reports: 0, points: 0 },
    { month: "ديسمبر", reports: 0, points: 0 },
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Listen for user reports
    const reportsQuery = query(
      collection(db, "reports"),
      where("submittedBy", "==", user.id)
    );

    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      const reports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt in descending order (most recent first)
      const sortedReports = reports.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });

      const totalReports = sortedReports.length;
      const correctReports = sortedReports.filter(
        (r) => r.status === "approved"
      ).length;
      const incorrectReports = sortedReports.filter(
        (r) => r.status === "rejected"
      ).length;
      const accuracy =
        totalReports > 0
          ? Math.round((correctReports / totalReports) * 100)
          : 0;

      setUserStats((prev) => ({
        ...prev,
        totalReports,
        correctReports,
        incorrectReports,
        accuracy,
      }));

      // ---- Build dynamic weekly data (last 7 days) ----
      const arDays = [
        "الأحد",
        "الاثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ]; // JS getDay(): 0 Sunday ... 6 Saturday
      const weekTemplate = [
        { day: "السبت", reports: 0, points: 0 },
        { day: "الأحد", reports: 0, points: 0 },
        { day: "الاثنين", reports: 0, points: 0 },
        { day: "الثلاثاء", reports: 0, points: 0 },
        { day: "الأربعاء", reports: 0, points: 0 },
        { day: "الخميس", reports: 0, points: 0 },
        { day: "الجمعة", reports: 0, points: 0 },
      ];

      const now = new Date();
      const sevenDaysAgo = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 6
      );
      const weekBuckets = [...weekTemplate];

      sortedReports.forEach((r) => {
        const created = r.createdAt?.toDate?.() || new Date(r.createdAt);
        if (created >= sevenDaysAgo && created <= now) {
          const dayIndex = created.getDay(); // 0..6
          const arName = arDays[dayIndex];
          const bucketIndex = weekBuckets.findIndex((d) => d.day === arName);
          if (bucketIndex !== -1) {
            weekBuckets[bucketIndex].reports += 1;
            if (r.status === "approved")
              weekBuckets[bucketIndex].points += r.pointsAwarded || 10;
          }
        }
      });

      setWeeklyData(weekBuckets);

      // ---- Build dynamic monthly data for current year ----
      const months = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ];
      const yearBuckets = months.map((m) => ({
        month: m,
        reports: 0,
        points: 0,
      }));
      sortedReports.forEach((r) => {
        const created = r.createdAt?.toDate?.() || new Date(r.createdAt);
        const mIndex = created.getMonth();
        yearBuckets[mIndex].reports += 1;
        if (r.status === "approved")
          yearBuckets[mIndex].points += r.pointsAwarded || 10;
      });
      setMonthlyData(yearBuckets);
    });

    // Listen for leaderboard (top 10 users) and user points
    const leaderboardQuery = query(collection(db, "users"), limit(10));

    const unsubscribeLeaderboard = onSnapshot(leaderboardQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by totalPoints in descending order (highest first)
      const sortedUsers = users.sort((a, b) => {
        const aPoints = a.totalPoints || 0;
        const bPoints = b.totalPoints || 0;
        return bPoints - aPoints;
      });

      // Add rank to sorted users
      const rankedUsers = sortedUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

      setLeaderboard(rankedUsers);

      // Find current user's rank
      const userRank = rankedUsers.findIndex((u) => u.id === user.id) + 1;
      setUserStats((prev) => ({
        ...prev,
        rank: userRank || rankedUsers.length + 1,
        totalUsers: rankedUsers.length,
      }));

      setLoading(false);
      setInitialized(true);
    });

    // Listen to current user document for live totalPoints
    const userDocRef = doc(db, "users", user.id);
    const userDocUnsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserStats((prev) => ({
          ...prev,
          totalPoints: data.totalPoints || 0,
        }));
      }
    });

    return () => {
      unsubscribeReports();
      unsubscribeLeaderboard();
      userDocUnsub();
    };
  }, [user]);

  if (authLoading || loading) {
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

  const stats = userStats;

  const currentData = timeRange === "week" ? weeklyData : monthlyData;
  const maxReports = Math.max(...currentData.map((d) => d.reports));
  const maxPoints = Math.max(...currentData.map((d) => d.points));

  return (
    <GradientBackground className="min-h-screen">
      <div className="space-y-8" dir="rtl">
        {!initialized && (
          <div className="max-w-7xl mx-auto px-4">
            <GlassCard className="p-6 rounded-2xl">
              <p className="text-gray-600">جاري تهيئة الصفحة...</p>
            </GlassCard>
          </div>
        )}
        {/* Header */}
        <div>
          <InViewCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
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
          </InViewCard>
        </div>

        {/* Stats Cards */}
        <div>
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
                value: `${
                  Number.isFinite(stats.accuracy)
                    ? Math.round(stats.accuracy)
                    : 0
                }%`,
                icon: FaTrophy,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                change: "+5%",
                trend: "up",
              },
            ].map((stat, index) => (
              <InViewCard key={stat.name}>
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
                      {typeof stat.value === "number" ? (
                        <AnimatedCounter value={stat.value} />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </GlassCard>
              </InViewCard>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reports Chart */}
          <div>
            <InViewCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
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
            </InViewCard>
          </div>

          {/* Points Chart */}
          <div>
            <InViewCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
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
            </InViewCard>
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <InViewCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
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
                  key={user.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    user.id === user.id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
                      : user.rank <= 3
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
                      {user.rank === 1 && <FaCrown className="w-5 h-5" />}
                      {user.rank === 2 && <FaMedal className="w-5 h-5" />}
                      {user.rank === 3 && <FaAward className="w-5 h-5" />}
                      {user.rank > 3 && user.rank}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {user.name || user.email}
                        {user.id === user.id && (
                          <span className="text-blue-600 text-sm mr-2">
                            (أنت)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.totalReports || 0} بلاغ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {user.totalPoints || 0} نقطة
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

            {/* Current User Rank */}
            {stats.rank > 10 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {stats.rank}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">رتبتك الحالية</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {stats.totalPoints} نقطة
                    </p>
                    <p className="text-sm text-gray-600">
                      من أصل {stats.totalUsers} مستخدم
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </InViewCard>
        </div>
      </div>
    </GradientBackground>
  );
};

export default Statistics;
