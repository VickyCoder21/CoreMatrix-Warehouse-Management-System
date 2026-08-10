import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "/src/utils/auth";

const RequireAuth = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;