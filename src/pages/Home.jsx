import React, { lazy, Suspense, memo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaBell,
  FaStar,
  FaRocket,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaGlobe,
  FaLightbulb,
  FaHandsHelping,
} from "react-icons/fa";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  GradientBackground,
  GlassCard,
} from "../components/Animations";

// Lazy load heavy components
const FloatingCard = lazy(() =>
  import("../components/Animations").then((module) => ({
    default: module.FloatingCard,
  }))
);
const PulseCard = lazy(() =>
  import("../components/Animations").then((module) => ({
    default: module.PulseCard,
  }))
);

// Simple loading component
const LoadingCard = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const Home = memo(() => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  const features = [
    {
      name: "إرسال بلاغ",
      description:
        "أبلغ عن الإشاعات الكاذبة بسهولة مع إمكانية رفع الصور والروابط",
      icon: FaFileAlt,
      href: "/report",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "الإحصائيات",
      description: "تابع إحصائياتك الشخصية وعدد النقاط التي حصلت عليها",
      icon: FaChartLine,
      href: "/statistics",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "الإشعارات",
      description: "احصل على إشعارات فورية عند وجود إشاعات جديدة للرد عليها",
      icon: FaBell,
      href: "/notifications",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      name: "نظام النقاط",
      description: "احصل على نقاط مقابل كل رد صحيح على الإشاعات",
      icon: FaStar,
      href: "/statistics",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const stats = [
    {
      name: "إجمالي البلاغات",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaFileAlt,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "الإشاعات المكذوبة",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaExclamationTriangle,
      color: "from-red-500 to-red-600",
    },
    {
      name: "الأعضاء النشطين",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaUsers,
      color: "from-green-500 to-green-600",
    },
    {
      name: "النقاط الممنوحة",
      value: 0,
      change: "+0%",
      changeType: "positive",
      icon: FaStar,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  return (
    <GradientBackground className="min-h-screen">
      <div className="space-y-16" dir="rtl">
        {/* Hero Section */}
        <AnimatedSection className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 opacity-90"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <AnimatedText className="mb-6">
                <motion.h1
                  className="text-5xl md:text-7xl font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  مرحباً بك في{" "}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    منصة منع الإشاعات
                  </span>
                </motion.h1>
              </AnimatedText>

              <AnimatedText delay={0.2} className="mb-8">
                <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                  منصة تفاعلية تسمح للمواطنين بالإبلاغ عن الإشاعات الكاذبة
                  ومكافحتها من خلال المشاركة المجتمعية
                </p>
              </AnimatedText>

              {user ? (
                <AnimatedText delay={0.4}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <GlassCard className="px-6 py-3">
                      <span className="text-white font-medium">
                        نقاطك الحالية:{" "}
                        <span className="text-yellow-400 font-bold">
                          {user.totalPoints}
                        </span>
                      </span>
                    </GlassCard>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/report"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300"
                      >
                        <FaRocket className="text-xl" />
                        إرسال بلاغ جديد
                      </Link>
                    </motion.div>
                  </div>
                </AnimatedText>
              ) : (
                <AnimatedText delay={0.4}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300"
                      >
                        <FaHandsHelping className="text-xl" />
                        انضم إلينا
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                      >
                        <FaGlobe className="text-xl" />
                        تسجيل الدخول
                      </Link>
                    </motion.div>
                  </div>
                </AnimatedText>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <AnimatedCard key={stat.name} delay={index * 0.05}>
                <div className="relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}
                  ></div>
                  <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedSection>

        {/* Features Grid */}
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedText className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              المميزات الرئيسية
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اكتشف كيف يمكنك المساهمة في مكافحة الإشاعات الكاذبة
            </p>
          </AnimatedText>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard key={feature.name} delay={index * 0.05}>
                <motion.div whileHover={{ y: -5 }} className="group">
                  <Link to={feature.href} className="block h-full">
                    <div
                      className={`h-full p-8 rounded-3xl ${feature.bgColor} border border-white/20 hover:shadow-2xl transition-all duration-300 group-hover:scale-105`}
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {feature.name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedSection>

        {/* How it Works */}
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedText className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              كيف يعمل النظام؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              خطوات بسيطة لمكافحة الإشاعات الكاذبة
            </p>
          </AnimatedText>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <AnimatedCard delay={0.1}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaFileAlt className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  1. إرسال البلاغ
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  أرسل رابط أو صورة للإشاعة المشكوك فيها مع وصف مختصر
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaShieldAlt className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  2. المراجعة
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  تقوم الإدارة بفحص البلاغ وتحديد ما إذا كانت الإشاعة صحيحة أم
                  كاذبة
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaStar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  3. النقاط
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  احصل على نقاط مقابل كل رد صحيح على الإشاعات الكاذبة
                </p>
              </div>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Call to Action */}
        {!user && (
          <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedCard>
              <div className="text-center py-16 px-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <FaHeart className="w-12 h-12 text-red-400" />
                  </div>
                  <h2 className="text-4xl font-bold mb-6">
                    انضم إلى مجتمع مكافحة الإشاعات
                  </h2>
                  <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                    ساهم في بناء مجتمع أكثر وعياً وثقافة من خلال مكافحة الإشاعات
                    الكاذبة
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <FaLightbulb className="text-2xl" />
                      ابدأ الآن مجاناً
                    </Link>
                  </motion.div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedSection>
        )}
      </div>
    </GradientBackground>
  );
});

export default Home;
