// src/components/ProtectedRoute.tsx
import React, { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [tokenAvailable, setTokenAvailable] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // --- JWT expiry check ---
    if (token) {
      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          localStorage.removeItem("access_token");
          setTokenAvailable(false);
          setIsChecking(false);
          return;
        }
      } catch (e) {
        // If token is malformed, treat as invalid
        localStorage.removeItem("access_token");
        setTokenAvailable(false);
        setIsChecking(false);
        return;
      }
    }

    setTokenAvailable(!!token);
    setIsChecking(false);
  }, [location]);

  if (isChecking) {
    return <div>Loading...</div>; // You can replace this with a spinner
  }

  if (!tokenAvailable) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;