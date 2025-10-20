import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import {
  ADMIN_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getRoleDisplayName,
  getPermissionDisplayName,
  hasPermission,
} from "../utils/adminRoles";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaUsers,
  FaCog,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import {
  AnimatedCard,
  GradientBackground,
  GlassCard,
} from "../components/Animations";

const AdminManagement = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ADMIN_ROLES.MODERATOR,
    name: "",
    permissions: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check if current user is super admin
    if (!auth.currentUser || auth.currentUser.email !== "admin@mansa.com") {
      navigate("/admin/login", { replace: true });
      return;
    }

    // Listen to admins collection
    const q = query(collection(db, "admins"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adminsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdmins(adminsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        permissions: checked
          ? [...prev.permissions, value]
          : prev.permissions.filter((p) => p !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
    }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create admin document in Firestore
      const adminData = {
        uid: userCredential.user.uid,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        permissions: formData.permissions,
        isActive: true,
        createdBy: auth.currentUser.email,
        createdAt: serverTimestamp(),
        lastLogin: null,
      };

      await addDoc(collection(db, "admins"), adminData);

      setSuccess("تم إنشاء المدير بنجاح!");
      setFormData({
        email: "",
        password: "",
        role: ADMIN_ROLES.MODERATOR,
        name: "",
        permissions: [],
      });
      setShowCreateForm(false);

      // Sign out the created user
      await auth.signOut();
      // Sign back in as super admin
      await auth.signInWithEmailAndPassword("admin@mansa.com", "Admin123");
    } catch (error) {
      console.error("Error creating admin:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("البريد الإلكتروني مستخدم بالفعل");
      } else {
        setError("حدث خطأ أثناء إنشاء المدير");
      }
    }

    setLoading(false);
  };

  const handleUpdateAdmin = async (adminId, updates) => {
    try {
      const adminRef = doc(db, "admins", adminId);
      await updateDoc(adminRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email,
      });
      setSuccess("تم تحديث المدير بنجاح!");
    } catch (error) {
      console.error("Error updating admin:", error);
      setError("حدث خطأ أثناء تحديث المدير");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المدير؟")) {
      try {
        await deleteDoc(doc(db, "admins", adminId));
        setSuccess("تم حذف المدير بنجاح!");
      } catch (error) {
        console.error("Error deleting admin:", error);
        setError("حدث خطأ أثناء حذف المدير");
      }
    }
  };

  const toggleAdminStatus = (admin) => {
    handleUpdateAdmin(admin.id, { isActive: !admin.isActive });
  };

  if (loading) {
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
              className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
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
    <GradientBackground
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              إدارة المديرين
            </h1>
            <p className="text-xl text-gray-600">
              إدارة صلاحيات المديرين والأدوار
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              onClick={() => navigate("/admin/dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
            >
              <FaCog className="w-5 h-5" />
              لوحة التحكم
            </motion.button>
            <motion.button
              onClick={() => setShowCreateForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
            >
              <FaUserPlus className="w-5 h-5" />
              إضافة مدير
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6"
          >
            <div className="flex items-center">
              <FaTimes className="w-5 h-5 ml-2" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6"
          >
            <div className="flex items-center">
              <FaCheck className="w-5 h-5 ml-2" />
              <span className="font-medium">{success}</span>
            </div>
          </motion.div>
        )}

        {/* Admins List */}
        <div className="grid gap-6">
          {admins.length === 0 ? (
            <AnimatedCard>
              <GlassCard className="p-10 text-center">
                <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  لا يوجد مديرين
                </h3>
                <p className="text-gray-600">لم يتم إنشاء أي مديرين بعد</p>
              </GlassCard>
            </AnimatedCard>
          ) : (
            admins.map((admin) => (
              <AnimatedCard key={admin.id}>
                <GlassCard className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {admin.name || admin.email}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            admin.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.isActive ? "نشط" : "غير نشط"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getRoleDisplayName(admin.role)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>البريد الإلكتروني: {admin.email}</p>
                        <p>
                          تاريخ الإنشاء:{" "}
                          {admin.createdAt
                            ?.toDate?.()
                            ?.toLocaleDateString("ar-SA") || "غير محدد"}
                        </p>
                        {admin.lastLogin && (
                          <p>
                            آخر تسجيل دخول:{" "}
                            {admin.lastLogin
                              ?.toDate?.()
                              ?.toLocaleDateString("ar-SA") || "غير محدد"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => toggleAdminStatus(admin)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                          admin.isActive
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {admin.isActive ? (
                          <>
                            <FaEyeSlash className="w-4 h-4" />
                            إلغاء التفعيل
                          </>
                        ) : (
                          <>
                            <FaEye className="w-4 h-4" />
                            تفعيل
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => setEditingAdmin(admin)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                      >
                        <FaEdit className="w-4 h-4" />
                        تعديل
                      </motion.button>
                      {admin.email !== "admin@mansa.com" && (
                        <motion.button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                        >
                          <FaTrash className="w-4 h-4" />
                          حذف
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      الصلاحيات:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {admin.permissions?.map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {getPermissionDisplayName(permission)}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </AnimatedCard>
            ))
          )}
        </div>

        {/* Create Admin Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  إضافة مدير جديد
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="اسم المدير"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="كلمة المرور (6 أحرف على الأقل)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدور
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={ADMIN_ROLES.VIEWER}>مراقب</option>
                    <option value={ADMIN_ROLES.MODERATOR}>مشرف</option>
                    <option value={ADMIN_ROLES.ADMIN}>مدير</option>
                    <option value={ADMIN_ROLES.SUPER_ADMIN}>مدير عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصلاحيات المخصصة (اختياري)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {Object.values(PERMISSIONS).map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          value={permission}
                          checked={formData.permissions.includes(permission)}
                          onChange={handleInputChange}
                          className="ml-2"
                        />
                        <span className="text-sm">
                          {getPermissionDisplayName(permission)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300"
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 disabled:opacity-50"
                  >
                    {loading ? "جاري الإنشاء..." : "إنشاء مدير"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </GradientBackground>
  );
};

export default AdminManagement;
