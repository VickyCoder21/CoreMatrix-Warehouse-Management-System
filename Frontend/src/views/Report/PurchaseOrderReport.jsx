import React, { useState, useEffect } from 'react';
import '@coreui/coreui/dist/css/coreui.min.css';
import "../CommonCss/common.css";
import CIcon from "@coreui/icons-react";
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CFormSelect, CFormInput, CFormLabel, CTable,
    CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from "@coreui/react";
import { cilPencil, cilCheckCircle, cilXCircle, cilEducation, cilReload, cilSave, cilFile, cilPrint, cilSearch } from "@coreui/icons";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { ReportPageLoad, GenerateReport } from '../../Services/ReportService/PurchaseOrderReportService';

// Keys must match the field names returned in resultData rows
const REPORT_COLUMNS = ['SI No', 'Po No', 'Po Date', 'Supplier Name', 'GST No', 'Transporter Name', 'Terms Of Payment', 'Dispatch Through', 'Delivery'];

const todayStr = () => new Date().toISOString().slice(0, 10);

const PurchaseOrderReport = () => {
    // ---------------- Filter States ----------------
    const [fromDate, setFromDate] = useState(todayStr());
    const [toDate, setToDate] = useState(todayStr());
    const [supplier, setSupplier] = useState('');

    // ---------------- Error States ----------------
    const [fromDateError, setFromDateError] = useState('');
    const [toDateError, setToDateError] = useState('');

    const [supplierList, setSupplierList] = useState([]);
    const [transporterList, setTransporterList] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSearched, setIsSearched] = useState(false);

    // ---------------- Pagination States ----------------
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // ---------------- Table: filter / sort ----------------
    const [columnFilters, setColumnFilters] = useState(
        REPORT_COLUMNS.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
    );
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filteredData, setFilteredData] = useState([]);

    const handleColumnFilterChange = (key, value) => {
        setColumnFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key !== key) return { key, direction: 'asc' };
            if (prev.direction === 'asc') return { key, direction: 'desc' };
            return { key: null, direction: 'asc' };
        });
    };

    // ---------------- Filter and Sort Data ----------------
    useEffect(() => {
        let data = [...reportData];

        REPORT_COLUMNS.forEach((key) => {
            const val = columnFilters[key];
            if (val) {
                data = data.filter((row) =>
                    String(row[key] ?? '').toLowerCase().includes(val.toLowerCase())
                );
            }
        });

        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = String(a[sortConfig.key] ?? '').toLowerCase();
                const bVal = String(b[sortConfig.key] ?? '').toLowerCase();
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setTotalCount(data.length);
        setFilteredData(data);
    }, [reportData, columnFilters, sortConfig]);

    // paginate the already filtered/sorted data
    const pagedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ---------------- Page Load ----------------
    useEffect(() => {
        fetchPageLoadData();
    }, []);

    const fetchPageLoadData = async () => {
        try {
            setLoading(true);
            const response = await ReportPageLoad();
            if (response.ok && response.result && response.result.supplierList) {
                setSupplierList(response.result.supplierList);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ---------------- Search ----------------
    const handleSearch = async () => {
        setCurrentPage(1);
        setIsSearched(true);

        let hasError = false;
        setFromDateError('');
        setToDateError('');

        if (!fromDate) {
            setFromDateError('From Date is required');
            hasError = true;
        }
        if (!toDate) {
            setToDateError('To Date is required');
            hasError = true;
        }
        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            setToDateError('To Date must be after From Date');
            hasError = true;
        }

        if (hasError) {
            setReportData([]);
            return;
        }

        try {
            setLoading(true);

            const payload = {
                FROMDATE: fromDate,
                TODATE: toDate,
                SUPPLIER: supplier || '',
            };

            const response = await GenerateReport(payload);

            if (response?.ok && response?.result?.resultData) {
                setReportData(response.result.resultData);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error(error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    // ---------------- Clear ----------------
    const handleClear = () => {
        setFromDate(todayStr());
        setToDate(todayStr());
        setSupplier('');
        setReportData([]);
        setFromDateError('');
        setToDateError('');
        setIsSearched(false);
        setColumnFilters(REPORT_COLUMNS.reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
        setSortConfig({ key: null, direction: 'asc' });
        setCurrentPage(1);
    };

    // Export Functions
    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseOrderReport");
        XLSX.writeFile(workbook, "PurchaseOrderReport.xlsx");
    };

    // PDF Export Function
    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["PO No", "PO Date", "Supplier Name", "GST No", "Transporter Name", "Terms Of Payment", "Dispatch Through", "Delivery"]],
            body: reportData.map(item => [
                item["Po No"], item["Po Date"], item["Supplier Name"], item["GST No"], item["Transporter Name"], item["Terms Of Payment"], item["Dispatch Through"], item["Delivery"]
            ]),
        });
        doc.save("PurchaseOrderReport.pdf");
    };

    // Print Function
    const handlePrint = () => {
        const table = document.getElementById("po-table");
        if (!table) {
            alert("Table not found!");
            return;
        }
        const printContent = table.innerHTML;
        const printWindow = window.open("", "", "width=900,height=650");
        printWindow.document.write(`
                <html>
                  <head>
                    <title>Purchase Order Report</title>
                    <style>
                      body { font-family: Arial; margin:20px; }
                      table{ width:100%; border-collapse:collapse; }
                      th,td{ border:1px solid #000; padding:8px; text-align:center; }
                      h2   {   text-align:center; }
                    </style>
                  </head>
                  <body>
                    <h2>Purchase Order Report</h2>
                    <table>
                      ${printContent}
                    </table>
                  </body>
                </html>
             `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4 shadow-sm border-0 rounded-4">
                        <CCardHeader className="bg-white fw-bold fs-5">Purchase Order Report</CCardHeader>

                        <CCardBody>
                            <CRow className="g-3">

                                {/* FROM DATE */}
                                <CCol md={3}>
                                    <CFormLabel>From Date <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => {
                                            setFromDate(e.target.value);
                                            setFromDateError('');
                                            setIsSearched(false);
                                        }}
                                        invalid={!!fromDateError}
                                    />
                                    <div style={{ minHeight: '24px' }}>
                                        {fromDateError && <span className="text-danger small mt-1 d-block">{fromDateError}</span>}
                                    </div>
                                </CCol>

                                {/* TO DATE */}
                                <CCol md={3}>
                                    <CFormLabel>To Date <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => {
                                            setToDate(e.target.value);
                                            setToDateError('');
                                            setIsSearched(false);
                                        }}
                                        invalid={!!toDateError}
                                    />
                                    <div style={{ minHeight: '24px' }}>
                                        {toDateError && <span className="text-danger small mt-1 d-block">{toDateError}</span>}
                                    </div>
                                </CCol>

                                {/* SUPPLIER */}
                                <CCol md={3}>
                                    <CFormLabel>Supplier</CFormLabel>
                                    <CFormSelect
                                        value={supplier}
                                        onChange={(e) => {
                                            setSupplier(e.target.value);
                                            setIsSearched(false);
                                        }}
                                        className="h-auto"
                                    >
                                        <option value="">Select Supplier</option>
                                        {supplierList.map((item, index) => (
                                            <option key={index} value={item.SUPPLIERCODE}>{item.SUPPLIERNAME}</option>
                                        ))}
                                    </CFormSelect>
                                    <div style={{ minHeight: '24px' }}></div>
                                </CCol>

                                {/* BUTTONS */}
                                <CCol md={2} className="d-flex flex-column">
                                    <CFormLabel className="invisible">Actions</CFormLabel>
                                    <div className="w-100 d-flex gap-2">
                                        <CButton color="primary" className="flex-fill" onClick={handleSearch} disabled={loading}>
                                            {loading ? <CSpinner size="sm" /> : 'Search'}
                                        </CButton>
                                        <CButton color="danger" className="flex-fill" onClick={handleClear} disabled={loading}>
                                            {loading ? <CSpinner size="sm" /> : 'Clear'}
                                        </CButton>
                                    </div>
                                    <div style={{ minHeight: '24px' }}></div>
                                </CCol>

                            </CRow>
                        </CCardBody>
                    </CCard>

                    {/* REPORT CARD */}
                    {isSearched && !fromDateError && !toDateError && (
                        <CCard className="shadow-sm border-0 rounded-4">
                            <CCardHeader className="bg-white">
                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <h4 className="fw-bold text-primary mb-0">Report Details</h4>
                                    <div className="float-end">
                                        <CButton color="success" size="sm" title='Excel' className="me-2" onClick={handleExcelExport}>
                                            <CIcon icon={cilEducation} className="me-1" />
                                        </CButton>
                                        <CButton color="danger" size="sm" title='PDF' className="me-2" onClick={handlePdfExport}>
                                            <CIcon icon={cilFile} className="me-1" />
                                        </CButton>
                                        <CButton color="primary" size="sm" title='Print' onClick={handlePrint}>
                                            <CIcon icon={cilPrint} className="me-1" />
                                        </CButton>
                                    </div>
                                </div>
                            </CCardHeader>
                            <CCardBody id="po-table">
                                {loading ? (
                                    <div className="text-center my-5"><CSpinner color="primary" /></div>
                                ) : reportData.length > 0 ? (
                                    <>
                                        <div className="table-responsive">
                                            <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                                                <CTableHead className="custom-header">
                                                    <CTableRow>
                                                        {REPORT_COLUMNS.map((key) => (
                                                            <CTableHeaderCell key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                                                {key}{' '}
                                                                {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                            </CTableHeaderCell>
                                                        ))}
                                                    </CTableRow>
                                                    <CTableRow>
                                                        {REPORT_COLUMNS.map((key) => (
                                                            <CTableHeaderCell key={`filter-${key}`} className="p-1">
                                                                <CFormInput
                                                                    size="sm"
                                                                    value={columnFilters[key]}
                                                                    onChange={(e) => handleColumnFilterChange(key, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </CTableHeaderCell>
                                                        ))}
                                                    </CTableRow>
                                                </CTableHead>
                                                <CTableBody>
                                                    {pagedData.length > 0 ? (
                                                        pagedData.map((row, index) => (
                                                            <CTableRow key={index}>
                                                                {REPORT_COLUMNS.map((key) => (
                                                                    <CTableDataCell key={key}>{row[key]}</CTableDataCell>
                                                                ))}
                                                            </CTableRow>
                                                        ))
                                                    ) : (
                                                        <CTableRow>
                                                            <CTableDataCell colSpan={REPORT_COLUMNS.length} className="text-center text-muted">
                                                                No records found
                                                            </CTableDataCell>
                                                        </CTableRow>
                                                    )}
                                                </CTableBody>
                                            </CTable>
                                        </div>

                                        {/* PAGINATION */}
                                        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap">
                                            <div className="d-flex align-items-center">
                                                <span className="me-2 fw-bold">Rows Per Page</span>
                                                <CFormSelect
                                                    style={{ width: '90px' }}
                                                    value={itemsPerPage}
                                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                                >
                                                    <option value={10}>10</option>
                                                    <option value={25}>25</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </CFormSelect>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <CButton color="secondary" size="sm" className="me-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                                                    Previous
                                                </CButton>
                                                <span className="fw-bold mx-2">Page {currentPage} of {Math.max(1, Math.ceil(totalCount / itemsPerPage))}</span>
                                                <CButton color="secondary" size="sm" disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)} onClick={() => setCurrentPage(currentPage + 1)}>
                                                    Next
                                                </CButton>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-muted my-3">No records found</div>
                                )}
                            </CCardBody>
                        </CCard>
                    )}
                </CCol>
            </CRow>
        </>
    );
};

export default PurchaseOrderReport;