import React, { useState, useEffect } from 'react';
import '../CommonCss/common.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilSearch, cilCheckCircle, cilXCircle, cilReload, cilSave, cilEducation, cilFile, cilPrint } from '@coreui/icons';
import { Pageload, PoNoFetch, insert, Edit, View } from "../../Services/TransactionService/GrnEntryService";
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel,
    CTable, CRow, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CFormFeedback, CSpinner, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react';

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GRN_COLUMN_KEYS = ['GRN No', 'GRN Date', 'Invoice No', 'Invoice Date', 'PO No', 'Supplier', 'Transporter'];
const todayStr = () => new Date().toISOString().slice(0, 10);

const GRNEntry = () => {
    // ---------------- Header States ----------------
    const [autoid, setAutoid] = useState(0);
    const [grnno, setGrnno] = useState('');
    const [grndate, setGrndate] = useState(todayStr());
    const [pono, setPono] = useState('');
    const [suppliercode, setSuppliercode] = useState('');   // sent to API
    const [suppliername, setSuppliername] = useState('');
    const [transportercode, setTransportercode] = useState('');
    const [transportername, setTransportername] = useState('');
    const [invoiceno, setInvoiceno] = useState('');
    const [invoicedate, setInvoicedate] = useState('');
    const [remarks, setRemarks] = useState('');

    // ---------------- Lookup lists ----------------
    const [poDetails, setpoDetails] = useState([]);

    // ---------------- Item Details ----------------
    const [addedItems, setAddedItems] = useState([]);

    // ---------------- Validation / UI ----------------
    const [validated, setValidated] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({ pono: false });
    const [loading, setLoading] = useState(false);
    const [submitLabel, setSubmitLabel] = useState('Submit');
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleView, setModalVisibleView] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalColor, setModalColor] = useState('primary');
    const [itemDetailsView, setItemDetailsView] = useState([]);

    const showModal = (message, color = 'primary') => {
        setModalMessage(message);
        setModalColor(color);
        setModalVisible(true);
    };

    // ---------------- Table ----------------
    const [grnDetails, setgrnDetails] = useState([]);
    const [filteredgrnDetails, setFilteredgrnDetails] = useState([]);
    const [columnFilters, setColumnFilters] = useState(
        GRN_COLUMN_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
    );
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleColumnFilterChange = (key, value) => {
        setColumnFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key !== key) return { key, direction: 'asc' };
            if (prev.direction === 'asc') return { key, direction: 'desc' };
            return { key: null, direction: 'asc' };
        });
    };

    // ---------------- Filter and Sort Effect ----------------
    useEffect(() => {
        let data = [...grnDetails];

        GRN_COLUMN_KEYS.forEach((key) => {
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

        setFilteredgrnDetails(data);
    }, [grnDetails, columnFilters, sortConfig]);


    // ---------------- API: Page Load ----------------
    const fetchPageLoadData = async (page = 1) => {
        const { ok, result } = await Pageload(page, itemsPerPage);
        if (ok && result) {
            setGrnno(result.grnno || result.geno || '');
            setInvoiceno(result.invoiceno || '');
            setpoDetails(result.poDetails || []);
            setgrnDetails(result.grnDetails || []);
            setTotalCount(result.totalRecords || 0);
        } else {
            showModal(result?.message || 'Data not found', 'danger');
        }
    };

    // ---------------- Initial Load Effect ----------------
    useEffect(() => {
        fetchPageLoadData(currentPage);
    }, [currentPage]);


    // ---------------- Handlers ----------------
    const handlePoNoChange = async (e) => {
        const selectedPo = e.target.value;
        setPono(selectedPo);
        setFieldErrors((prev) => ({ ...prev, pono: false }));

        if (!selectedPo) {
            setSuppliercode('');
            setSuppliername('');
            setTransportercode('');
            setTransportername('');
            setAddedItems([]);
            return;
        }

        const { ok, result } = await PoNoFetch(selectedPo);

        if (ok && result?.result) {
            const header = (result.supdetails || [])[0];
            setSuppliercode(header?.SUPPLIERCODE || '');
            setSuppliername(header?.SUPPLIERNAME || '');
            setTransportercode(header?.TRANSPORTERCODE || '');
            setTransportername(header?.TRANSPORTERNAME || '');
            const items = (result.itemdetails || []).map((item) => ({
                itemcode: item.ITEMCODE,
                itemname: item.ITEMNAME,
                orderedqty: item.ORDEREDQTY ?? 0,
                receivedqty: item.RECEIVEDQTY ?? '',
                acceptedqty: item.ACCEPTEDQTY ?? '',
                rejectedqty: item.REJECTEDQTY ?? '',
            }));
            setAddedItems(items);
        } else {
            showModal(result?.message || 'Data not found for selected PO', 'danger');
        }
    };


    const handleQtyChange = (index, field, value) => {
        const cleaned = value.replace(/[^0-9]/g, '');

        setAddedItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;

                const updated = {
                    ...item,
                    [field]: cleaned,
                };

                const received = Number(
                    field === "receivedqty" ? cleaned : updated.receivedqty
                ) || 0;

                const accepted = Number(
                    field === "acceptedqty" ? cleaned : updated.acceptedqty
                ) || 0;

                // Don't allow Accepted Qty > Received Qty
                if (accepted > received) {
                    updated.acceptedqty = String(received);
                    updated.rejectedqty = "0";
                } else {
                    updated.rejectedqty = String(received - accepted);
                }

                return updated;
            })
        );
    };

    // ---------------- Submit Form ----------------
    const handleSubmit = async (event) => {
        event.preventDefault();

        const isDateInvalid = !grndate;
        const isPoInvalid = !pono;

        setDateError(isDateInvalid);
        setFieldErrors((prev) => ({ ...prev, pono: isPoInvalid }));

        if (isDateInvalid || isPoInvalid) {
            setValidated(true);
            return;
        }

        if (addedItems.length === 0) {
            showModal('Add at least one item detail', 'danger');
            return;
        }

        // Accepted + Rejected must equal Received for every line item
        const mismatched = addedItems.find((item) => {
            const received = Number(item.receivedqty) || 0;
            const accepted = Number(item.acceptedqty) || 0;
            const rejected = Number(item.rejectedqty) || 0;
            return accepted + rejected !== received;
        });

        if (mismatched) {
            showModal(
                `For item ${mismatched.itemcode}, Accepted Qty + Rejected Qty must equal Received Qty.`,
                'danger'
            );
            return;
        }

        const combinedBody = {
            AUTOID: autoid,
            GRNNO: String(grnno),
            GRNDATE: String(grndate),
            INVOICENO: String(invoiceno),
            INVOICEDATE: String(invoicedate),
            PONO: String(pono),
            SUPPLIER: String(suppliercode),
            TRANSPORTER: String(transportercode),
            REMARKS: String(remarks),
            Usercode: "ADMIN",

            AddedItems: addedItems.map((item) => ({
                ITEMCODE: String(item.itemcode),
                ITEMNAME: String(item.itemname),
                ORDEREDQTY: String(item.orderedqty),
                RECEIVEDQTY: String(item.receivedqty),
                ACCEPTEDQTY: String(item.acceptedqty),
                REJECTEDQTY: String(item.rejectedqty),
            })),
        };

        try {
            setLoading(true);
            const { ok, result } = await insert(combinedBody);
            setLoading(false);

            if (ok && result?.result) {
                showModal(result.message || 'Saved successfully', 'success');
                handleClear();
            } else {
                showModal(result?.message || 'Failed to save', 'danger');
            }
        } catch (error) {
            setLoading(false);
            showModal('Server error', 'danger');
        }
    };

    // ---------------- View Function ----------------
    const handleView = async (grn) => {
        const grnNo = grn['GRN No'];
        if (!grnNo) return;

        const { ok, result } = await View(grnNo);
        if (ok && result && result.result) {
            setItemDetailsView(result.itemdetails || []);
            setModalVisibleView(true);
        } else {
            showModal(result?.message || 'Data not found', 'danger');
        }
    };

    // ---------------- Edit Existing GRN ----------------
    const handleEdit = async (row) => {
        const grnNo = row['GRN No'];
        if (!grnNo) return;

        const { ok, result } = await Edit(grnNo);
        if (ok && result?.result) {
            const header = (result.headerdetails || [])[0];
            if (!header) return;

            setAutoid(header.AUTOID || 0);
            setGrnno(header.GRNNO || '');
            setGrndate(header.GRNDATE ? String(header.GRNDATE).slice(0, 10) : '');
            setPono(header.PONO || '');
            setSuppliercode(header.SUPPLIERCODE || '');
            setSuppliername(header.SUPPLIERNAME || '');
            setTransportercode(header.TRANSPORTERCODE || '');
            setTransportername(header.TRANSPORTERNAME || '');
            setInvoiceno(header.INVOICENO || '');
            setInvoicedate(header.INVOICEDATE ? String(header.INVOICEDATE).slice(0, 10) : '');
            setRemarks(header.REMARKS || '');

            setAddedItems(
                (result.itemdetails || []).map((item) => ({
                    itemcode: item.ITEMCODE,
                    itemname: item.ITEMNAME,
                    orderedqty: item.ORDEREDQTY,
                    receivedqty: item.RECEIVEDQTY,
                    acceptedqty: item.ACCEPTEDQTY,
                    rejectedqty: item.REJECTEDQTY,
                }))
            );

            setSubmitLabel('Update');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showModal(result?.message || 'Data not found', 'danger');
        }
    };

    // ---------------- Clear Form ----------------
    const handleClear = async () => {
        setAutoid(0);
        setGrndate(todayStr());
        setInvoiceno('');
        setInvoicedate('');
        setRemarks('');
        setPono('');
        setSuppliercode('');
        setSuppliername('');
        setTransportercode('');
        setTransportername('');
        setAddedItems([]);
        setValidated(false);
        setDateError(false);
        setFieldErrors({ pono: false });
        setSubmitLabel('Submit');
        await fetchPageLoadData(1);
    };

    // Export Functions
    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(grnDetails);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GRN");
        XLSX.writeFile(workbook, "GRN.xlsx");
    };

    // PDF Export Function
    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["GRN No", "GRN Date", "Invoice No", "Invoice Date", "PO No", "Supplier", "Transporter"]],
            body: grnDetails.map(item => [
                item["GRN No"], item["GRN Date"], item["Invoice No"], item["Invoice Date"], item["PO No"], item["Supplier"], item["Transporter"]
            ]),
        });
        doc.save("GRN.pdf");
    };

    // Print Function
    const handlePrint = () => {
        const table = document.getElementById("grn-table");
        if (!table) {
            alert("Table not found!");
            return;
        }
        const printContent = table.innerHTML;
        const printWindow = window.open("", "", "width=900,height=650");
        printWindow.document.write(`
              <html>
                <head>
                  <title>GRN Report</title>
                  <style>
                    body { font-family: Arial; margin:20px; }
                    table{ width:100%; border-collapse:collapse; }
                    th,td{ border:1px solid #000; padding:8px; text-align:center; }
                    h2   {   text-align:center; }
                  </style>
                </head>
                <body>
                  <h2>GRN Report</h2>
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
            {/* SUCCESS / ERROR MODAL */}
            <CModal visible={modalVisible} alignment="center" backdrop="static" onClose={() => setModalVisible(false)}>
                <CModalHeader closeButton>
                    <CModalTitle className={`fw-bold text-${modalColor === 'success' ? 'success' : 'danger'}`}>
                        {modalColor === 'success' ? 'Success' : 'Error'}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody className="text-center d-flex flex-column justify-content-center align-items-center">
                    {modalColor === 'success' ? (
                        <CIcon icon={cilCheckCircle} className="text-success mb-3" style={{ width: '70px', height: '70px' }} />
                    ) : (
                        <CIcon icon={cilXCircle} className="text-danger mb-3" style={{ width: '80px', height: '80px' }} />
                    )}
                    <p className="fs-5 fw-semibold mt-3 mb-0">{modalMessage}</p>
                </CModalBody>
                <CModalFooter className="justify-content-center py-2">
                    <CButton color="secondary" className="px-4" onClick={() => setModalVisible(false)}>Close</CButton>
                </CModalFooter>
            </CModal>

            {/* VIEW POPUP */}
            <CModal visible={modalVisibleView} onClose={() => setModalVisibleView(false)} alignment="center" size="lg">
                <CModalHeader closeButton>
                    <CModalTitle>GRN - Item Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="table-responsive">
                        <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                            <CTableHead className="custom-header">
                                <CTableRow>
                                    <CTableHeaderCell>Item Code</CTableHeaderCell>
                                    <CTableHeaderCell>Item Name</CTableHeaderCell>
                                    <CTableHeaderCell>Ordered Qty</CTableHeaderCell>
                                    <CTableHeaderCell>Received Qty</CTableHeaderCell>
                                    <CTableHeaderCell>Accepted Qty</CTableHeaderCell>
                                    <CTableHeaderCell>Rejected Qty</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {itemDetailsView.length > 0 ? (
                                    itemDetailsView.map((item, index) => (
                                        <CTableRow key={index}>
                                            <CTableDataCell>{item.ITEMCODE}</CTableDataCell>
                                            <CTableDataCell>{item.ITEMNAME}</CTableDataCell>
                                            <CTableDataCell>{item.ORDEREDQTY}</CTableDataCell>
                                            <CTableDataCell>{item.RECEIVEDQTY}</CTableDataCell>
                                            <CTableDataCell>{item.ACCEPTEDQTY}</CTableDataCell>
                                            <CTableDataCell>{item.REJECTEDQTY}</CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={6} className="text-center text-muted">
                                            No Records Found
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    </div>
                </CModalBody>
                <CModalFooter className="justify-content-center">
                    <CButton color="secondary" onClick={() => setModalVisibleView(false)}>Close</CButton>
                </CModalFooter>
            </CModal>

            <CRow>
                <CCol xs={12}>

                    {/* HEADER CARD */}
                    <CCard className="shadow-lg border-0 mb-4">
                        <CCardHeader className="bg-primary text-white py-3">
                            <h4 className="mb-0 fw-bold">GRN Entry</h4>
                        </CCardHeader>
                        <CCardBody>
                            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                                <CRow className="g-4">
                                    <CCol md={3}>
                                        <CFormLabel>GRN No</CFormLabel>
                                        <CFormInput readOnly value={grnno} />
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>GRN Date<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            type="date"
                                            value={grndate}
                                            onChange={(e) => { setGrndate(e.target.value); setDateError(false); }}
                                            invalid={dateError}
                                            required
                                        />
                                        <CFormFeedback invalid>GRN Date is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Invoice No</CFormLabel>
                                        <CFormInput readOnly value={invoiceno} />
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Invoice Date<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            type="date"
                                            value={invoicedate}
                                            onChange={(e) => {
                                                setInvoicedate(e.target.value);
                                                setFieldErrors((prev) => ({ ...prev, invoicedate: false }));
                                            }}
                                            invalid={fieldErrors.invoicedate}
                                            required
                                        />
                                        <CFormFeedback invalid>Invoice Date is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>PO No<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect value={pono} onChange={handlePoNoChange} invalid={fieldErrors.pono} required>
                                            <option value="">-- Select PO No --</option>
                                            {poDetails.map((rec) => (
                                                <option key={rec.PONO || rec.PURCHASEREQUESTNO} value={rec.PONO || rec.PURCHASEREQUESTNO}>
                                                    {rec.PONO || rec.PURCHASEREQUESTNO}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Please select a PO No.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Supplier</CFormLabel>
                                        <CFormInput readOnly value={suppliername} />
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Transporter</CFormLabel>
                                        <CFormInput readOnly value={transportername} />
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Remarks</CFormLabel>
                                        <CFormInput value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                    </CCol>
                                </CRow>
                            </CForm>
                        </CCardBody>
                    </CCard>

                    {/* ITEM DETAILS CARD */}
                    <CCard className="shadow-lg border-0 mb-4">
                        <CCardHeader className="bg-white">
                            <h4 className="fw-bold text-primary mb-0">Item Details</h4>
                        </CCardHeader>
                        <CCardBody>
                            <div className="table-responsive">
                                <CTable striped hover responsive className="align-middle table-bordered text-nowrap text-center custom-table">
                                    <CTableHead className="custom-header">
                                        <CTableRow>
                                            <CTableHeaderCell>Item Code</CTableHeaderCell>
                                            <CTableHeaderCell>Item Name</CTableHeaderCell>
                                            <CTableHeaderCell>Ordered Qty</CTableHeaderCell>
                                            <CTableHeaderCell>Received Qty</CTableHeaderCell>
                                            <CTableHeaderCell>Accepted Qty</CTableHeaderCell>
                                            <CTableHeaderCell>Rejected Qty</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {addedItems.length > 0 ? (
                                            addedItems.map((item, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{item.itemcode}</CTableDataCell>
                                                    <CTableDataCell>{item.itemname}</CTableDataCell>
                                                    <CTableDataCell>{item.orderedqty}</CTableDataCell>
                                                    <CTableDataCell>
                                                        <input
                                                            type="number"
                                                            value={item.receivedqty}
                                                            onChange={(e) => handleQtyChange(index, 'receivedqty', e.target.value)}
                                                            className="form-control text-center"
                                                            style={{ width: '90px', margin: 'auto' }}
                                                        />
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <input
                                                            type="number"
                                                            value={item.acceptedqty}
                                                            onChange={(e) => handleQtyChange(index, 'acceptedqty', e.target.value)}
                                                            className="form-control text-center"
                                                            style={{ width: '90px', margin: 'auto' }}
                                                        />
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <input
                                                            type="number"
                                                            value={item.rejectedqty}
                                                            readOnly
                                                            // onChange={(e) => handleQtyChange(index, 'rejectedqty', e.target.value)}
                                                            className="form-control text-center"
                                                            style={{ width: '90px', margin: 'auto' }}
                                                        />
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan={6} className="text-center text-muted">
                                                    Select a PO No to load items
                                                </CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>

                            <CCol xs={12} className="text-center mt-4">
                                <CButton className="me-2" color="primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? <CSpinner size="sm" /> : (
                                        <>
                                            <CIcon icon={cilSave} className="me-2" />
                                            {submitLabel}
                                        </>
                                    )}
                                </CButton>
                                <CButton color="secondary" onClick={handleClear} disabled={loading}>
                                    <CIcon icon={cilReload} className="me-2" />
                                    Clear
                                </CButton>
                            </CCol>
                        </CCardBody>
                    </CCard>

                    {/* MAIN TABLE */}
                    <CCard className="shadow-lg border-0">
                        <CCardHeader className="bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <h4 className="fw-bold text-primary mb-0">GRN Details</h4>
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
                        <CCardBody id="grn-table">
                            <div className="table-responsive">
                                <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                                    <CTableHead className="custom-header">
                                        <CTableRow>
                                            {GRN_COLUMN_KEYS.map((key) => (
                                                <CTableHeaderCell key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                                    {key}{' '}
                                                    {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                </CTableHeaderCell>
                                            ))}
                                            <CTableHeaderCell>Edit</CTableHeaderCell>
                                            <CTableHeaderCell>View</CTableHeaderCell>
                                        </CTableRow>
                                        <CTableRow>
                                            {GRN_COLUMN_KEYS.map((key) => (
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
                                            <CTableHeaderCell />
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {filteredgrnDetails.length > 0 ? (
                                            filteredgrnDetails.map((row, index) => (
                                                <CTableRow key={index}>
                                                    {GRN_COLUMN_KEYS.map((key) => (
                                                        <CTableDataCell key={key}>{row[key]}</CTableDataCell>
                                                    ))}
                                                    <CTableDataCell>
                                                        <CButton size="sm" color="warning" onClick={() => handleEdit(row)}>
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CButton size="sm" color="info" onClick={() => handleView(row)}>
                                                            <CIcon icon={cilSearch} />
                                                        </CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan={GRN_COLUMN_KEYS.length + 2} className="text-center text-muted">
                                                    No Records Found
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
                                    <span className="fw-bold mx-2">Page {currentPage}</span>
                                    <CButton color="secondary" size="sm" disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)} onClick={() => setCurrentPage(currentPage + 1)}>
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

export default GRNEntry;