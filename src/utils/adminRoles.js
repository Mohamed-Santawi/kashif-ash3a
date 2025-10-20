// Admin Roles and Permissions System
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  VIEWER: "viewer",
};

export const PERMISSIONS = {
  // Report Management
  VIEW_REPORTS: "view_reports",
  APPROVE_REPORTS: "approve_reports",
  REJECT_REPORTS: "reject_reports",
  DELETE_REPORTS: "delete_reports",

  // User Management
  VIEW_USERS: "view_users",
  MANAGE_USERS: "manage_users",
  DELETE_USERS: "delete_users",

  // Admin Management
  VIEW_ADMINS: "view_admins",
  CREATE_ADMINS: "create_admins",
  EDIT_ADMINS: "edit_admins",
  DELETE_ADMINS: "delete_admins",

  // System Settings
  VIEW_STATISTICS: "view_statistics",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_LOGS: "view_logs",
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.APPROVE_REPORTS,
    PERMISSIONS.REJECT_REPORTS,
    PERMISSIONS.DELETE_REPORTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_ADMINS,
    PERMISSIONS.CREATE_ADMINS,
    PERMISSIONS.EDIT_ADMINS,
    PERMISSIONS.DELETE_ADMINS,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_LOGS,
  ],
  [ADMIN_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.APPROVE_REPORTS,
    PERMISSIONS.REJECT_REPORTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ADMINS,
    PERMISSIONS.VIEW_STATISTICS,
  ],
  [ADMIN_ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.APPROVE_REPORTS,
    PERMISSIONS.REJECT_REPORTS,
    PERMISSIONS.VIEW_USERS,
  ],
  [ADMIN_ROLES.VIEWER]: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_STATISTICS,
  ],
};

// Helper functions
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ADMIN_ROLES.SUPER_ADMIN]: "مدير عام",
    [ADMIN_ROLES.ADMIN]: "مدير",
    [ADMIN_ROLES.MODERATOR]: "مشرف",
    [ADMIN_ROLES.VIEWER]: "مراقب",
  };
  return roleNames[role] || "غير محدد";
};

export const getPermissionDisplayName = (permission) => {
  const permissionNames = {
    [PERMISSIONS.VIEW_REPORTS]: "عرض البلاغات",
    [PERMISSIONS.APPROVE_REPORTS]: "الموافقة على البلاغات",
    [PERMISSIONS.REJECT_REPORTS]: "رفض البلاغات",
    [PERMISSIONS.DELETE_REPORTS]: "حذف البلاغات",
    [PERMISSIONS.VIEW_USERS]: "عرض المستخدمين",
    [PERMISSIONS.MANAGE_USERS]: "إدارة المستخدمين",
    [PERMISSIONS.DELETE_USERS]: "حذف المستخدمين",
    [PERMISSIONS.VIEW_ADMINS]: "عرض المديرين",
    [PERMISSIONS.CREATE_ADMINS]: "إنشاء مديرين",
    [PERMISSIONS.EDIT_ADMINS]: "تعديل المديرين",
    [PERMISSIONS.DELETE_ADMINS]: "حذف المديرين",
    [PERMISSIONS.VIEW_STATISTICS]: "عرض الإحصائيات",
    [PERMISSIONS.MANAGE_SETTINGS]: "إدارة الإعدادات",
    [PERMISSIONS.VIEW_LOGS]: "عرض السجلات",
  };
  return permissionNames[permission] || permission;
};
