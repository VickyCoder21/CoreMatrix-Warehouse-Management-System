import React from "react";
import { Navigate } from "react-router-dom";
import { hasScreenAccess } from "/src/utils/auth";

// Unlike hiding a sidebar link, this stops someone from getting in by
// typing the URL directly, bookmarking it, or clicking an old link.
const ScreenGuard = ({ screenId, children }) => {
  return hasScreenAccess(screenId) ? children : <Navigate to="/dashboard" replace />;
};

export default ScreenGuard;