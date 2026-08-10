import React, { useState, useEffect } from 'react';
import '../CommonCss/common.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import CIcon from '@coreui/icons-react'
import { cilPencil, cilXCircle, cilCheckCircle, cilSave, cilFile, cilPrint, cilEducation, cilReload } from '@coreui/icons'

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
    CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CFormFeedback, CSpinner,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow,
} from "@coreui/react";

import { Pageload, Insert } from "../../Services/MasterService/ItemmasterService";
const getBadge = (status) => {
    switch (status) {
        case 'Active': return 'success';
        case 'Inactive': return 'secondary';
        default: return 'primary';
    }
};

const Itemmaster = () => {
    //---------------Item Details----------------//
    const [autoid, setautoid] = useState(0);
    const [itemcode, setitemcode] = useState('');
    const [itemname, setitemname] = useState('');
    const [stuffingqty, setstuffingqty] = useState('');
    const [uom, setuom] = useState('');
    const [itemtype, setitemtype] = useState('');
    const [recordStatus, setRecordStatus] = useState('');

    //----------------Dropdown----------------//
    const [recordStatuses, setRecordStatuses] = useState([]);
    const [uoms, setuoms] = useState([]);
    const [itemtypes, setitemtypes] = useState([]);

    //----------------Table----------------//
    const [itemDetails, setitemDetails] = useState([]);

    //----------------Validation----------------//
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    //----------------Pagination----------------//
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    //----------------Modal----------------//
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalColor, setModalColor] = useState('primary');

    const [filteredItems, setFilteredItems] = useState([]);
    const [searchText, setSearchText] = useState("");

    const columnKeys = ["Item Code", "Item Name", "Stuffing Qty", "UOM", "Item Type", "Status"];
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

    const fetchPageLoadData = async (currentPage) => {
        const { ok, result } = await Pageload(currentPage, itemsPerPage);

        if (ok && result?.result) {
            setRecordStatuses(result.recordStatus || []);
            setuoms(result.uom || []);
            setitemtypes(result.itemType || []);
            setitemDetails(result.itemDetails || []);
            setFilteredItems(result.itemDetails || []);
            setTotalCount(result.totalRecords || 0);
        } else {
            showModal(result.message || "Data not found", "danger");
        }

    };

    // Page load data when currentPage changes
    useEffect(() => {
        fetchPageLoadData(currentPage);
    }, [currentPage]);

    // Search + per-column filters + sort
    useEffect(() => {
        let data = [...itemDetails];

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

        setFilteredItems(data);

    }, [itemDetails, searchText, columnFilters, sortConfig]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (
            form.checkValidity() === false ||
            !itemcode || !itemname || !stuffingqty || !uom || !itemtype || !recordStatus
        ) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const payload = {
            autoid,
            itemcode,
            itemname,
            stuffingqty: String(stuffingqty),
            uom,
            itemtype,
            Status: recordStatus
        };

        try {
            setLoading(true);
            const { ok, result } = await Insert(payload);
            setLoading(false);

            if (ok && result.result) {
                showModal(result.message || "Saved successfully", "success");
                fetchPageLoadData(currentPage);
                handleClear();
            } else {
                showModal(result.message || "Failed to save", "danger");
            }
        } catch (error) {
            setLoading(false);
            showModal("Server error", "danger");
        }
    };

    const handleEdit = (item) => {
        setitemcode(item["Item Code"] || '');
        setitemname(item["Item Name"] || '');
        setstuffingqty(item["Stuffing Qty"] || '');
        setautoid(item["Edit"] || '');
        const matcheduom = uoms.find(rec => rec.METADATADESCRIPTION === item["UOM"]);
        setuom(matcheduom ? matcheduom.METASUBCODE : '');
        const matcheditemtype = itemtypes.find(rec => rec.METADATADESCRIPTION === item["Item Type"]);
        setitemtype(matcheditemtype ? matcheditemtype.METASUBCODE : '');
        const matchedstatus = recordStatuses.find(rec => rec.METADATADESCRIPTION === item["Status"]);
        setRecordStatus(matchedstatus ? matchedstatus.METASUBCODE : '');
        setIsEditMode(true);
        window.scrollTo({ top: 0, behavior: "smooth" }); // scroll up to the form so the user sees what they're editing
    };

    // Clear form 
    const handleClear = async () => {
        setautoid(0);
        setitemcode('');
        setitemname('');
        setstuffingqty('');
        setuom('');
        setitemtype('');
        setRecordStatus('');
        setValidated(false);
        fetchPageLoadData(currentPage);
        setIsEditMode(false);
    };

    // Excel Export
    const handleExcelExport = () => {
        const data = itemDetails;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ItemMaster");
        XLSX.writeFile(workbook, "ItemMaster.xlsx");
    };

    // PDF Export
    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["Item Code", "Item Name", "Stuffing Qty", "UOM", "Item Type", "Status"]],
            body: itemDetails.map(item => [
                item["Item Code"], item["Item Name"], item["Stuffing Qty"], item["UOM"], item["Item Type"], item["Status"]
            ]),
        });
        doc.save("ItemMaster.pdf");
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
              <title>Item Master Report</title>
              <style>
                body { font-family: Arial; margin:20px; }
                table{ width:100%; border-collapse:collapse; }
                th,td{ border:1px solid #000; padding:8px; text-align:center; }
                h2   {   text-align:center; }
              </style>
            </head>
            <body>
              <h2>Item Master Report</h2>
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

            {/* ================= Item Master Form ================= */}
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Item Master</strong></CCardHeader>
                        <CCardBody>
                            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <CCol md={3}>
                                        <CFormLabel>Item Code<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Item Code" value={itemcode} onChange={(e) => setitemcode(e.target.value)} maxLength={10} required />
                                        <CFormFeedback invalid>ItemCode is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Item Name<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Item Name" value={itemname} onChange={(e) => setitemname(e.target.value)} maxLength={50} required />
                                        <CFormFeedback invalid>ItemName is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Stuffing Qty<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput placeholder="Stuffing Qty" value={stuffingqty} onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow only numbers (no alphabets or special chars)
                                            if (/^\d*$/.test(value)) {
                                                setstuffingqty(value);
                                            }
                                        }} maxLength={7} required />
                                        <CFormFeedback invalid>Stuffing Qty is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>UOM<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect placeholder="Select UOM" value={uom} onChange={(e) => setuom(e.target.value)} required>
                                            <option value="">-- Select UOM --</option>
                                            {uoms.map(emp => (
                                                <option key={emp.METASUBCODE} value={emp.METASUBCODE}>
                                                    {emp.METADATADESCRIPTION}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Please select a UOM.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Item Type<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect placeholder="Select Item Type" value={itemtype} onChange={(e) => setitemtype(e.target.value)} required>
                                            <option value="">-- Select Item Type --</option>
                                            {itemtypes.map(emp => (
                                                <option key={emp.METASUBCODE} value={emp.METASUBCODE}>
                                                    {emp.METADATADESCRIPTION}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Please select an item type.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Status<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect placeholder="Select Status" value={recordStatus} onChange={(e) => setRecordStatus(e.target.value)} required>
                                            <option value="">-- Select Status --</option>
                                            {recordStatuses.map((rec) => (
                                                <option key={rec.METASUBCODE} value={rec.METASUBCODE}>
                                                    {rec.METADATADESCRIPTION}
                                                </option>
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

                    {/* ================= Item Details Table ================= */}
                    <CCard className="shadow-lg border-0">
                        <CCardHeader className="bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <h4 className="fw-bold text-primary mb-0">Item Details</h4>
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
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{item["Item Code"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Item Name"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Stuffing Qty"]}</CTableDataCell>
                                                    <CTableDataCell>{item["UOM"]}</CTableDataCell>
                                                    <CTableDataCell>{item["Item Type"]}</CTableDataCell>
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

export default Itemmaster;
