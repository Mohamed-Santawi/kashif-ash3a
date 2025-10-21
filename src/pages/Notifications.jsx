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
          <GlassCard className="p-6 sm:p-8 lg:p-10 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              جاري التحميل...
            </h2>
          </GlassCard>
        </AnimatedCard>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground className="min-h-screen">
      <div
        className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6"
        dir="rtl"
        style={{
          maxWidth: "100vw",
          overflowX: "hidden",
          padding: "12px",
          "@media (min-width: 640px)": {
            padding: "16px",
          },
          "@media (min-width: 1024px)": {
            padding: "24px",
          },
        }}
      >
        {/* Header */}
        <AnimatedSection>
          <GlassCard
            className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20"
            style={{
              padding: "12px",
              borderRadius: "12px",
              "@media (min-width: 640px)": {
                padding: "16px",
                borderRadius: "16px",
              },
              "@media (min-width: 1024px)": {
                padding: "24px",
                borderRadius: "24px",
              },
            }}
          >
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
                "@media (min-width: 640px)": {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                },
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <FaBell className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate"
                  >
                    الإشعارات
                  </motion.h1>
                  <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-xs sm:text-sm lg:text-base text-gray-600 truncate"
                  >
                    {unreadCount > 0
                      ? `${unreadCount} إشعار غير مقروء`
                      : "لا توجد إشعارات جديدة"}
                  </motion.p>
                </div>
              </div>
              <div
                className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  width: "100%",
                  "@media (min-width: 640px)": {
                    gap: "8px",
                    width: "auto",
                  },
                }}
              >
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAllAsRead}
                    className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-xs sm:text-sm lg:text-base flex-shrink-0"
                  >
                    <span className="hidden sm:inline">تعيين الكل كمقروء</span>
                    <span className="sm:hidden">تعيين الكل</span>
                  </motion.button>
                )}
                {[
                  { key: "all", label: "الكل", shortLabel: "الكل" },
                  {
                    key: "unread",
                    label: "غير مقروء",
                    shortLabel: "غير مقروء",
                  },
                  { key: "read", label: "مقروء", shortLabel: "مقروء" },
                ].map((option) => (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(option.key)}
                    className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm lg:text-base flex-shrink-0 ${
                      filter === option.key
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-white/50 text-gray-700 hover:bg-white/70"
                    }`}
                  >
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">{option.shortLabel}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Notifications List */}
        <AnimatedSection>
          {filteredNotifications.length === 0 ? (
            <GlassCard className="p-8 sm:p-10 lg:p-12 text-center rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
              >
                <FaBell className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </motion.div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                لا توجد إشعارات
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                {filter === "unread"
                  ? "لا توجد إشعارات غير مقروءة"
                  : filter === "read"
                  ? "لا توجد إشعارات مقروءة"
                  : "لم تتلق أي إشعارات بعد"}
              </p>
            </GlassCard>
          ) : (
            <div
              className="space-y-3 sm:space-y-4"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                "@media (min-width: 640px)": {
                  gap: "16px",
                },
              }}
            >
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
                      className={`relative p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border transition-all duration-300 ${
                        !notification.read
                          ? "bg-blue-50/60 border-blue-200 ring-1 ring-blue-200"
                          : "bg-white/50 border-white/20"
                      }`}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        "@media (min-width: 640px)": {
                          padding: "16px",
                          borderRadius: "12px",
                        },
                        "@media (min-width: 1024px)": {
                          padding: "24px",
                          borderRadius: "16px",
                        },
                      }}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-l-lg sm:rounded-l-xl lg:rounded-l-2xl" />
                      )}
                      <div
                        className="flex items-start gap-2 sm:gap-3 lg:gap-4"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          "@media (min-width: 640px)": {
                            gap: "12px",
                          },
                          "@media (min-width: 1024px)": {
                            gap: "16px",
                          },
                        }}
                      >
                        <div
                          className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${colorClass} text-white flex-shrink-0`}
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            "@media (min-width: 640px)": {
                              padding: "12px",
                              borderRadius: "12px",
                            },
                          }}
                        >
                          <IconComponent
                            className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                            style={{
                              width: "12px",
                              height: "12px",
                              "@media (min-width: 640px)": {
                                width: "16px",
                                height: "16px",
                              },
                              "@media (min-width: 1024px)": {
                                width: "20px",
                                height: "20px",
                              },
                            }}
                          />
                        </div>
                        <div
                          className="flex-1 min-w-0"
                          style={{
                            flex: "1",
                            minWidth: "0",
                          }}
                        >
                          <div
                            className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 lg:gap-4"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: "8px",
                              "@media (min-width: 640px)": {
                                flexDirection: "row",
                                alignItems: "flex-start",
                                gap: "12px",
                              },
                              "@media (min-width: 1024px)": {
                                gap: "16px",
                              },
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                  {!notification.read && (
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                  )}
                                  <h3
                                    className={`text-sm sm:text-base lg:text-lg font-bold truncate ${
                                      !notification.read
                                        ? "text-gray-900"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {notification.title}
                                  </h3>
                                </div>
                                {!notification.read && (
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                                      غير مقروء
                                    </span>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        markAsRead(notification.id)
                                      }
                                      className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
                                    >
                                      <span className="hidden sm:inline">
                                        تعيين كمقروء
                                      </span>
                                      <span className="sm:hidden">مقروء</span>
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                              <p
                                className="text-xs sm:text-sm lg:text-base text-gray-600 mb-2 sm:mb-3 leading-relaxed break-words"
                                style={{
                                  fontSize: "12px",
                                  lineHeight: "1.5",
                                  wordBreak: "break-word",
                                  marginBottom: "8px",
                                  "@media (min-width: 640px)": {
                                    fontSize: "14px",
                                    marginBottom: "12px",
                                  },
                                  "@media (min-width: 1024px)": {
                                    fontSize: "16px",
                                  },
                                }}
                              >
                                {notification.message}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">
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
                                    <FaStar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="whitespace-nowrap">
                                      +{notification.points} نقطة
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto flex-shrink-0">
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
                                className="p-1.5 sm:p-2 text-blue-600 cursor-pointer hover:bg-blue-100 rounded-lg transition-colors"
                                title="عرض البلاغ"
                              >
                                <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-1.5 sm:p-2 text-red-600 cursor-pointer hover:bg-red-100 rounded-lg transition-colors"
                                title="حذف الإشعار"
                              >
                                <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              zIndex: "50",
              "@media (min-width: 640px)": {
                padding: "16px",
              },
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-7xl max-h-[95vh] overflow-y-auto"
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "16px",
                width: "100%",
                maxWidth: "1280px",
                maxHeight: "95vh",
                overflowY: "auto",
                "@media (min-width: 640px)": {
                  borderRadius: "16px",
                  padding: "24px",
                },
                "@media (min-width: 1024px)": {
                  padding: "32px",
                },
              }}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  تفاصيل البلاغ
                </h3>
                <button
                  onClick={() => setModalReport(null)}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl sm:text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  "@media (min-width: 640px)": {
                    gap: "24px",
                  },
                  "@media (min-width: 1024px)": {
                    gridTemplateColumns: "1fr 1fr",
                    gap: "32px",
                  },
                }}
              >
                {/* Left Column - Text Content */}
                <div
                  className="space-y-4 sm:space-y-6"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    "@media (min-width: 640px)": {
                      gap: "24px",
                    },
                  }}
                >
                  <div>
                    <p
                      className="text-base sm:text-lg font-semibold text-gray-700 mb-2"
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        "@media (min-width: 640px)": {
                          fontSize: "18px",
                        },
                      }}
                    >
                      رابط الإشاعة:
                    </p>
                    {modalReport.rumorUrl ? (
                      <a
                        href={modalReport.rumorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all text-sm sm:text-base lg:text-lg underline"
                        style={{
                          fontSize: "14px",
                          wordBreak: "break-all",
                          "@media (min-width: 640px)": {
                            fontSize: "16px",
                          },
                          "@media (min-width: 1024px)": {
                            fontSize: "18px",
                          },
                        }}
                      >
                        {modalReport.rumorUrl}
                      </a>
                    ) : (
                      <span
                        className="text-gray-500 text-sm sm:text-base lg:text-lg"
                        style={{
                          fontSize: "14px",
                          "@media (min-width: 640px)": {
                            fontSize: "16px",
                          },
                          "@media (min-width: 1024px)": {
                            fontSize: "18px",
                          },
                        }}
                      >
                        لا يوجد
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      الوصف:
                    </p>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base lg:text-lg leading-relaxed">
                        {modalReport.description || "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      تاريخ الإرسال:
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
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
                <div
                  className="space-y-4 sm:space-y-6"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    "@media (min-width: 640px)": {
                      gap: "24px",
                    },
                  }}
                >
                  {modalReport.imageUrl && (
                    <div>
                      <p
                        className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3"
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          "@media (min-width: 640px)": {
                            fontSize: "18px",
                            marginBottom: "12px",
                          },
                        }}
                      >
                        الصورة:
                      </p>
                      <div
                        className="flex justify-center"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={modalReport.imageUrl}
                          alt="صورة البلاغ"
                          className="max-w-full h-auto rounded-lg shadow-lg"
                          style={{
                            maxHeight: "400px",
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: "8px",
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                          }}
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
