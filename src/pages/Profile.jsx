import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot as onSnapshotCol,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  FaUser,
  FaEnvelope,
  FaStar,
  FaCalendarAlt,
  FaShieldAlt,
  FaEdit,
  FaCog,
  FaHistory,
  FaTrophy,
} from "react-icons/fa";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  GradientBackground,
  GlassCard,
} from "../components/Animations";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statsLive, setStatsLive] = useState({
    totalReports: 0,
    approvedReports: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Listen to users/{uid}
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.id || user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [user]);

  // Listen to reports stats for this user
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "reports"),
      where("submittedBy", "==", user.id || user.uid)
    );
    const unsub = onSnapshotCol(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const total = list.length;
      const approved = list.filter((r) => r.status === "approved").length;
      setStatsLive({ totalReports: total, approvedReports: approved });
    });
    return () => unsub();
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

  const stats = [
    {
      name: "إجمالي النقاط",
      value: profile?.totalPoints ?? 0,
      icon: FaStar,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
    },
    {
      name: "البلاغات المرسلة",
      value: statsLive.totalReports,
      icon: FaHistory,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "البلاغات الصحيحة",
      value: statsLive.approvedReports,
      icon: FaTrophy,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "مستوى الثقة",
      value:
        statsLive.totalReports > 0
          ? Math.round(
              ((statsLive.approvedReports || 0) /
                (statsLive.totalReports || 1)) *
                100
            ) + "%"
          : "—",
      icon: FaShieldAlt,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <GradientBackground className="min-h-screen">
      <div className="space-y-8" dir="rtl">
        {/* Profile Header */}
        <AnimatedSection>
          <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaUser className="w-16 h-16 text-white" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <FaEdit className="w-5 h-5 text-white" />
                </motion.button>
              </motion.div>

              <div className="flex-1 text-center lg:text-right">
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl font-bold text-gray-900 mb-2"
                >
                  {profile?.name || user?.name || "—"}
                </motion.h1>
                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-xl text-gray-600 mb-4 flex items-center justify-center lg:justify-start gap-2"
                >
                  <FaEnvelope className="w-5 h-5" />
                  {profile?.email || user?.email}
                </motion.p>
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center justify-center lg:justify-start gap-4"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold">
                    <FaStar className="w-5 h-5" />
                    {profile?.totalPoints ?? 0} نقطة
                  </div>
                  {(profile?.role || user?.role) === "admin" && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold">
                      <FaShieldAlt className="w-5 h-5" />
                      مدير النظام
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Edit name inline */}
              <div className="w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={profile?.name || ""}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...(p || {}),
                        name: e.target.value,
                      }))
                    }
                    placeholder="اسمك"
                    className="px-4 py-3 border rounded-lg w-full lg:w-64"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={saving || !profile}
                    onClick={async () => {
                      try {
                        setSaving(true);
                        const ref = doc(db, "users", user.id || user.uid);
                        await updateDoc(ref, { name: profile.name || "" });
                        // also update localStorage user for immediate reflection elsewhere
                        const stored = localStorage.getItem("user");
                        if (stored) {
                          const parsed = JSON.parse(stored);
                          parsed.name = profile.name || parsed.name;
                          localStorage.setItem("user", JSON.stringify(parsed));
                        }
                      } catch (e) {
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-60"
                  >
                    <FaCog className="w-5 h-5" />
                    {saving ? "جارٍ الحفظ..." : "حفظ"}
                  </motion.button>
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
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
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>

        {/* Recent Activity */}
        <AnimatedSection>
          <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              النشاط الأخير
            </motion.h2>
            <div className="space-y-4">
              {[
                {
                  action: "أرسلت بلاغ جديد",
                  time: "منذ ساعتين",
                  points: "+10",
                },
                {
                  action: "رد صحيح على إشاعة",
                  time: "منذ 5 ساعات",
                  points: "+5",
                },
                { action: "أرسلت بلاغ جديد", time: "منذ يوم", points: "+10" },
                {
                  action: "رد صحيح على إشاعة",
                  time: "منذ يومين",
                  points: "+5",
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {activity.time}
                    </span>
                    <span className="text-green-600 font-bold">
                      {activity.points}
                    </span>
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

export default Profile;
