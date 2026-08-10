import React, { useState, useEffect } from "react";
import {
  CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
  CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CFormFeedback, CSpinner,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow,
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import { cilPencil, cilCheckCircle, cilXCircle, cilEducation, cilReload, cilSave, cilFile, cilPrint } from "@coreui/icons";
import '@coreui/coreui/dist/css/coreui.min.css';
import "../CommonCss/common.css";
import { Pageload, Insert } from "../../Services/MasterService/EmployeeService";

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

const EmployeeMaster = () => {
  //----------------Employee Details----------------//
  const [AutoID, setAutoID] = useState(0);
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [Department, setDepartment] = useState("");
  const [Designation, setDesignation] = useState("");
  const [ContactNumber, setContactNumber] = useState("");
  const [EmailID, setEmailID] = useState("");
  const [recordStatus, setRecordStatus] = useState("");

  //----------------Dropdown----------------//
  const [recordStatuses, setRecordStatuses] = useState([]);

  //----------------Table----------------//
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Per-column filters (key -> field, value -> typed text)
  const columnKeys = ["Employee Code", "Employee Name", "Department", "Designation", "Contact No", "Email Id", "Status",];
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

  //----------------Validation----------------//
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  //----------------Modal----------------//
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalColor, setModalColor] = useState("primary");

  //----------------Pagination----------------//
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const showModal = (message, color = "primary") => {
    setModalMessage(message);
    setModalColor(color);
    setModalVisible(true);
  };

  // Page Load
  const EmpPageload = async (page = 1) => {
    const { ok, result } = await Pageload(page, itemsPerPage);
    if (ok && result?.result) {
      setRecordStatuses(result.recordStatus || []);
      setEmployeeDetails(result.employeeDetails || []);
      setFilteredEmployees(result.employeeDetails || []);
      setTotalCount(result.totalRecords || 0);
    } else {
      showModal(result?.message || "Data not Found", "danger");
    }
  };

  useEffect(() => {
    EmpPageload(currentPage);
  }, [currentPage, itemsPerPage]);

  // Search + per-column filters + sort
  useEffect(() => {
    let data = [...employeeDetails];

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

    setFilteredEmployees(data);
  }, [columnFilters, sortConfig, employeeDetails]);


  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (
      form.checkValidity() === false ||
      !employeeCode ||
      !employeeName ||
      !Department ||
      !Designation ||
      !ContactNumber ||
      !EmailID ||
      !recordStatus
    ) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const payload = {
      Autoid: AutoID,
      Employeecode: employeeCode,
      Employeename: employeeName,
      Department: Department,
      Designation: Designation,
      Contactno: ContactNumber,
      Emailid: EmailID,
      Status: recordStatus,
    };

    setLoading(true);
    const { ok, result } = await Insert(payload);
    setLoading(false);

    if (ok && result.result) {
      showModal(result.message, "success");
      EmpPageload(currentPage);
      handleClear();
    } else {
      showModal(result.message, "danger");
    }
  };


  // Edit
  const handleEdit = (item) => {
    setIsEditMode(true);
    setAutoID(item["Edit"] ?? item["AutoID"] ?? "");
    setEmployeeCode(item["Employee Code"] || "");
    setEmployeeName(item["Employee Name"] || "");
    setDepartment(item["Department"] || "");
    setDesignation(item["Designation"] || "");
    setContactNumber(item["Contact No"] || "");
    setEmailID(item["Email Id"] || "");

    const matchedStatus = recordStatuses.find(
      (rec) => rec.METADATADESCRIPTION === item["Status"]
    );
    setRecordStatus(matchedStatus ? matchedStatus.METASUBCODE : "");
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll up to the form so the user sees what they're editing
  };


  //Clear Form
  const handleClear = () => {
    setAutoID(0);
    setEmployeeCode("");
    setEmployeeName("");
    setDepartment("");
    setDesignation("");
    setContactNumber("");
    setEmailID("");
    setRecordStatus("");
    setValidated(false);
    setIsEditMode(false);
  };

  // Excel Export
  const handleExcelExport = () => {
    const data = employeeDetails;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmployeeMaster");
    XLSX.writeFile(workbook, "EmployeeMaster.xlsx");
  };

  // PDF Export
  const handlePdfExport = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Employee Code", "Employee Name", "Department", "Designation", "Contact No", "Email Id", "Status"]],
      body: employeeDetails.map(item => [
        item["Employee Code"], item["Employee Name"], item["Department"], item["Designation"], item["Contact No"], item["Email Id"], item["Status"]
      ]),
    });
    doc.save("EmployeeMaster.pdf");
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
          <title>Employee Master Report</title>
          <style>
            body { font-family: Arial; margin:20px; }
            table{ width:100%; border-collapse:collapse; }
            th,td{ border:1px solid #000; padding:8px; text-align:center; }
            h2   {   text-align:center; }
          </style>
        </head>
        <body>
          <h2>Employee Master Report</h2>
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

  const handleEmployeeCode = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      setEmployeeCode(value);
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
    setContactNumber(value);

    // Validate only on blur AND only if user typed something
    if (e.type === "blur") {
      if (value !== "" && value.length < 10) {
        showModal("Please enter a valid Contact No", "danger");
        setContactNumber('');
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


      {/* ================= Employee Master Form ================= */}
      <CRow>
        <CCol lg={12}>
          <CCard className="shadow-lg border-0 mb-4">
            <CCardHeader className="bg-primary text-white py-3">
              <h4 className="mb-0 fw-bold">Employee Master</h4>
            </CCardHeader>

            <CCardBody>
              <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                <CRow className="g-4">

                  {/* Employee Code */}
                  <CCol md={3}>
                    <CFormLabel>Employee Code<span className="text-danger">*</span></CFormLabel>
                    <CFormInput placeholder="Employee Code" value={employeeCode} onChange={handleEmployeeCode} maxLength={10} required />
                    <CFormFeedback invalid>Employee Code is required</CFormFeedback>
                  </CCol>

                  {/* Employee Name */}
                  <CCol md={3}>
                    <CFormLabel>Employee Name<span className="text-danger">*</span></CFormLabel>
                    <CFormInput placeholder="Employee Name" value={employeeName} onChange={(e) => handleAlphabetOnly(e, setEmployeeName)} maxLength={15} required />
                    <CFormFeedback invalid>Employee Name is required</CFormFeedback>
                  </CCol>

                  {/* Department */}
                  <CCol md={3}>
                    <CFormLabel>Department<span className="text-danger">*</span></CFormLabel>
                    <CFormInput placeholder="Department" value={Department} onChange={(e) => handleAlphabetOnly(e, setDepartment)} maxLength={15} required />
                    <CFormFeedback invalid>Department is required</CFormFeedback>
                  </CCol>

                  {/* Designation */}
                  <CCol md={3}>
                    <CFormLabel>Designation<span className="text-danger">*</span></CFormLabel>
                    <CFormInput placeholder="Designation" value={Designation} onChange={(e) => handleAlphabetOnly(e, setDesignation)} maxLength={15} required />
                    <CFormFeedback invalid>Designation is required</CFormFeedback>
                  </CCol>

                  {/* Contact */}
                  <CCol md={3}>
                    <CFormLabel>Contact Number<span className="text-danger">*</span></CFormLabel>
                    <CFormInput placeholder="Contact No" value={ContactNumber} onChange={handleContactNo} onBlur={handleContactNo} maxLength={10} required />
                    <CFormFeedback invalid>Contact Number is required</CFormFeedback>
                  </CCol>

                  {/* Email */}
                  <CCol md={3}>
                    <CFormLabel>Email ID<span className="text-danger">*</span></CFormLabel>
                    <CFormInput placeholder="Email ID" value={EmailID} onChange={handleEmailChange} onBlur={validateEmail} maxLength={30} required />
                    <CFormFeedback invalid>Email ID is required</CFormFeedback>
                  </CCol>

                  {/* Record Status */}
                  <CCol md={3}>
                    <CFormLabel>Status<span className="text-danger">*</span></CFormLabel>
                    <CFormSelect value={recordStatus} onChange={(e) => setRecordStatus(e.target.value)} required >
                      <option value="">-- Select Status --</option>
                      {recordStatuses.map((item) => (
                        <option key={item.METASUBCODE} value={item.METASUBCODE}>
                          {item.METADATADESCRIPTION}
                        </option>
                      ))}
                    </CFormSelect>
                    <CFormFeedback invalid>Please Select Status</CFormFeedback>
                  </CCol>

                  {/* Buttons */}
                  <CCol md={3} className="d-flex align-items-end">
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
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>

          {/* ================= Employee Details ================= */}
          <CCard className="shadow-lg border-0">
            <CCardHeader className="bg-white">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <h4 className="fw-bold text-primary mb-0">Employee Details</h4>
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

            {/* ================= Employee Details Table ================= */}
            <CCardBody>
              <div className="table-responsive">
                <CTable id="po-table" bordered striped hover responsive align="middle" className="text-center custom-table">
                  <CTableHead className="custom-header">
                    <CTableRow>
                      {columnKeys.map((key) => (
                        <CTableHeaderCell key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer", userSelect: "none" }} >
                          {key === "Contact No" ? "Contact No" : key === "Email Id" ? "Email ID" : key === "Status" ? "Status" : key}{" "}
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
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item["Employee Code"]}</CTableDataCell>
                          <CTableDataCell>{item["Employee Name"]}</CTableDataCell>
                          <CTableDataCell>{item["Department"]}</CTableDataCell>
                          <CTableDataCell>{item["Designation"]}</CTableDataCell>
                          <CTableDataCell>{item["Contact No"]}</CTableDataCell>
                          <CTableDataCell>{item["Email Id"]}</CTableDataCell>
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

export default EmployeeMaster;