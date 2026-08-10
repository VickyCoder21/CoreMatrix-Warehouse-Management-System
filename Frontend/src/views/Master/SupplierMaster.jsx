import React, { useState, useEffect } from 'react';
import '../CommonCss/common.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import CIcon from '@coreui/icons-react'
import { cilPencil, cilXCircle, cilCheckCircle, cilSave, cilFile, cilPrint, cilEducation, cilReload } from '@coreui/icons'

import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
    CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CFormFeedback, CSpinner,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow,
} from "@coreui/react";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Pageload, Insert } from "../../Services/MasterService/SuppliermasterService";

const getBadge = (status) => {
    switch (status) {
        case 'Active': return 'success';
        case 'Inactive': return 'secondary';
        default: return 'primary';
    }
};


const Suppliermaster = () => {
    //---------------Supplier Details----------------
    const [AutoID, setAutoID] = useState(0);
    const [SupplierCode, setSupplierCode] = useState('');
    const [SupplierName, setSupplierName] = useState('');
    const [SupplierAddress, setSupplierAddress] = useState('');
    const [ContactPerson, setContactPerson] = useState('');
    const [ContactNo, setContactNo] = useState('');
    const [EmailID, setEmailID] = useState('');
    const [GSTNo, setGSTNo] = useState('');
    const [recordStatus, setRecordStatus] = useState('');

    //----------------Dropdown----------------//
    const [recordStatuses, setRecordStatuses] = useState([]);
    const [supplierDetails, setSupplierDetails] = useState([]);

    //----------------Validation----------------//
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    //----------------Modal----------------//
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalColor, setModalColor] = useState('primary');

    //----------------Pagination----------------//
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [searchText, setSearchText] = useState("");

    const columnKeys = ["Supplier Code", "Supplier Name", "Supplier Address", "Contact Person", "Contact No", "Email ID", "GST No", "Status"];
    const [columnFilters, setColumnFilters] = useState(
        columnKeys.reduce((acc, key) => ({ ...acc, [key]: "" }), {})
    );
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    const handleColumnFilterChange = (key, value) => {
        setColumnFilters((prev) => ({ ...prev, [key]: value, }));
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key !== key)
                return { key, direction: "asc" };

            if (prev.direction === "asc")
                return { key, direction: "desc" };

            return { key: null, direction: "asc" };
        });
    };

    const showModal = (message, color = 'primary') => {
        setModalMessage(message);
        setModalColor(color);
        setModalVisible(true);
    };


    const SupplierPageload = async (page = 1) => {
        const { ok, result } = await Pageload(page, itemsPerPage);
        if (ok && result?.result) {
            setRecordStatuses(result.recordStatus || []);
            setSupplierDetails(result.supplierDetails || []);
            setFilteredSuppliers(result.supplierDetails || []);
            setTotalCount(result.totalRecords || 0);
        } else {
            showModal(result?.message || "Data not found", "danger");
        }
    };

    //Pageload 
    useEffect(() => {
        SupplierPageload(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    // Search + per-column filters + sort
    useEffect(() => {
        let data = [...supplierDetails];

        if (searchText) {
            data = data.filter(item =>
                Object.values(item)
                    .join(" ")
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            );
        }

        columnKeys.forEach((key) => {
            const filter = columnFilters[key];

            if (filter) {
                data = data.filter(item =>
                    String(item[key] ?? "")
                        .toLowerCase()
                        .includes(filter.toLowerCase())
                );
            }
        });

        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = String(a[sortConfig.key] ?? "").toLowerCase();
                const bVal = String(b[sortConfig.key] ?? "").toLowerCase();

                if (aVal < bVal)
                    return sortConfig.direction === "asc" ? -1 : 1;

                if (aVal > bVal)
                    return sortConfig.direction === "asc" ? 1 : -1;

                return 0;
            });
        }

        setFilteredSuppliers(data);

    }, [supplierDetails, searchText, columnFilters, sortConfig]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false || !SupplierCode || !SupplierName || !SupplierAddress || !ContactPerson || !ContactNo || !EmailID || !GSTNo || !recordStatus) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        const payload = { SupplierCode, SupplierName, SupplierAddress, ContactPerson, ContactNo, EmailID, GSTNo, Status: recordStatus, AutoID };

        setLoading(true);
        const { ok, result } = await Insert(payload);

        setLoading(false);

        if (ok && result.result) {
            showModal(result.message || "Saved successfully", "success");
            SupplierPageload(currentPage);
            handleClear();
        } else {
            showModal(result.message || "Failed to save", "danger");
        }

    };

    //Edit
    const handleEdit = (item) => {
        setIsEditMode(true);
        setAutoID(item['Edit'] || '');
        setSupplierCode(item['Supplier Code'] || '');
        setSupplierName(item['Supplier Name'] || '');
        setSupplierAddress(item['Supplier Address'] || '');
        setContactPerson(item['Contact Person'] || '');
        setContactNo(item['Contact No'] || '');
        setEmailID(item['Email ID'] || '');
        setGSTNo(item['GST No'] || '');
        const matchedStatus = recordStatuses.find((rec) => rec.METADATADESCRIPTION === item['Status']);
        setRecordStatus(matchedStatus ? matchedStatus.METASUBCODE : '');
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    //Clear
    const handleClear = () => {
        setAutoID('');
        setSupplierCode('');
        setSupplierName('');
        setSupplierAddress('');
        setContactPerson('');
        setContactNo('');
        setEmailID('');
        setGSTNo('');
        setRecordStatus('');
        setValidated(false);
        setIsEditMode(false);
    };

    // Excel Export
    const handleExcelExport = () => {
        const data = supplierDetails;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SupplierMaster");
        XLSX.writeFile(workbook, "SupplierMaster.xlsx");
    };

    // PDF Export
    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["Supplier Code", "Supplier Name", "Supplier Address", "Contact Person", "Contact No", "Email ID", "GST No", "Status"]],
            body: supplierDetails.map(item => [
                item["Supplier Code"], item["Supplier Name"], item["Supplier Address"], item["Contact Person"], item["Contact No"], item["Email ID"], item["GST No"], item["Status"]
            ]),
        });
        doc.save("SupplierMaster.pdf");
    };

    // Print
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
              <title>Supplier Master Report</title>
              <style>
                body { font-family: Arial; margin:20px; }
                table{ width:100%; border-collapse:collapse; }
                th,td{ border:1px solid #000; padding:8px; text-align:center; }
                h2   {   text-align:center; }
              </style>
            </head>
            <body>
              <h2>Supplier Master Report</h2>
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

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmailID(value);
    };

    const validateEmail = () => {
        if (!EmailID) return;

        const emailReg = /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;

        if (!emailReg.test(EmailID)) {
            showModal("Please enter a valid Email ID", "danger");
            setEmailID('');
        }
    };


    const validateGST = () => {
        const gstReg = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

        if (GSTNo && !gstReg.test(GSTNo)) {
            showModal("Please enter valid GST No (Ex: 27ABCDE1234F1Z5)", "danger");
            setGSTNo('');
        }
    };

    const handleGSTChange = (e) => {
        let value = e.target.value.toUpperCase(); // auto uppercase
        setGSTNo(value);
    };

    const handleSupplierCode = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9]*$/.test(value)) {
            setSupplierCode(value);
        }
    };

    const handleAlphabetOnly = (e, setter) => {
        const value = e.target.value;
        if (/^[A-Za-z. ]*$/.test(value)) {
            setter(value);
        }
    };

    const handleContactNo = (e) => {
        const value = e.target.value;

        // Allow only numbers, +, -
        if (!/^[0-9+-]*$/.test(value)) return;
        setContactNo(value);

        // Validate only on blur AND only if user typed something
        if (e.type === "blur") {
            if (value !== "" && value.length < 10) {
                showModal("Please enter a valid Contact No", "danger");
                setContactNo('');
            }
        }
    };


    return (
        <>
            {/* ================= Success / Error Modal ================= */}
            <CModal visible={modalVisible} alignment="center" backdrop="static" onClose={() => setModalVisible(false)} >
                <CModalHeader closeButton>
                    <CModalTitle className={`fw-bold text-${modalColor === "success" ? "success" : "danger"}`} >
                        {modalColor === "success" ? "Success" : "Error"}
                    </CModalTitle>
                </CModalHeader>

                <CModalBody className="text-center d-flex flex-column justify-content-center align-items-center" >
                    {modalColor === "success" ? (
                        <CIcon icon={cilCheckCircle} className="text-success mb-3" style={{ width: "70px", height: "70px" }} />
                    ) : (
                        <CIcon icon={cilXCircle} className="text-danger mb-3" style={{ width: "70px", height: "70px" }} />
                    )}
                    <p className="fs-5 fw-semibold mt-3 mb-0"> {modalMessage} </p>
                </CModalBody>

                <CModalFooter className="justify-content-center py-2">
                    <CButton color="secondary" className="px-4" onClick={() => setModalVisible(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* ================= Supplier Master Form ================= */}
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Supplier Master</strong></CCardHeader>
                        <CCardBody>
                            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <CCol md={3}>
                                        <CFormLabel>Supplier Code<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Supplier Code" value={SupplierCode} onChange={handleSupplierCode} maxLength={10} required />
                                        <CFormFeedback invalid>Supplier Code is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Supplier Name<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Supplier Name" value={SupplierName} onChange={(e) => handleAlphabetOnly(e, setSupplierName)} maxLength={15} required />
                                        <CFormFeedback invalid>Supplier Name is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Supplier Address<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Supplier Address" value={SupplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} maxLength={50} required />
                                        <CFormFeedback invalid>Supplier Address is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Contact Person<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Contact Person" value={ContactPerson} onChange={(e) => handleAlphabetOnly(e, setContactPerson)} maxLength={15} required />
                                        <CFormFeedback invalid>Contact Person is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Contact No<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Contact No" value={ContactNo} onChange={handleContactNo} onBlur={handleContactNo} maxLength={10} required />
                                        <CFormFeedback invalid>Contact No is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Email ID<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Email ID" value={EmailID} onChange={handleEmailChange} onBlur={validateEmail} maxLength={50} required />
                                        <CFormFeedback invalid>Email ID is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>GST No<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="GST No" value={GSTNo} onChange={handleGSTChange} onBlur={validateGST} maxLength={15} required />
                                        <CFormFeedback invalid>GST No is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Status<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect value={recordStatus} onChange={(e) => setRecordStatus(e.target.value)} required>
                                            <option value="">-- Select Status --</option>
                                            {recordStatuses.map((rec) => (
                                                <option key={rec.METASUBCODE} value={rec.METASUBCODE}>{rec.METADATADESCRIPTION}</option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Please select a status.</CFormFeedback>
                                    </CCol>

                                    <CCol xs={12}>
                                        <div>
                                            <CButton color="primary" type="submit" className="me-2 px-4" disabled={loading}>
                                                {loading ? (
                                                    <CSpinner size="sm" />
                                                ) : (
                                                    <>
                                                        <CIcon icon={cilSave} className="me-2" />
                                                        {isEditMode ? "Update" : "Save"}
                                                    </>
                                                )}
                                            </CButton>

                                            <CButton color="danger" onClick={handleClear} disabled={loading}>
                                                <CIcon icon={cilReload} className="me-2" />
                                                Clear
                                            </CButton>
                                        </div>
                                    </CCol>
                                </div>
                            </CForm>
                        </CCardBody>
                    </CCard>


                    {/* ================= Supplier Master Details Table ================= */}
                    <CCard className="shadow-lg border-0">
                        <CCardHeader className="bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <h4 className="fw-bold text-primary mb-0">Supplier Details</h4>
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

                        <CCardBody>
                            <div className="table-responsive">
                                <CTable id="po-table" bordered striped hover responsive align="middle" className="text-center custom-table">
                                    <CTableHead className="custom-header">
                                        <CTableRow>
                                            {columnKeys.map((key) => (
                                                <CTableHeaderCell key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer", userSelect: "none" }} >
                                                    {key === "Contact No" ? "Contact No" : key === "Email ID" ? "Email ID" : key === "Status" ? "Status" : key}{" "}
                                                    {sortConfig.key === key ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}
                                                </CTableHeaderCell>
                                            ))}
                                            <CTableHeaderCell>Edit</CTableHeaderCell>
                                        </CTableRow>

                                        {/* Per-column filter row */}
                                        <CTableRow>
                                            {columnKeys.map((key) => (
                                                <CTableHeaderCell key={`filter-${key}`} className="p-1">
                                                    <CFormInput
                                                        size="sm"
                                                        value={columnFilters[key]}
                                                        onChange={(e) => handleColumnFilterChange(key, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </CTableHeaderCell>
                                            ))}
                                            <CTableHeaderCell />
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                        {filteredSuppliers.length > 0 ? (
                                            filteredSuppliers.map((item, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{item["Supplier Code"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Supplier Name"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Supplier Address"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Contact Person"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Contact No"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Email ID"]}</CTableDataCell>
                                                    <CTableDataCell>{item["GST No"]}</CTableDataCell>
                                                    <CTableDataCell>
                                                        <CBadge color={getBadge(item["Status"])}>
                                                            {item["Status"]}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CButton color="warning" size="sm" onClick={() => handleEdit(item)}>
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan={8} className="text-center text-muted">
                                                    No Records Found
                                                </CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>

                            {/* ================= Pagination ================= */}
                            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap">
                                <div className="d-flex align-items-center">
                                    <span className="me-2 fw-bold">Rows Per Page</span>
                                    <CFormSelect style={{ width: "90px" }} value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </CFormSelect>
                                </div>

                                <div className="d-flex align-items-center">
                                    <CButton color="secondary" size="sm" className="me-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} >
                                        Previous
                                    </CButton>
                                    <span className="fw-bold mx-2">Page {currentPage}</span>
                                    <CButton color="secondary" size="sm" disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)} onClick={() => setCurrentPage(currentPage + 1)} >
                                        Next
                                    </CButton>
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    );
};

export default Suppliermaster;