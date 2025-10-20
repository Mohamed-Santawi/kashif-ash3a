import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { ADMIN_ROLES, hasPermission, PERMISSIONS } from "../utils/adminRoles";
import {
  FaUserShield,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  AnimatedCard,
  GradientBackground,
  GlassCard,
} from "../components/Animations";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔍 Admin Login: Form submitted");
    console.log("🔍 Admin Login: Email:", formData.email);
    console.log(
      "🔍 Admin Login: Password:",
      formData.password ? "***" : "empty"
    );

    setLoading(true);
    setError("");

    try {
      console.log("🔍 Admin Login: Attempting Firebase authentication...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      console.log("🔍 Admin Login: Firebase auth successful, UID:", user.uid);

      // Check if it's the super admin or a sub-admin
      if (formData.email === "admin@mansa.com") {
        // Super admin - allow access
        console.log("Super admin login successful");
      } else {
        // Check if it's a sub-admin in the admins collection
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));

          if (!adminDoc.exists()) {
            setError("ليس لديك صلاحية للدخول كمدير");
            await auth.signOut();
            setLoading(false);
            return;
          }

          const adminData = adminDoc.data();

          if (!adminData.isActive) {
            setError("حسابك غير مفعل. يرجى التواصل مع المدير العام");
            await auth.signOut();
            setLoading(false);
            return;
          }

          // Update last login
          await updateDoc(doc(db, "admins", user.uid), {
            lastLogin: serverTimestamp(),
          });

          console.log("Sub-admin login successful:", adminData.name);
        } catch (error) {
          console.error("Error checking admin permissions:", error);
          setError("حدث خطأ أثناء التحقق من الصلاحيات");
          await auth.signOut();
          setLoading(false);
          return;
        }
      }

      // Navigate to dashboard
      console.log("🔍 Admin Login: Navigating to dashboard...");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("🔍 Admin Login: Login error:", err);
      console.error("🔍 Admin Login: Error code:", err.code);
      console.error("🔍 Admin Login: Error message:", err.message);
      switch (err.code) {
        case "auth/user-not-found":
          setError("المستخدم غير موجود");
          break;
        case "auth/wrong-password":
          setError("كلمة المرور غير صحيحة");
          break;
        case "auth/invalid-email":
          setError("البريد الإلكتروني غير صحيح");
          break;
        case "auth/invalid-credential":
          setError(
            "البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من إنشاء الحساب أولاً"
          );
          break;
        case "auth/too-many-requests":
          setError("تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً");
          break;
        case "permission-denied":
          setError("ليس لديك صلاحية للوصول. يرجى التواصل مع المدير");
          break;
        default:
          setError("حدث خطأ أثناء تسجيل الدخول: " + err.message);
      }
    }

    setLoading(false);
  };

  return (
    <GradientBackground
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-md w-full">
        <AnimatedCard>
          <GlassCard className="p-10">
            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaUserShield className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                تسجيل دخول المدير
              </h1>
              <p className="text-lg text-gray-600">
                أدخل بياناتك للوصول إلى لوحة التحكم
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl"
                >
                  <div className="flex items-center">
                    <FaExclamationTriangle className="w-5 h-5 ml-2" />
                    <span className="font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Email Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  htmlFor="email"
                  className="block text-lg font-semibold text-gray-700 mb-3"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pr-12 pl-4 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 text-lg"
                    placeholder="admin@mansa.com"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label
                  htmlFor="password"
                  className="block text-lg font-semibold text-gray-700 mb-3"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaLock className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pr-12 pl-12 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 text-lg"
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-3 py-4 px-12 border border-transparent text-xl font-bold rounded-xl text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <FaUserShield className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      تسجيل الدخول
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Create Admin Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="text-center"
              >
                <motion.button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setError("");
                      console.log("🔍 Creating admin user...");

                      const { createUserWithEmailAndPassword } = await import(
                        "firebase/auth"
                      );
                      const userCredential =
                        await createUserWithEmailAndPassword(
                          auth,
                          "admin@mansa.com",
                          "Admin123"
                        );
                      console.log(
                        "✅ Admin user created:",
                        userCredential.user.uid
                      );
                      setError(
                        "✅ تم إنشاء حساب المدير بنجاح! يمكنك الآن تسجيل الدخول."
                      );
                      await auth.signOut();
                    } catch (err) {
                      if (err.code === "auth/email-already-in-use") {
                        setError(
                          "ℹ️ حساب المدير موجود بالفعل. يمكنك تسجيل الدخول."
                        );
                      } else {
                        setError(`❌ خطأ في إنشاء الحساب: ${err.message}`);
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-3 py-3 px-8 border border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  إنشاء حساب المدير
                </motion.button>
              </motion.div>

              {/* Back to main site */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
                >
                  العودة إلى الموقع الرئيسي
                </button>
              </motion.div>
            </motion.form>
          </GlassCard>
        </AnimatedCard>
      </div>
    </GradientBackground>
  );
};

export default AdminLogin;
