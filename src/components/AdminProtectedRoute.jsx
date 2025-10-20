import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

const AdminProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        "🔍 AdminProtectedRoute: Firebase auth state changed:",
        firebaseUser ? firebaseUser.email : "no user"
      );
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log("🔍 AdminProtectedRoute: No user, redirecting to admin login");
    // Redirect to admin login page with return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  console.log("🔍 AdminProtectedRoute: User authenticated, allowing access");
  return children;
};

export default AdminProtectedRoute;
