import React, { createContext, useContext, useState, useEffect } from "react";
// import { auth, db } from "../utils/firebase";
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }

    // Mark as initialized immediately to prevent blank screens
    setInitialized(true);
  }, []);

  // Listen for storage changes (from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error("Error parsing user from storage:", error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call with Firebase-like behavior
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@mansa.com" && password === "Admin123") {
        const userData = {
          id: "admin-1",
          email: "admin@mansa.com",
          name: "مدير النظام",
          role: "admin",
          totalPoints: 0,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      } else if (email === "ahmed@test.com" && password === "password123") {
        const userData = {
          id: "user-1",
          email: "ahmed@test.com",
          name: "أحمد محمد",
          role: "user",
          totalPoints: 150,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return {
          success: false,
          error: "خطأ في البريد الإلكتروني أو كلمة المرور",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        id: `user-${Date.now()}`,
        email: email,
        name: name,
        role: "user",
        totalPoints: 0,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("user");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  const updateUserPoints = async (points) => {
    if (user) {
      try {
        const newTotalPoints = user.totalPoints + points;
        const updatedUser = { ...user, totalPoints: newTotalPoints };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Update points error:", error);
      }
    }
  };

  const updateUser = (updatedUserData) => {
    if (user) {
      try {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        console.log("✅ AuthContext updated with:", updatedUserData);
      } catch (error) {
        console.error("Update user error:", error);
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUserPoints,
    updateUser,
    loading,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
