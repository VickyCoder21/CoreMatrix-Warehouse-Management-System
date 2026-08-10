import React from "react";
import CIcon from "@coreui/icons-react";

import { cilSpeedometer, cilUser, cilLibrary, cilClipboard, cilReportSlash, } from "@coreui/icons";
import { CNavGroup, CNavItem, CNavTitle, } from "@coreui/react";

const nav = [

  {
    component: CNavItem,
    name: "Dashboard",
    to: "/dashboard",
    screenId: "DAS001",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: "Users",
  },

  {
    component: CNavGroup,
    name: "Users",
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
    items: [

      {
        component: CNavItem,
        name: "User Creation",
        to: "/user/usercreation",
        screenId: "UAC001",
      },

      {
        component: CNavItem,
        name: "User Rights",
        to: "/user/userrights",
        screenId: "UAC002",
      },

      {
        component: CNavItem,
        name: "Password Reset Requests",
        to: "/user/passwordresetrequests",
        screenId: "UAC003",
      },

    ],
  },


  {
    component: CNavTitle,
    name: "Masters",
  },

  {
    component: CNavGroup,
    name: "Masters",
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
    items: [

      {
        component: CNavItem,
        name: "Employee Master",
        to: "/master/employeemaster",
        screenId: "MAS001",
      },

      {
        component: CNavItem,
        name: "Item Master",
        to: "/master/itemmaster",
        screenId: "MAS002",
      },

      {
        component: CNavItem,
        name: "Supplier Master",
        to: "/master/suppliermaster",
        screenId: "MAS003",
      },

      {
        component: CNavItem,
        name: "Transporter Master",
        to: "/master/transportermaster",
        screenId: "MAS004",
      },

    ],
  },

  {
    component: CNavTitle,
    name: "Transactions",
  },

  {
    component: CNavGroup,
    name: "Transactions",
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    items: [

      {
        component: CNavItem,
        name: "Purchase Order",
        to: "/transaction/purchaseorder",
        screenId: "TRA001",
      },

      {
        component: CNavItem,
        name: "GRN Entry",
        to: "/transaction/grnentry",
        screenId: "TRA002",
      },

      {
        component: CNavItem,
        name: "GRN Label Print",
        to: "/transaction/grnlabelprint",
        screenId: "TRA003",
      },

    ],
  },

  {
    component: CNavTitle,
    name: "Reports",
  },

  {
    component: CNavGroup,
    name: "Reports",
    icon: <CIcon icon={cilReportSlash} customClassName="nav-icon" />,
    items: [

      {
        component: CNavItem,
        name: "Transporter Master Report",
        to: "/report/transportermasterreport",
        screenId: "RPT001",
      },

      {
        component: CNavItem,
        name: "Purchase Order Report",
        to: "/report/purchaseorderreport",
        screenId: "RPT002",
      },

    ],
  },

];

// Dashboard is always visible (see auth.js hasScreenAccess) — everything
// else only shows up if its screenId is in the user's allowedScreens.
// CNavGroups with zero visible children (and the CNavTitle right before
// them) get dropped entirely, so users don't see an empty section header.
const isAllowed = (screenId, allowedScreens) =>
  !screenId || screenId === "DAS001" || allowedScreens.includes(screenId);

export const getFilteredNav = (allowedScreens = []) => {
  const result = [];

  for (let i = 0; i < nav.length; i++) {
    const item = nav[i];

    if (item.component === CNavTitle) {
      const nextGroup = nav[i + 1];
      if (nextGroup?.component === CNavGroup) {
        const hasVisibleChild = nextGroup.items.some((child) =>
          isAllowed(child.screenId, allowedScreens)
        );
        if (hasVisibleChild) result.push(item);
      }
      continue;
    }

    if (item.component === CNavGroup) {
      const visibleItems = item.items.filter((child) =>
        isAllowed(child.screenId, allowedScreens)
      );
      if (visibleItems.length > 0) {
        result.push({ ...item, items: visibleItems });
      }
      continue;
    }

    // Plain CNavItem (e.g. Dashboard)
    if (isAllowed(item.screenId, allowedScreens)) {
      result.push(item);
    }
  }

  return result;
};

export default nav;