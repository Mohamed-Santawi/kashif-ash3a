import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import {
  FaUsers,
  FaStar,
  FaFileAlt,
  FaCalendar,
  FaTrophy,
  FaMedal,
  FaAward,
} from "react-icons/fa";
import { AnimatedCard, GlassCard } from "../components/Animations";
import AdminLayout from "../components/AdminLayout";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("points"); // points, reports, name, date

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("🔍 Starting to fetch users...");

        // Get users from Firestore
        console.log("🔍 Fetching from users collection...");
        const usersSnapshot = await getDocs(collection(db, "users"));
        console.log(
          "🔍 Users collection:",
          usersSnapshot.docs.length,
          "documents"
        );

        let usersData = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("🔍 User from users collection:", doc.id, data);
          return {
            id: doc.id,
            ...data,
          };
        });

        // Always also check reports to get complete user data
        console.log("🔍 Fetching from reports collection...");
        const reportsSnapshot = await getDocs(collection(db, "reports"));
        console.log(
          "🔍 Reports collection:",
          reportsSnapshot.docs.length,
          "documents"
        );

        const uniqueUsers = new Map();

        // Add users from users collection
        usersData.forEach((user) => {
          uniqueUsers.set(user.id, user);
        });

        // Add users from reports collection
        reportsSnapshot.docs.forEach((doc) => {
          const reportData = doc.data();
          console.log("🔍 Report data:", doc.id, reportData);

          if (reportData.submittedBy) {
            if (!uniqueUsers.has(reportData.submittedBy)) {
              uniqueUsers.set(reportData.submittedBy, {
                id: reportData.submittedBy,
                email: reportData.submittedByEmail,
                name: reportData.submittedByName,
                totalPoints: 0,
                totalReports: 0,
                createdAt: reportData.createdAt,
              });
            }
          }
        });

        // Calculate points and reports for each user
        for (const [userId, userData] of uniqueUsers) {
          const userReports = reportsSnapshot.docs.filter(
            (doc) => doc.data().submittedBy === userId
          );

          userData.totalReports = userReports.length;
          userData.totalPoints = userReports.reduce((sum, doc) => {
            const reportData = doc.data();
            return sum + (reportData.pointsAwarded || 0);
          }, 0);

          console.log(
            "🔍 User stats:",
            userId,
            "Reports:",
            userData.totalReports,
            "Points:",
            userData.totalPoints
          );
        }

        usersData = Array.from(uniqueUsers.values());
        console.log("🔍 Final users data:", usersData);

        // Sort users based on selected criteria
        const sortedUsers = usersData.sort((a, b) => {
          switch (sortBy) {
            case "points":
              return (b.totalPoints || 0) - (a.totalPoints || 0);
            case "reports":
              return (b.totalReports || 0) - (a.totalReports || 0);
            case "name":
              return (a.name || "").localeCompare(b.name || "");
            case "date":
              return (
                new Date(b.createdAt?.toDate?.() || b.createdAt || 0) -
                new Date(a.createdAt?.toDate?.() || a.createdAt || 0)
              );
            default:
              return 0;
          }
        });

        setUsers(sortedUsers);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        console.error("❌ Error details:", error.code, error.message);
        console.error("❌ Full error object:", error);

        // If it's a permission error, show a helpful message
        if (error.code === "permission-denied") {
          console.error(
            "❌ Permission denied - check Firestore security rules"
          );
          console.error("❌ Current user:", auth.currentUser);
          console.error("❌ User email:", auth.currentUser?.email);
        }

        // Set some dummy data for testing
        console.log("🔧 Setting dummy data for testing...");
        setUsers([
          {
            id: "test-user-1",
            name: "مستخدم تجريبي",
            email: "test@example.com",
            totalPoints: 50,
            totalReports: 3,
            createdAt: new Date(),
          },
          {
            id: "test-user-2",
            name: "مستخدم تجريبي 2",
            email: "test2@example.com",
            totalPoints: 30,
            totalReports: 2,
            createdAt: new Date(),
          },
        ]);

        setLoading(false);
      }
    };

    fetchUsers();
  }, [sortBy]);

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <FaMedal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <FaAward className="w-5 h-5 text-orange-500" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">
        {index + 1}
      </span>
    );
  };

  const getRankColor = (index) => {
    if (index === 0) return "bg-yellow-100 border-yellow-300";
    if (index === 1) return "bg-gray-100 border-gray-300";
    if (index === 2) return "bg-orange-100 border-orange-300";
    return "bg-white border-gray-200";
  };

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
                جاري تحميل المستخدمين...
              </h2>
            </GlassCard>
          </AnimatedCard>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                إدارة المستخدمين
              </h1>
              <p className="text-lg text-gray-600">
                عرض وإدارة جميع المستخدمين مع ترتيبهم حسب النقاط
              </p>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                ترتيب حسب:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="points">النقاط</option>
                <option value="reports">عدد البلاغات</option>
                <option value="name">الاسم</option>
                <option value="date">تاريخ التسجيل</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <AnimatedCard>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    إجمالي المستخدمين
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <FaUsers className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </GlassCard>
          </AnimatedCard>

          <AnimatedCard>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    إجمالي البلاغات
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.reduce(
                      (sum, user) => sum + (user.totalReports || 0),
                      0
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <FaFileAlt className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </GlassCard>
          </AnimatedCard>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <AnimatedCard>
              <GlassCard className="p-10 text-center">
                <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  لا يوجد مستخدمين
                </h3>
                <p className="text-gray-600">لم يتم تسجيل أي مستخدمين بعد</p>
              </GlassCard>
            </AnimatedCard>
          ) : (
            users.map((user, index) => (
              <AnimatedCard key={user.id}>
                <GlassCard className={`p-6 border-2 ${getRankColor(index)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        {getRankIcon(index)}
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {user.name || "مستخدم غير محدد"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {user.email || user.id}
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg">
                            <FaStar className="w-5 h-5 text-yellow-600" />
                            <span className="text-lg font-bold text-yellow-700">
                              {user.totalPoints || 0} نقطة
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaFileAlt className="w-4 h-4 text-blue-500" />
                            <span>{user.totalReports || 0} بلاغ</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaCalendar className="w-4 h-4 text-green-500" />
                            <span>
                              {user.createdAt
                                ?.toDate?.()
                                ?.toLocaleDateString("ar-SA") ||
                                user.createdAt ||
                                "غير محدد"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Stats */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        #{index + 1}
                      </div>
                      <div className="text-sm text-gray-600">الترتيب العام</div>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedCard>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
