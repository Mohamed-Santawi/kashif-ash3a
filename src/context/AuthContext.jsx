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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Simulate API call with Firebase-like behavior
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@manasa.com" && password === "admin123") {
        const userData = {
          id: "admin-1",
          email: "admin@manasa.com",
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
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
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

  const value = {
    user,
    login,
    register,
    logout,
    updateUserPoints,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
