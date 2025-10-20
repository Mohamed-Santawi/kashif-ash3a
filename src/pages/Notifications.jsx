import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaStar,
  FaCalendarAlt,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  GradientBackground,
  GlassCard,
} from "../components/Animations";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [modalReport, setModalReport] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Listen for notifications
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id || user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt in descending order (most recent first)
      const sortedNotifications = notificationList.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });

      setNotifications(sortedNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      const promises = unreadNotifications.map((notification) =>
        updateDoc(doc(db, "notifications", notification.id), {
          read: true,
          readAt: new Date(),
        })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "report_approved":
        return FaCheckCircle;
      case "report_rejected":
        return FaTimesCircle;
      case "points_earned":
        return FaStar;
      case "warning":
        return FaExclamationTriangle;
      default:
        return FaInfoCircle;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "report_approved":
        return "from-green-500 to-green-600";
      case "report_rejected":
        return "from-red-500 to-red-600";
      case "points_earned":
        return "from-yellow-500 to-orange-500";
      case "warning":
        return "from-orange-500 to-red-500";
      default:
        return "from-blue-500 to-blue-600";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
                  className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
                >
                  <FaBell className="w-8 h-8 text-white" />
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
                      : "لا توجد إشعارات جديدة"}
                  </motion.p>
                </div>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    تعيين الكل كمقروء
                  </motion.button>
                )}
                {[
                  { key: "all", label: "الكل" },
                  { key: "unread", label: "غير مقروء" },
                  { key: "read", label: "مقروء" },
                ].map((option) => (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(option.key)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      filter === option.key
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

        {/* Notifications List */}
        <AnimatedSection>
          {filteredNotifications.length === 0 ? (
            <GlassCard className="p-12 text-center rounded-3xl shadow-2xl border border-white/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaBell className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600 text-lg">
                {filter === "unread"
                  ? "لا توجد إشعارات غير مقروءة"
                  : filter === "read"
                  ? "لا توجد إشعارات مقروءة"
                  : "لم تتلق أي إشعارات بعد"}
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -2 }}
                  >
                    <GlassCard
                      className={`relative p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
                        !notification.read
                          ? "bg-blue-50/60 border-blue-200 ring-1 ring-blue-200"
                          : "bg-white/50 border-white/20"
                      }`}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-l-2xl" />
                      )}
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white flex-shrink-0`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <h3
                                  className={`text-lg font-bold ${
                                    !notification.read
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                                    غير مقروء
                                  </span>
                                )}
                                {!notification.read && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => markAsRead(notification.id)}
                                    className="ml-2 px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    تعيين كمقروء
                                  </motion.button>
                                )}
                              </div>
                              <p className="text-gray-600 mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <FaCalendarAlt className="w-4 h-4" />
                                  <span>
                                    {notification.createdAt
                                      ?.toDate?.()
                                      ?.toLocaleDateString("ar-SA") ||
                                      new Date(
                                        notification.createdAt
                                      ).toLocaleDateString("ar-SA")}
                                  </span>
                                </div>
                                {notification.points && (
                                  <div className="flex items-center gap-1 text-yellow-600">
                                    <FaStar className="w-4 h-4" />
                                    <span>+{notification.points} نقطة</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={async () => {
                                  markAsRead(notification.id);
                                  if (notification.reportId) {
                                    try {
                                      const ref = doc(
                                        db,
                                        "reports",
                                        notification.reportId
                                      );
                                      const snap = await getDoc(ref);
                                      if (snap.exists()) {
                                        setModalReport({
                                          id: snap.id,
                                          ...snap.data(),
                                        });
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error fetching report:",
                                        error
                                      );
                                    }
                                  }
                                }}
                                className="p-2 text-blue-600 cursor-pointer hover:bg-blue-100 rounded-lg transition-colors"
                                title="عرض البلاغ"
                              >
                                <FaEye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-2 text-red-600 cursor-pointer hover:bg-red-100 rounded-lg transition-colors"
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
              })}
            </div>
          )}
        </AnimatedSection>

        {modalReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 w-full max-w-7xl max-h-[95vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-gray-900">
                  تفاصيل البلاغ
                </h3>
                <button
                  onClick={() => setModalReport(null)}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Text Content */}
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      رابط الإشاعة:
                    </p>
                    {modalReport.rumorUrl ? (
                      <a
                        href={modalReport.rumorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all text-lg underline"
                      >
                        {modalReport.rumorUrl}
                      </a>
                    ) : (
                      <span className="text-gray-500 text-lg">لا يوجد</span>
                    )}
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-3">
                      الوصف:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed">
                        {modalReport.description || "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-3">
                      تاريخ الإرسال:
                    </p>
                    <p className="text-gray-600 text-lg">
                      {modalReport.createdAt
                        ?.toDate?.()
                        ?.toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) ||
                        new Date(modalReport.createdAt).toLocaleDateString(
                          "ar-SA",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                    </p>
                  </div>
                </div>

                {/* Right Column - Image */}
                <div className="space-y-6">
                  {modalReport.imageUrl && (
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-3">
                        الصورة:
                      </p>
                      <div className="flex justify-center">
                        <img
                          src={modalReport.imageUrl}
                          alt="صورة البلاغ"
                          className="max-w-full h-auto rounded-lg shadow-lg"
                          style={{ maxHeight: "500px" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </GradientBackground>
  );
};

export default Notifications;
