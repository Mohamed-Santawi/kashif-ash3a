import React from "react";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { initialized } = useAuth();

  // Show loading only if not initialized yet
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
};

export default PublicRoute;

