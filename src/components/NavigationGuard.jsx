import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const NavigationGuard = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Set navigating state when location changes
    setIsNavigating(true);

    // Reset navigating state after a short delay
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  // Show loading during navigation
  if (isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
};

export default NavigationGuard;

