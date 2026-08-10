import React from "react";
import { CFooter } from "@coreui/react";

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        © {new Date().getFullYear()} Smart Warehouse Management System
      </div>

      <div className="ms-auto">
        Version 1.0
      </div>
    </CFooter>
  );
};

export default AppFooter;