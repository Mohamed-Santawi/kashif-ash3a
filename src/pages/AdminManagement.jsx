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
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
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
import AdminLayout from "../components/AdminLayout";

const AdminManagement = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ADMIN_ROLES.MODERATOR,
    name: "",
    permissions: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if current user is authenticated
    if (!auth.currentUser) {
      navigate("/admin/login", { replace: true });
      return;
    }

    // Set current user
    setCurrentUser(auth.currentUser);

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

  const canCreateAdmins = () => {
    return currentUser && currentUser.email === "admin@mansa.com";
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let userCredential;

      // First, try to create the user
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log("✅ New user created successfully");
      } catch (createError) {
        console.log("❌ User creation failed:", createError.code);

        if (createError.code === "auth/email-already-in-use") {
          // User exists, don't sign in to avoid logging out current admin
          setError(
            "البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر."
          );
          setLoading(false);
          return;
        } else {
          // Other creation errors
          throw createError;
        }
      }

      // Create admin document in Firestore using the user's UID as document ID
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

      console.log("📝 Creating admin document for:", userCredential.user.uid);
      await setDoc(doc(db, "admins", userCredential.user.uid), adminData);
      console.log("✅ Admin document created successfully");

      setSuccess(`تم إنشاء ${getRoleDisplayName(formData.role)} بنجاح!`);

      // Reset form
      setFormData({
        email: "",
        password: "",
        role: ADMIN_ROLES.MODERATOR,
        name: "",
        permissions: ROLE_PERMISSIONS[ADMIN_ROLES.MODERATOR] || [],
      });
      setShowCreateForm(false);

      // The admin list will automatically refresh via the onSnapshot listener
    } catch (error) {
      console.error("❌ Error creating admin:", error);
      setError("حدث خطأ أثناء إنشاء المدير: " + error.message);
    }

    setLoading(false);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const adminRef = doc(db, "admins", editingAdmin.id);
      await updateDoc(adminRef, {
        name: editingAdmin.name,
        role: editingAdmin.role,
        permissions: editingAdmin.permissions,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email,
      });

      setSuccess("تم تحديث المدير بنجاح!");
      setEditingAdmin(null);
    } catch (error) {
      console.error("Error updating admin:", error);
      setError("حدث خطأ أثناء تحديث المدير");
    }

    setLoading(false);
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
    const adminRef = doc(db, "admins", admin.id);
    updateDoc(adminRef, {
      isActive: !admin.isActive,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.email,
    })
      .then(() => {
        setSuccess("تم تحديث حالة المدير بنجاح!");
      })
      .catch((error) => {
        console.error("Error updating admin status:", error);
        setError("حدث خطأ أثناء تحديث حالة المدير");
      });
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
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-700">
                جاري التحميل...
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
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              إدارة المديرين
            </h1>
            <p className="text-xl text-gray-600">
              إدارة صلاحيات المديرين والأدوار
            </p>
            {currentUser && (
              <p className="text-sm text-blue-600 mt-2">
                مسجل الدخول كـ:{" "}
                {currentUser.email === "admin@mansa.com" ? "مدير عام" : "مشرف"}
              </p>
            )}
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
            {canCreateAdmins() && (
              <motion.button
                onClick={() => {
                  // Initialize form data with default role permissions
                  setFormData({
                    email: "",
                    password: "",
                    role: ADMIN_ROLES.MODERATOR,
                    name: "",
                    permissions: ROLE_PERMISSIONS[ADMIN_ROLES.MODERATOR] || [],
                  });
                  setShowCreateForm(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
              >
                <FaUserPlus className="w-5 h-5" />
                إضافة مدير جديد
              </motion.button>
            )}
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
                  إضافة {getRoleDisplayName(formData.role)} جديد
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
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="كلمة المرور (6 أحرف على الأقل)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
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
                    {loading
                      ? "جاري الإنشاء..."
                      : `إنشاء ${getRoleDisplayName(formData.role)}`}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {editingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  تعديل {getRoleDisplayName(editingAdmin.role)}
                </h2>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingAdmin.name || ""}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, name: e.target.value })
                    }
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
                    value={editingAdmin.email || ""}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    placeholder="admin@example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    لا يمكن تغيير البريد الإلكتروني
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدور
                  </label>
                  <select
                    name="role"
                    value={editingAdmin.role || ADMIN_ROLES.MODERATOR}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setEditingAdmin({
                        ...editingAdmin,
                        role: newRole,
                        permissions: ROLE_PERMISSIONS[newRole] || [],
                      });
                    }}
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
                          checked={
                            editingAdmin.permissions?.includes(permission) ||
                            false
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentPermissions =
                              editingAdmin.permissions || [];
                            const newPermissions = checked
                              ? [...currentPermissions, permission]
                              : currentPermissions.filter(
                                  (p) => p !== permission
                                );
                            setEditingAdmin({
                              ...editingAdmin,
                              permissions: newPermissions,
                            });
                          }}
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
                    onClick={() => setEditingAdmin(null)}
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
                    {loading
                      ? "جاري التحديث..."
                      : `تحديث ${getRoleDisplayName(editingAdmin.role)}`}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;
