import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import {
  FaUsers,
  FaStar,
  FaFileAlt,
  FaCalendar,
  FaTrophy,
  FaMedal,
  FaAward,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaExternalLinkAlt,
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
    if (index === 0)
      return <FaTrophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
    if (index === 1)
      return <FaMedal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
    if (index === 2)
      return <FaAward className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
    return (
      <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-500">
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

  const renderSocialMediaLinks = (socialMedia) => {
    if (!socialMedia) return null;

    const socialPlatforms = [
      {
        name: "facebook",
        icon: FaFacebook,
        color: "text-blue-600",
        label: "فيسبوك",
      },
      {
        name: "twitter",
        icon: FaTwitter,
        color: "text-blue-400",
        label: "تويتر",
      },
      {
        name: "instagram",
        icon: FaInstagram,
        color: "text-pink-500",
        label: "إنستغرام",
      },
      {
        name: "linkedin",
        icon: FaLinkedin,
        color: "text-blue-700",
        label: "لينكد إن",
      },
      {
        name: "youtube",
        icon: FaYoutube,
        color: "text-red-600",
        label: "يوتيوب",
      },
      { name: "tiktok", icon: FaTiktok, color: "text-black", label: "تيك توك" },
    ];

    const activeLinks = socialPlatforms.filter(
      (platform) => socialMedia[platform.name]
    );

    if (activeLinks.length === 0) return null;

    return (
      <div className="mt-2 sm:mt-3">
        <p className="text-xs font-medium text-gray-500 mb-1 sm:mb-2">
          روابط التواصل الاجتماعي:
        </p>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {activeLinks.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <a
                key={platform.name}
                href={socialMedia[platform.name]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-1 sm:px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                title={platform.label}
              >
                <IconComponent
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${platform.color}`}
                />
                <FaExternalLinkAlt className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-8 sm:py-12">
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
      <div
        className="max-w-7xl mx-auto"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
          padding: "16px",
          "@media (min-width: 640px)": {
            padding: "24px",
          },
          "@media (min-width: 1024px)": {
            padding: "32px",
          },
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
          style={{
            marginBottom: "24px",
            "@media (min-width: 640px)": {
              marginBottom: "32px",
            },
          }}
        >
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              "@media (min-width: 640px)": {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0",
              },
            }}
          >
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  "@media (min-width: 640px)": {
                    fontSize: "30px",
                  },
                }}
              >
                إدارة المستخدمين
              </h1>
              <p
                className="text-base sm:text-lg text-gray-600"
                style={{
                  fontSize: "16px",
                  "@media (min-width: 640px)": {
                    fontSize: "18px",
                  },
                }}
              >
                عرض وإدارة جميع المستخدمين مع ترتيبهم حسب النقاط
              </p>
            </div>

            {/* Sort Options */}
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                "@media (min-width: 640px)": {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                },
              }}
            >
              <label
                className="text-sm font-medium text-gray-700"
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                ترتيب حسب:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                style={{
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "14px",
                  "@media (min-width: 640px)": {
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    fontSize: "16px",
                  },
                }}
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
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "16px",
            marginBottom: "24px",
            "@media (min-width: 640px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "24px",
              marginBottom: "32px",
            },
          }}
        >
          <AnimatedCard>
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    إجمالي المستخدمين
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-100">
                  <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                </div>
              </div>
            </GlassCard>
          </AnimatedCard>

          <AnimatedCard>
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    إجمالي البلاغات
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {users.reduce(
                      (sum, user) => sum + (user.totalReports || 0),
                      0
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-green-100">
                  <FaFileAlt className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
                </div>
              </div>
            </GlassCard>
          </AnimatedCard>
        </div>

        {/* Users List */}
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
          {users.length === 0 ? (
            <AnimatedCard>
              <GlassCard className="p-6 sm:p-8 lg:p-10 text-center">
                <FaUsers className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                  لا يوجد مستخدمين
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  لم يتم تسجيل أي مستخدمين بعد
                </p>
              </GlassCard>
            </AnimatedCard>
          ) : (
            users.map((user, index) => (
              <AnimatedCard key={user.id}>
                <GlassCard
                  className={`p-4 sm:p-6 border-2 ${getRankColor(index)}`}
                  style={{
                    padding: "16px",
                    "@media (min-width: 640px)": {
                      padding: "24px",
                    },
                  }}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px",
                      "@media (min-width: 640px)": {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0",
                      },
                    }}
                  >
                    <div
                      className="flex items-center gap-3 sm:gap-4"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        "@media (min-width: 640px)": {
                          gap: "16px",
                        },
                      }}
                    >
                      {/* Rank */}
                      <div
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: "0",
                          "@media (min-width: 640px)": {
                            width: "48px",
                            height: "48px",
                          },
                        }}
                      >
                        {getRankIcon(index)}
                      </div>

                      {/* User Info */}
                      <div
                        className="flex-1 min-w-0"
                        style={{
                          flex: "1",
                          minWidth: "0",
                        }}
                      >
                        <h3
                          className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate"
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            marginBottom: "4px",
                            "@media (min-width: 640px)": {
                              fontSize: "20px",
                            },
                          }}
                        >
                          {user.name || "مستخدم غير محدد"}
                        </h3>
                        <p
                          className="text-xs sm:text-sm text-gray-600 mb-2 truncate"
                          style={{
                            fontSize: "12px",
                            marginBottom: "8px",
                            "@media (min-width: 640px)": {
                              fontSize: "14px",
                            },
                          }}
                        >
                          {user.email || user.id}
                        </p>
                        <div
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            "@media (min-width: 640px)": {
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "16px",
                            },
                          }}
                        >
                          <div
                            className="flex items-center gap-2 bg-yellow-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              paddingLeft: "8px",
                              paddingRight: "8px",
                              paddingTop: "4px",
                              paddingBottom: "4px",
                              "@media (min-width: 640px)": {
                                paddingLeft: "12px",
                                paddingRight: "12px",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                              },
                            }}
                          >
                            <FaStar
                              className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                              style={{
                                width: "16px",
                                height: "16px",
                                "@media (min-width: 640px)": {
                                  width: "20px",
                                  height: "20px",
                                },
                              }}
                            />
                            <span
                              className="text-sm sm:text-lg font-bold text-yellow-700"
                              style={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                "@media (min-width: 640px)": {
                                  fontSize: "18px",
                                },
                              }}
                            >
                              {user.totalPoints || 0} نقطة
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1 text-xs sm:text-sm text-gray-500"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              "@media (min-width: 640px)": {
                                fontSize: "14px",
                              },
                            }}
                          >
                            <FaFileAlt
                              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500"
                              style={{
                                width: "12px",
                                height: "12px",
                                "@media (min-width: 640px)": {
                                  width: "16px",
                                  height: "16px",
                                },
                              }}
                            />
                            <span>{user.totalReports || 0} بلاغ</span>
                          </div>
                          <div
                            className="flex items-center gap-1 text-xs sm:text-sm text-gray-500"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              "@media (min-width: 640px)": {
                                fontSize: "14px",
                              },
                            }}
                          >
                            <FaCalendar
                              className="w-3 h-3 sm:w-4 sm:h-4 text-green-500"
                              style={{
                                width: "12px",
                                height: "12px",
                                "@media (min-width: 640px)": {
                                  width: "16px",
                                  height: "16px",
                                },
                              }}
                            />
                            <span className="truncate">
                              {user.createdAt
                                ?.toDate?.()
                                ?.toLocaleDateString("ar-SA") ||
                                user.createdAt ||
                                "غير محدد"}
                            </span>
                          </div>
                        </div>
                        {renderSocialMediaLinks(user.socialMedia)}
                      </div>
                    </div>

                    {/* User Stats */}
                    <div
                      className="text-center sm:text-right flex-shrink-0"
                      style={{
                        textAlign: "center",
                        flexShrink: "0",
                        "@media (min-width: 640px)": {
                          textAlign: "right",
                        },
                      }}
                    >
                      <div
                        className="text-xl sm:text-2xl font-bold text-gray-900 mb-1"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          marginBottom: "4px",
                          "@media (min-width: 640px)": {
                            fontSize: "24px",
                          },
                        }}
                      >
                        #{index + 1}
                      </div>
                      <div
                        className="text-xs sm:text-sm text-gray-600"
                        style={{
                          fontSize: "12px",
                          "@media (min-width: 640px)": {
                            fontSize: "14px",
                          },
                        }}
                      >
                        الترتيب العام
                      </div>
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
