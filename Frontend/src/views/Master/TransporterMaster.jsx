import React, { useState, useEffect } from 'react';
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
    CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CFormFeedback, CSpinner,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow,
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import { cilPencil, cilCheckCircle, cilXCircle, cilEducation, cilReload, cilSave, cilFile, cilPrint } from "@coreui/icons";
import '@coreui/coreui/dist/css/coreui.min.css';
import "../CommonCss/common.css";
import { Pageload, Insert } from "../../Services/MasterService/TransportermasterService";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getBadge = (status) => {
    switch (status) {
        case 'Active': return 'success';
        case 'Inactive': return 'secondary';
        default: return 'primary';
    }
};


//Function components
const TransporterMaster = () => {
    //----------------Transporter Details----------------//
    const [AutoID, setAutoID] = useState(0);
    const [TransporterCode, setTransporterCode] = useState('');
    const [TransporterName, setTransporterName] = useState('');
    const [ContactPerson, setContactPerson] = useState('');
    const [ContactNo, setContactNo] = useState('');
    const [EmailId, setEmailId] = useState('');
    const [Address, setAddress] = useState('');
    const [Status, setStatus] = useState('');

    const [recordStatuses, setRecordStatuses] = useState([]);   //Dropdown & Table Data
    const [transporterDetails, setTransporterDetails] = useState([]);
    const [filteredTransporters, setFilteredTransporters] = useState([]);

    //Validation
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);   //show success/error message
    const [modalMessage, setModalMessage] = useState('');
    const [modalColor, setModalColor] = useState('primary');

    //Pagination
    const [currentPage, setCurrentPage] = useState(1);   //Pagination
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Per-column filters (key -> field, value -> typed text)
    const columnKeys = ["Transporter Code", "Transporter Name", "Contact Person", "Contact No", "Email Id", "Address", "Status"];
    const [columnFilters, setColumnFilters] = useState(columnKeys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}));
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });  // Sort state

    const handleColumnFilterChange = (key, value) => {
        setColumnFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key !== key) return { key, direction: "asc" };
            if (prev.direction === "asc") return { key, direction: "desc" };
            return { key: null, direction: "asc" }; // third click clears sort
        });
    };


    const showModal = (message, color = 'primary') => {    //Show Pop-up message
        setModalMessage(message);
        setModalColor(color);
        setModalVisible(true);
    };

    const TransPageload = async (page = 1) => {               //API Call _> Get Pageload
        const { ok, result } = await Pageload(page, itemsPerPage);
        if (ok && result?.result) {
            setRecordStatuses(result.recordStatus || []);   //Store Data
            setTransporterDetails(result.transporterDetails || []);
            setFilteredTransporters(result.transporterDetails || []);
            setTotalCount(result.totalRecords);
        } else {
            showModal(result?.message || "Data not found", "danger");
        }
    };

    useEffect(() => {   //Runs when page and item per page changes
        TransPageload(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    // Search + per-column filters + sort
    useEffect(() => {
        let data = [...transporterDetails];

        // per-column filters
        columnKeys.forEach((key) => {
            const filterValue = columnFilters[key];
            if (filterValue) {
                data = data.filter((emp) =>
                    String(emp[key] ?? "").toLowerCase().includes(filterValue.toLowerCase())
                );
            }
        });

        // sort
        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = String(a[sortConfig.key] ?? "").toLowerCase();
                const bVal = String(b[sortConfig.key] ?? "").toLowerCase();
                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        setFilteredTransporters(data);
    }, [columnFilters, sortConfig, transporterDetails]);


    //Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false || !TransporterCode || !TransporterName || !ContactPerson || !ContactNo || !EmailId || !Address || !Status) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        const payload = { TransporterCode, TransporterName, ContactPerson, ContactNo, EmailId, Address, Status, AutoID };

        setLoading(true);
        const { ok, result } = await Insert(payload);    //Call API -> Insert
        console.log(result);
        setLoading(false);

        if (ok && result.result) {        //Handle Response
            showModal(result.message || "Saved successfully", "success");
            TransPageload(currentPage);
            handleClear();
        } else {
            showModal(result.message || "Failed to save", "danger");
        }

    };


    //Clear All Inputs
    const handleClear = () => {
        setAutoID('');
        setTransporterCode('');
        setTransporterName('');
        setContactPerson('');
        setContactNo('');
        setEmailId('');
        setAddress('');
        setStatus('');
        setValidated(false);
        setIsEditMode(false);
    };


    //Handles Edit
    const handleEdit = (item) => {
        setIsEditMode(true);
        setAutoID(item['Edit'] || '');
        setTransporterCode(item['Transporter Code'] || '');
        setTransporterName(item['Transporter Name'] || '');
        setContactPerson(item['Contact Person'] || '');
        setContactNo(item['Contact No'] || '');
        setEmailId(item['Email Id'] || '');
        setAddress(item['Address'] || '');
        const matchedStatus = recordStatuses.find((rec) => rec.METADATADESCRIPTION === item['Status']);
        setStatus(matchedStatus ? matchedStatus.METASUBCODE : '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Export Functions
    const handleExcelExport = () => {
        const data = transporterDetails;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TransporterMaster");
        XLSX.writeFile(workbook, "TransporterMaster.xlsx");
    };

    // Export to PDF
    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["Transporter Code", "Transporter Name", "Contact Person", "Contact No", "Email Id", "Address", "Status"]],
            body: transporterDetails.map(item => [
                item["Transporter Code"], item["Transporter Name"], item["Contact Person"], item["Contact No"], item["Email Id"], item["Address"], item["Status"]
            ]),
        });
        doc.save("TransporterMaster.pdf");
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
              <title>Transporter Master Report</title>
              <style>
                body { font-family: Arial; margin:20px; }
                table{ width:100%; border-collapse:collapse; }
                th,td{ border:1px solid #000; padding:8px; text-align:center; }
                h2   {   text-align:center; }
              </style>
            </head>
            <body>
              <h2>Transporter Master Report</h2>
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
        setEmailId(value);
    };

    const validateEmail = () => {
        if (!EmailId) return;

        const emailReg = /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;

        if (!emailReg.test(EmailId)) {
            showModal("Please enter a valid Email ID", "danger");
            setEmailId('');
        }
    };

    const handleTransporterCode = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9]*$/.test(value)) {
            setTransporterCode(value);
        }
    };

    const handleName = (e, setFunc) => {
        const value = e.target.value;
        if (/^[a-zA-Z. ]*$/.test(value)) {
            setFunc(value);
        }
    };

    const handleAddress = (e, setFunc) => {
        const value = e.target.value;

        if (/^[a-zA-Z0-9 ,./-]*$/.test(value)) {
            setFunc(value);
        }
    };

    const handlePhone = (e) => {
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

    //Main Return
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


            {/* ================= Transporter Details Form ================= */}
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Transporter Master</strong></CCardHeader>
                        <CCardBody>
                            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <CCol md={3}>
                                        <CFormLabel>Transporter Code<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Transporter Code" value={TransporterCode} onChange={handleTransporterCode} maxLength={10} required />
                                        <CFormFeedback invalid>Transporter Code is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Transporter Name<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Transporter Name" value={TransporterName} onChange={(e) => handleName(e, setTransporterName)} maxLength={30} required />
                                        <CFormFeedback invalid>Transporter Name is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Contact Person<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Contact Person" value={ContactPerson} onChange={(e) => handleName(e, setContactPerson)} maxLength={30} required />
                                        <CFormFeedback invalid>Contact Person is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Contact No<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Contact No" value={ContactNo} onChange={handlePhone} onBlur={handlePhone} maxLength={10} required />
                                        <CFormFeedback invalid>Contact No is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Email ID<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Email ID" value={EmailId} onChange={handleEmailChange} onBlur={validateEmail} maxLength={30} required />
                                        <CFormFeedback invalid>Email ID is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Address<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Address" value={Address} onChange={(e) => handleAddress(e, setAddress)} maxLength={50} required />
                                        <CFormFeedback invalid>Address is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Status<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect value={Status} onChange={(e) => setStatus(e.target.value)} required>
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

                    {/* ================== Transporter Details Table ================= */}
                    <CCard className="shadow-lg border-0">
                        <CCardHeader className="bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <h4 className="fw-bold text-primary mb-0">Transporter Details</h4>
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
                                        {filteredTransporters.length > 0 ? (
                                            filteredTransporters.map((item, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{item["Transporter Code"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Transporter Name"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Contact Person"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Contact No"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Email Id"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Address"]}</CTableDataCell>

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
            </CRow >
        </>
    );
};

export default TransporterMaster;