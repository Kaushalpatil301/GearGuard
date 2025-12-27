import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute - Wrapper component for routes requiring authentication
 *
 * Checks for token presence in localStorage.
 * Redirects to /login if no valid token is found.
 * Preserves the intended destination for post-login redirect.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // If no token, redirect to login with the intended destination
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Token exists, render the protected content
  return children;
};

export default ProtectedRoute;
