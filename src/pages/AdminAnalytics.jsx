import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  FaChartBar,
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaStar,
} from "react-icons/fa";
import { AnimatedCard, GlassCard } from "../components/Animations";
import AdminLayout from "../components/AdminLayout";

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    pendingReports: 0,
    totalUsers: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get reports stats
        const reportsSnapshot = await getDocs(collection(db, "reports"));
        const reports = reportsSnapshot.docs.map((doc) => doc.data());

        // Get users stats
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => doc.data());

        const totalReports = reports.length;
        const approvedReports = reports.filter(
          (r) => r.status === "approved"
        ).length;
        const rejectedReports = reports.filter(
          (r) => r.status === "rejected"
        ).length;
        const pendingReports = reports.filter(
          (r) => r.status === "pending"
        ).length;
        const totalUsers = users.length;
        const totalPoints = users.reduce(
          (sum, user) => sum + (user.totalPoints || 0),
          0
        );

        setStats({
          totalReports,
          approvedReports,
          rejectedReports,
          pendingReports,
          totalUsers,
          totalPoints,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
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
                جاري تحميل التحليلات...
              </h2>
            </GlassCard>
          </AnimatedCard>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "إجمالي البلاغات",
      value: stats.totalReports,
      icon: FaFileAlt,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      title: "البلاغات الموافق عليها",
      value: stats.approvedReports,
      icon: FaCheckCircle,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      title: "البلاغات المرفوضة",
      value: stats.rejectedReports,
      icon: FaTimesCircle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
    },
    {
      title: "البلاغات في الانتظار",
      value: stats.pendingReports,
      icon: FaClock,
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers,
      icon: FaUsers,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
    },
    {
      title: "إجمالي النقاط",
      value: stats.totalPoints,
      icon: FaStar,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-700",
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            التحليلات والإحصائيات
          </h1>
          <p className="text-xl text-gray-600">
            نظرة شاملة على أداء النظام والمستخدمين
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard key={stat.title}>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </GlassCard>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Approval Rate */}
          <AnimatedCard>
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                معدل الموافقة
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.totalReports > 0
                    ? Math.round(
                        (stats.approvedReports / stats.totalReports) * 100
                      )
                    : 0}
                  %
                </div>
                <p className="text-gray-600">
                  من إجمالي البلاغات تمت الموافقة عليها
                </p>
              </div>
            </GlassCard>
          </AnimatedCard>

          {/* Average Points per User */}
          <AnimatedCard>
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                متوسط النقاط لكل مستخدم
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.totalUsers > 0
                    ? Math.round(stats.totalPoints / stats.totalUsers)
                    : 0}
                </div>
                <p className="text-gray-600">نقطة في المتوسط لكل مستخدم</p>
              </div>
            </GlassCard>
          </AnimatedCard>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
