import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "/src/utils/auth";

const RedirectIfAuthenticated = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
};

export default RedirectIfAuthenticated;