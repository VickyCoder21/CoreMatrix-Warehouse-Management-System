import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownHeader,
  CDropdownItem,
  CDropdownDivider,
  CAvatar,
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import { cilMenu, cilUser, cilAccountLogout } from "@coreui/icons";

import { getCurrentUser, logout } from "/src/utils/auth";
import { useSidebar } from "../contexts/SidebarContext";

const AppHeader = () => {
  const headerRef = useRef();
  const navigate = useNavigate();

  const { sidebarShow, setSidebarShow } = useSidebar();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle(
          "shadow-sm",
          document.documentElement.scrollTop > 0
        );
      }
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer fluid className="border-bottom px-4">

        {/* Sidebar Toggle — flips the same state AppSidebar reads */}

        <CHeaderToggler
          onClick={() => setSidebarShow(!sidebarShow)}
          style={{ marginInlineStart: "-14px" }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        {/* Title */}

        <CHeaderNav className="ms-auto align-items-center">
          <h5 className="mb-0 fw-bold text-primary me-4">
            CoreMatrix Technologies{/* Smart Warehouse Management System" */}
          </h5>

          {/* User menu */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} className="d-flex align-items-center py-0">
              <CAvatar color="primary" textColor="white" size="md">
                <CIcon icon={cilUser} />
              </CAvatar>
              {currentUser.employeename && (
                <span className="ms-2 fw-semibold text-body">{currentUser.employeename}</span>
              )}
            </CDropdownToggle>

            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownHeader className="bg-light fw-semibold text-body-secondary">
                Signed in as {currentUser.username || "User"}
              </CDropdownHeader>
              <CDropdownDivider />
              <CDropdownItem onClick={handleLogout} style={{ cursor: "pointer" }}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Logout
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>

      </CContainer>
    </CHeader>
  );
};

export default AppHeader;