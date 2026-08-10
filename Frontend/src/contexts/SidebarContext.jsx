import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(true);
  const [unfoldable, setUnfoldable] = useState(false);

  return (
    <SidebarContext.Provider value={{ sidebarShow, setSidebarShow, unfoldable, setUnfoldable }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
};