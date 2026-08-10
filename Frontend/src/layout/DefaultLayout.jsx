import React from 'react'
import { AppAside, AppContent, AppSidebar, AppFooter, AppHeader } from '../components'
import useSessionTimeout from "../hooks/useSessionTimeout";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";

const SIDEBAR_WIDTH = 256;
const SIDEBAR_WIDTH_NARROW = 56;

const LayoutBody = () => {
  const { sidebarShow, unfoldable } = useSidebar();

  const marginInlineStart = !sidebarShow
    ? 0
    : unfoldable
      ? SIDEBAR_WIDTH_NARROW
      : SIDEBAR_WIDTH;

  return (
    <div
      className="wrapper d-flex flex-column min-vh-100"
      style={{ marginInlineStart, transition: 'margin-inline-start .15s ease' }}
    >
      <AppHeader />

      <div className="body flex-grow-1 px-3">
        <AppContent />
      </div>

      <AppFooter />
    </div>
  );
};

const DefaultLayout = () => {
  useSessionTimeout();

  return (
    <SidebarProvider>
      <AppSidebar />
      <LayoutBody />
    </SidebarProvider>
  )
}

export default DefaultLayout