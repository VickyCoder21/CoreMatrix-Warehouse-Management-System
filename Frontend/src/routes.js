import React from "react";

const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));

// User
const UserCreation = React.lazy(() => import('./views/User/UserCreation'))
const ScreenAuthorization = React.lazy(() => import('./views/User/UserRights'))
const PasswordResetRequests = React.lazy(() => import('./views/User/PasswordResetRequests'))

// Master
const EmployeeMaster = React.lazy(() => import('./views/Master/EmployeeMaster'))
const ItemMaster = React.lazy(() => import('./views/Master/ItemMaster'))
const SupplierMaster = React.lazy(() => import('./views/Master/SupplierMaster'))
const TransporterMaster = React.lazy(() => import('./views/Master/TransporterMaster'))

// Transaction
const PurchaseOrder = React.lazy(() => import('./views/Transaction/PurchaseOrder'))
const GrnEntry = React.lazy(() => import('./views/Transaction/GRNEntry'))
const GrnLabelPrint = React.lazy(() => import('./views/Transaction/GRNLabelPrint'))

// Report
const TransporterMasterReport = React.lazy(() => import('./views/Report/TransporterMasterReport'))
const PurchaseOrderReport = React.lazy(() => import('./views/Report/PurchaseOrderReport'))

// NOTE: /login is routed separately in App.js (public route, outside the
// authenticated shell) so it's intentionally not listed here.

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    element: Dashboard,
    screenId: "DAS001",
  },

  {
    path: "/user/usercreation",
    name: "User Creation",
    element: UserCreation,
    screenId: "UAC001",
  },

  {
    path: "/user/userrights",
    name: "User Rights",
    element: ScreenAuthorization,
    screenId: "UAC002",
  },

  {
    path: "/user/passwordresetrequests",
    name: "Password Reset Requests",
    element: PasswordResetRequests,
    screenId: "UAC003",
  },

  {
    path: "/master/employeemaster",
    name: "Employee Master",
    element: EmployeeMaster,
    screenId: "MAS001",
  },

  {
    path: "/master/itemmaster",
    name: "Item Master",
    element: ItemMaster,
    screenId: "MAS002",
  },

  {
    path: "/master/suppliermaster",
    name: "Supplier Master",
    element: SupplierMaster,
    screenId: "MAS003",
  },

  {
    path: "/master/transportermaster",
    name: "Transporter Master",
    element: TransporterMaster,
    screenId: "MAS004",
  },

  {
    path: "/transaction/purchaseorder",
    name: "Purchase Order",
    element: PurchaseOrder,
    screenId: "TRA001",
  },

  {
    path: "/transaction/grnentry",
    name: "GRN Entry",
    element: GrnEntry,
    screenId: "TRA002",
  },

  {
    path: "/transaction/grnlabelprint",
    name: "GRN Label Print",
    element: GrnLabelPrint,
    screenId: "TRA003",
  },

  {
    path: "/report/transportermasterreport",
    name: "Transporter Master Report",
    element: TransporterMasterReport,
    screenId: "RPT001",
  },

  {
    path: "/report/purchaseorderreport",
    name: "Purchase Order Report",
    element: PurchaseOrderReport,
    screenId: "RPT002",
  },

];

export default routes;