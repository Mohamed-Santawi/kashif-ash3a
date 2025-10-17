import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBell,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaStar,
  FaFileAlt,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  GradientBackground,
  GlassCard,
} from "../components/Animations";

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "بلاغ جديد يحتاج مراجعة",
      message: "تم إرسال بلاغ جديد حول إشاعة كاذبة في وسائل التواصل الاجتماعي",
      type: "report",
      time: "منذ 5 دقائق",
      read: false,
      priority: "high",
    },
    {
      id: 2,
      title: "حصلت على نقاط جديدة!",
      message: "تم منحك 10 نقاط مقابل ردك الصحيح على إشاعة كاذبة",
      type: "points",
      time: "منذ ساعة",
      read: false,
      priority: "medium",
    },
    {
      id: 3,
      title: "إشاعة جديدة للرد عليها",
      message: "هناك إشاعة جديدة تحتاج إلى رد منك في قسم الإشاعات",
      type: "rumor",
      time: "منذ 3 ساعات",
      read: true,
      priority: "low",
    },
    {
      id: 4,
      title: "تم قبول بلاغك",
      message: "تم قبول البلاغ الذي أرسلته حول الإشاعة الكاذبة",
      type: "success",
      time: "منذ يوم",
      read: true,
      priority: "medium",
    },
    {
      id: 5,
      title: "تحديث النظام",
      message: "تم إضافة ميزات جديدة إلى منصة مكافحة الإشاعات",
      type: "info",
      time: "منذ يومين",
      read: true,
      priority: "low",
    },
  ]);

  const [filter, setFilter] = useState("all");

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "report":
        return FaFileAlt;
      case "points":
        return FaStar;
      case "rumor":
        return FaExclamationTriangle;
      case "success":
        return FaCheck;
      case "info":
        return FaInfoCircle;
      default:
        return FaBell;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === "high") return "from-red-500 to-red-600";
    if (priority === "medium") return "from-yellow-500 to-orange-500";
    return "from-blue-500 to-blue-600";
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((notif) => !notif.read).length;

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
                  className="relative"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <FaBell className="w-8 h-8 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    >
                      {unreadCount}
                    </motion.div>
                  )}
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    الإشعارات
                  </motion.h1>
                  <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-gray-600"
                  >
                    {unreadCount > 0
                      ? `${unreadCount} إشعار غير مقروء`
                      : "جميع الإشعارات مقروءة"}
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                <FaCheck className="w-5 h-5" />
                تعيين الكل كمقروء
              </motion.button>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Filter Buttons */}
        <AnimatedSection>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            {[
              { key: "all", label: "الكل", count: notifications.length },
              { key: "unread", label: "غير مقروء", count: unreadCount },
              {
                key: "read",
                label: "مقروء",
                count: notifications.length - unreadCount,
              },
            ].map((filterOption) => (
              <motion.button
                key={filterOption.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterOption.key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === filterOption.key
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/50 text-gray-700 hover:bg-white/70"
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </motion.button>
            ))}
          </div>
        </AnimatedSection>

        {/* Notifications List */}
        <AnimatedSection>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <GlassCard className="p-8 rounded-3xl shadow-2xl border border-white/20 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FaBell className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  لا توجد إشعارات
                </h3>
                <p className="text-gray-600">
                  لا توجد إشعارات تطابق الفلتر المحدد
                </p>
              </GlassCard>
            ) : (
              filteredNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -2 }}
                  >
                    <GlassCard
                      className={`p-6 rounded-2xl shadow-xl border border-white/20 transition-all duration-300 ${
                        !notification.read
                          ? "bg-blue-50/80 border-blue-200"
                          : "bg-white/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${getNotificationColor(
                            notification.type,
                            notification.priority
                          )} text-white`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3
                                className={`text-lg font-bold mb-2 ${
                                  !notification.read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></span>
                                )}
                              </h3>
                              <p className="text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="تعيين كمقروء"
                                >
                                  <FaEye className="w-4 h-4" />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="حذف الإشعار"
                              >
                                <FaTrash className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </div>
        </AnimatedSection>
      </div>
    </GradientBackground>
  );
};

export default Notifications;
