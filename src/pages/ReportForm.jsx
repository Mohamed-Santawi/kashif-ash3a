import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaFileAlt,
  FaImage,
  FaLink,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRocket,
} from "react-icons/fa";
import {
  AnimatedCard,
  GradientBackground,
  GlassCard,
} from "../components/Animations";

const ReportForm = () => {
  const { user: contextUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [formData, setFormData] = useState({
    rumorUrl: "",
    description: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !contextUser) {
      navigate("/login", { replace: true });
    }
  }, [contextUser, authLoading, navigate]);

  if (authLoading) {
    return (
      <GradientBackground
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        dir="rtl"
      >
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("يجب أن يكون الملف صورة");
        return;
      }

      setFormData({
        ...formData,
        image: file,
      });
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation - both URL and image are now required
    if (!formData.rumorUrl.trim()) {
      setError("يجب إدخال رابط الإشاعة");
      setLoading(false);
      return;
    }

    if (!formData.image) {
      setError("يجب رفع صورة للإشاعة");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("يجب إدخال وصف للبلاغ");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = null;

      // Check if Firebase user is authenticated
      if (!firebaseUser) {
        setError("يجب تسجيل الدخول أولاً");
        setLoading(false);
        return;
      }

      // Upload image to Firebase Storage
      if (formData.image) {
        const imageRef = ref(
          storage,
          `reports/${Date.now()}_${formData.image.name}`
        );
        const uploadResult = await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      // Save report to Firestore
      const reportData = {
        rumorUrl: formData.rumorUrl.trim(),
        description: formData.description.trim(),
        imageUrl: imageUrl,
        submittedBy: firebaseUser?.uid || contextUser?.id,
        submittedByEmail: firebaseUser?.email || contextUser?.email,
        submittedByName:
          firebaseUser?.displayName ||
          contextUser?.name ||
          firebaseUser?.email ||
          contextUser?.email,
        status: "pending", // pending, reviewed, approved, rejected
        createdAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        adminNotes: null,
      };

      await addDoc(collection(db, "reports"), reportData);

      // Create or update user document in Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          totalPoints: 0,
          totalReports: 1,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
      } else {
        // Update existing user document
        await setDoc(
          userRef,
          {
            ...userDoc.data(),
            totalReports: (userDoc.data().totalReports || 0) + 1,
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setSuccess(true);
      setFormData({
        rumorUrl: "",
        description: "",
        image: null,
      });
    } catch (err) {
      console.error("Error submitting report:", err);
      setError("حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <GradientBackground
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        dir="rtl"
      >
        <AnimatedCard>
          <GlassCard className="p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              تم إرسال البلاغ بنجاح!
            </h2>
            <p className="text-green-700 mb-8 text-lg">
              شكراً لك على مساهمتك في مكافحة الإشاعات. سيتم مراجعة البلاغ من قبل
              الإدارة قريباً.
            </p>
            <motion.button
              onClick={() => setSuccess(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300"
            >
              إرسال بلاغ آخر
            </motion.button>
          </GlassCard>
        </AnimatedCard>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
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
                className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaFileAlt className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                إرسال بلاغ جديد
              </h1>
              <p className="text-xl text-gray-600">
                أبلغ عن الإشاعات الكاذبة وساهم في بناء مجتمع أكثر وعياً
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-8"
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

              {/* URL Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  htmlFor="rumorUrl"
                  className="block text-lg font-semibold text-gray-700 mb-3"
                >
                  رابط الإشاعة *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaLink className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="rumorUrl"
                    name="rumorUrl"
                    value={formData.rumorUrl}
                    onChange={handleChange}
                    required
                    className="block w-full pr-12 pl-4 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    placeholder="https://example.com/rumor-link"
                  />
                </div>
              </motion.div>

              {/* Image Upload */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label
                  htmlFor="image"
                  className="block text-lg font-semibold text-gray-700 mb-3"
                >
                  صورة الإشاعة *
                </label>
                <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                  <div className="space-y-4 text-center">
                    <FaImage className="mx-auto h-16 w-16 text-gray-400" />
                    <div className="flex text-lg text-gray-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white rounded-xl font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-6 py-3 border border-blue-300 hover:border-blue-400 transition-all duration-300"
                      >
                        <FaUpload className="w-5 h-5 ml-2 inline" />
                        رفع صورة
                        <input
                          id="image"
                          name="image"
                          type="file"
                          className="sr-only"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="mr-3 flex items-center">
                        أو اسحب وأفلت هنا
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF حتى 5 ميجابايت
                    </p>
                    {formData.image && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <p className="text-sm text-green-700 font-medium">
                          تم اختيار: {formData.image.name}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label
                  htmlFor="description"
                  className="block text-lg font-semibold text-gray-700 mb-3"
                >
                  وصف البلاغ *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                  placeholder="اكتب وصفاً مفصلاً للإشاعة ولماذا تعتقد أنها كاذبة..."
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-3 py-4 px-12 border border-transparent text-xl font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
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
                      <FaRocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      إرسال البلاغ
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </GlassCard>
        </AnimatedCard>
      </div>
    </GradientBackground>
  );
};

export default ReportForm;
