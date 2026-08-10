import React, { useEffect, useState } from "react";
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert,
  CButton,
} from "@coreui/react";

import CIcon from "@coreui/icons-react";

import {
  cilPeople,
  cilStorage,
  cilTruck,
  cilClipboard,
  cilUser,
  cilSpeedometer,
  cilReload,
} from "@coreui/icons";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { DashboardPageLoad, DashboardPurchaseOrderSummary } from "../../Services/DashboardService/DashboardService";

const DEFAULT_DASHBOARD_DATA = {
  EMPLOYEECOUNT: 0,
  ITEMCOUNT: 0,
  SUPPLIERCOUNT: 0,
  TRANSPORTERCOUNT: 0,
  PURCHASEORDERCOUNT: 0,
  USERCOUNT: 0,
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD_DATA);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // ---------------- Purchase Order Summary (chart + recent orders) ----------------
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    loadDashboard();
    loadPurchaseOrderSummary();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const response = await DashboardPageLoad();

      if (response.ok && response.result?.result && response.result.dashboard?.length > 0) {
        setDashboardData({ ...DEFAULT_DASHBOARD_DATA, ...response.result.dashboard[0] });
      } else {
        setLoadError(response.result?.message || 'Unable to load dashboard data.');
      }
    } catch (error) {
      setLoadError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrderSummary = async () => {
    setSummaryLoading(true);
    setSummaryError('');

    try {
      const { ok, result } = await DashboardPurchaseOrderSummary();

      if (ok && result?.result) {
        setChartData(result.chartData || []);
        setRecentOrders(result.recentOrders || []);
      } else {
        setSummaryError(result?.message || 'Unable to load purchase order summary.');
      }
    } catch (error) {
      setSummaryError('Unable to reach the server. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRefreshAll = () => {
    loadDashboard();
    loadPurchaseOrderSummary();
  };

  const cards = [
    { title: "Employees", value: dashboardData.EMPLOYEECOUNT, icon: cilPeople, color: "primary" },
    { title: "Items", value: dashboardData.ITEMCOUNT, icon: cilStorage, color: "success" },
    { title: "Suppliers", value: dashboardData.SUPPLIERCOUNT, icon: cilTruck, color: "warning" },
    { title: "Transporters", value: dashboardData.TRANSPORTERCOUNT, icon: cilTruck, color: "info" },
    { title: "Purchase Orders", value: dashboardData.PURCHASEORDERCOUNT, icon: cilClipboard, color: "danger" },
    { title: "Users", value: dashboardData.USERCOUNT, icon: cilUser, color: "dark" },
  ];

  return (
    <>
      <CCard className="shadow-sm border-0 mb-4">
        <CCardBody className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 className="fw-bold text-primary mb-1">
              <CIcon icon={cilSpeedometer} className="me-2" />
              Dashboard
            </h2>
            <p className="text-muted mb-0">
              Welcome to Smart Warehouse Management System
            </p>
          </div>
          <CButton color="primary" variant="outline" onClick={handleRefreshAll} disabled={loading || summaryLoading}>
            {(loading || summaryLoading) ? <CSpinner size="sm" /> : (<><CIcon icon={cilReload} className="me-2" />Refresh</>)}
          </CButton>
        </CCardBody>
      </CCard>

      {loadError && (
        <CAlert color="danger" dismissible onClose={() => setLoadError('')}>
          {loadError}
        </CAlert>
      )}

      <CRow>
        {cards.map((card, index) => (
          <CCol xl={4} lg={4} md={6} sm={12} key={index}>
            <CCard className={`bg-${card.color} text-white shadow mb-4 border-0`}>
              <CCardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {loading ? (
                      <CSpinner size="sm" color="light" />
                    ) : (
                      <h2 className="fw-bold mb-0">{Number(card.value || 0).toLocaleString()}</h2>
                    )}
                    <div>{card.title}</div>
                  </div>
                  <CIcon icon={card.icon} style={{ width: '2.5rem', height: '2.5rem' }} />
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow>
        <CCol lg={8}>
          <CCard className="shadow-sm mb-4">
            <CCardHeader className="fw-bold">
              Purchase Order Summary
            </CCardHeader>
            <CCardBody style={{ height: "300px" }}>
              {summaryLoading ? (
                <div className="h-100 d-flex align-items-center justify-content-center">
                  <CSpinner color="primary" />
                </div>
              ) : summaryError ? (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  {summaryError}
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="OrderCount" fill="#321fdb" radius={[4, 4, 0, 0]} name="Purchase Orders" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  No purchase order activity yet.
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4}>
          <CCard className="shadow-sm mb-4">
            <CCardHeader className="fw-bold">
              Today's Summary
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center py-4"><CSpinner color="primary" /></div>
              ) : (
                [
                  { label: 'Employees', value: dashboardData.EMPLOYEECOUNT, icon: cilPeople },
                  { label: 'Items', value: dashboardData.ITEMCOUNT, icon: cilStorage },
                  { label: 'Suppliers', value: dashboardData.SUPPLIERCOUNT, icon: cilTruck },
                  { label: 'Transporters', value: dashboardData.TRANSPORTERCOUNT, icon: cilTruck },
                  { label: 'Purchase Orders', value: dashboardData.PURCHASEORDERCOUNT, icon: cilClipboard },
                  { label: 'Users', value: dashboardData.USERCOUNT, icon: cilUser },
                ].map((row, index) => (
                  <div
                    key={row.label}
                    className={`d-flex justify-content-between align-items-center py-2 ${index !== 0 ? 'border-top' : ''}`}
                  >
                    <span className="text-muted">
                      <CIcon icon={row.icon} className="me-2" style={{ width: '1.1rem', height: '1.1rem' }} />
                      {row.label}
                    </span>
                    <span className="fw-bold">{Number(row.value || 0).toLocaleString()}</span>
                  </div>
                ))
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol>
          <CCard className="shadow-sm">
            <CCardHeader className="fw-bold">
              Recent Purchase Orders
            </CCardHeader>
            <CCardBody>
              {summaryError && !summaryLoading ? (
                <div className="text-center text-muted py-3">{summaryError}</div>
              ) : (
                <div className="table-responsive">
                  <CTable bordered hover responsive className="text-center" >
                    <CTableHead className="table-primary">
                      <CTableRow>
                        <CTableHeaderCell>PO No</CTableHeaderCell>
                        <CTableHeaderCell>Supplier</CTableHeaderCell>
                        <CTableHeaderCell>Date</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {summaryLoading ? (
                        <CTableRow>
                          <CTableDataCell colSpan={3} className="text-center py-4">
                            <CSpinner size="sm" color="primary" />
                          </CTableDataCell>
                        </CTableRow>
                      ) : recentOrders.length > 0 ? (
                        recentOrders.map((order, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{order['PO No']}</CTableDataCell>
                            <CTableDataCell>{order['Supplier']}</CTableDataCell>
                            <CTableDataCell>{order['Date']}</CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan={3} className="text-center">
                            No Purchase Orders
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Dashboard;