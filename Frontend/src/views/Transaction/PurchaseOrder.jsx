import React, { useState, useEffect } from 'react';
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
    CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CFormFeedback, CSpinner,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow,
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import { cilPencil, cilCheckCircle, cilXCircle, cilEducation, cilReload, cilSave, cilFile, cilPrint, cilSearch } from "@coreui/icons";
import '@coreui/coreui/dist/css/coreui.min.css';
import "../CommonCss/common.css";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Pageload, Insert, Edit, View } from "../../Services/TransactionService/PurchaseOrderService";

// ---------------- Table Column Keys ----------------
const PO_COLUMN_KEYS = ['PO No', 'PO Date', 'Supplier Name', 'GST No', 'Transporter Name', 'Terms', 'Dispatch', 'Delivery'];

const PurchaseOrder = () => {

    const [autoid, setAutoid] = useState(0);
    const [addedItems, setAddedItems] = useState([]);
    const [poDetails, setpoDetails] = useState([]);

    // ---------------- Header States ----------------
    const [pono, setPono] = useState('');
    const [podate, setPodate] = useState('');
    const [suppliercode, setSuppliercode] = useState('');   // sent to API
    const [transportercode, setTransportercode] = useState('');
    const [gstno, setGstno] = useState('');
    const [termsofpayment, setTermsofpayment] = useState('');
    const [dispatchthrough, setDispatchthrough] = useState('');
    const [delivery, setDelivery] = useState('');

    // ---------------- Item (detail) States ----------------
    const [itemcode, setItemcode] = useState('');
    const [itemname, setItemname] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitprice, setUnitprice] = useState('');
    const [totalamount, setTotalamount] = useState('0.00');

    // ---------------- Dropdown / lookup lists ----------------
    const [itemlist, setItemlist] = useState([]);
    const [supplierlist, setSupplierlist] = useState([]);
    const [transporterlist, setTransporterlist] = useState([]);
    const [termsList, setTermsList] = useState([]);
    const [dispatchList, setDispatchList] = useState([]);
    const [deliveryList, setDeliveryList] = useState([]);

    // ---------------- Validation States ----------------
    const [validated, setValidated] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        suppliername: false,
        transportername: false,
        itemcode: false,
        quantity: false,
        unitprice: false,
        termsofpayment: false,
        dispatchthrough: false,
        delivery: false,
    });

    // ---------------- UI States ----------------
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

    // ---------------- Table: filter / sort ----------------
    const [columnFilters, setColumnFilters] = useState(
        PO_COLUMN_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
    );

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filteredpoDetails, setFilteredpoDetails] = useState([]);

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
        let data = [...poDetails];

        PO_COLUMN_KEYS.forEach((key) => {
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

        setFilteredpoDetails(data);
    }, [poDetails, columnFilters, sortConfig]);


    // ---------------- API: Page Load ----------------
    const fetchPageLoadData = async (page, perPage) => {
        const activePage = page ?? currentPage;
        const activePerPage = perPage ?? itemsPerPage;
        const { ok, result } = await Pageload(activePage, activePerPage);

        if (ok && result && result.result) {
            setPono(result.pono || '');

            const itemData = result.itemList || [];
            setItemlist(
                itemData.map((record) => ({
                    value: record.ITEMCODE,
                    label: record.ITEMCODE,
                    itemname: record.ITEMNAME,
                }))
            );

            setSupplierlist(result.supplierList || []);
            setTransporterlist(result.transporterList || []);
            setTermsList(result.terms || []);
            setDispatchList(result.dispatch || []);
            setDeliveryList(result.delivery || []);
            setpoDetails(result.poDetails || []);
            setTotalCount(result.totalRecords || 0);
        } else {
            showModal(result?.message || 'Data not found', 'danger');
        }
    };

    useEffect(() => {
        fetchPageLoadData(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);


    // ---------------- Handlers ----------------
    const handleSupplierChange = (e) => {
        const code = e.target.value;
        setSuppliercode(code);
        setFieldErrors((prev) => ({ ...prev, suppliername: false }));

        const sup = supplierlist.find((x) => x.SUPPLIERCODE === code);
        setGstno(sup?.GSTNO || '');
    };

    const handleTransporterChange = (e) => {
        const code = e.target.value;
        setTransportercode(code);
        setFieldErrors((prev) => ({ ...prev, transportername: false }));
    };

    const handleItemCodeInputChange = (e) => {
        const value = e.target.value;
        setItemcode(value);
        setFieldErrors((prev) => ({ ...prev, itemcode: false }));

        const selected = itemlist.find((x) => x.value === value);
        setItemname(selected?.itemname || '');
    };

    const handleNumberKeyDown = (e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleQuantityChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 5) value = value.slice(0, 5);
        setQuantity(value);

        const qty = parseFloat(value) || 0;
        const price = parseFloat(unitprice) || 0;
        setFieldErrors((prev) => ({ ...prev, quantity: false }));
        setTotalamount((qty * price).toFixed(2));
    };

    const handleUnitPriceChange = (e) => {
        let value = e.target.value.replace(/[^0-9.]/g, '');
        let parts = value.split('.');
        if (parts.length > 2) parts = [parts[0], parts[1]];
        parts[0] = parts[0].slice(0, 9);
        if (parts[1] !== undefined) {
            parts[1] = parts[1].slice(0, 5);
            value = parts[0] + '.' + parts[1];
        } else {
            value = parts[0];
        }
        setUnitprice(value);

        const qty = parseFloat(quantity) || 0;
        const price = parseFloat(value) || 0;
        setFieldErrors((prev) => ({ ...prev, unitprice: false }));
        setTotalamount((qty * price).toFixed(2));
    };

    const handleUnitPriceBlur = () => {
        const value = parseFloat(unitprice);
        if (!isNaN(value)) {
            const fixedValue = value.toFixed(2);
            setUnitprice(fixedValue);
            const qty = parseFloat(quantity) || 0;
            setTotalamount((qty * value).toFixed(2));
        }
    };

    const handleAddItem = () => {
        const newErrors = {
            itemcode: !itemcode,
            quantity: !quantity,
            unitprice: !unitprice,
        };
        setFieldErrors((prev) => ({ ...prev, ...newErrors }));
        if (Object.values(newErrors).includes(true)) return;

        const isDuplicate = addedItems.some((item) => item.itemcode === itemcode);
        if (isDuplicate) {
            handleItemClear();
            showModal('Item already added!', 'danger');
            return;
        }

        setAddedItems((prev) => [...prev, { itemcode, itemname, quantity, unitprice, totalamount }]);
        handleItemClear();
    };

    const handleRemoveItem = (index) => {
        setAddedItems((prev) => prev.filter((_, i) => i !== index));
    };


    // ---------------- Submit Function ----------------
    const handleSubmit = async (event) => {
        event.preventDefault();

        const isDateInvalid = !podate;
        const isSupplierInvalid = !suppliercode;
        const isTransporterInvalid = !transportercode;
        const isTermsInvalid = !termsofpayment;
        const isDispatchInvalid = !dispatchthrough;
        const isDeliveryInvalid = !delivery;

        setDateError(isDateInvalid);
        setFieldErrors((prev) => ({
            ...prev,
            suppliername: isSupplierInvalid,
            transportername: isTransporterInvalid,
            termsofpayment: isTermsInvalid,
            dispatchthrough: isDispatchInvalid,
            delivery: isDeliveryInvalid,
        }));

        if (isDateInvalid || isSupplierInvalid || isTransporterInvalid || isTermsInvalid || isDispatchInvalid || isDeliveryInvalid) {
            setValidated(true);
            setTimeout(() => {
                const firstError = document.querySelector('.is-invalid, .invalid-feedback');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (firstError.focus) firstError.focus();
                }
            }, 100);
            return;
        }

        if (addedItems.length === 0) {
            showModal('Please add at least one item before submitting', 'danger');
            return;
        }

        const combinedBody = {
            AUTOID: autoid,
            PONO: String(pono),
            PODATE: podate ? new Date(podate).toISOString().slice(0, 19).replace('T', ' ') : '',
            SUPPLIERCODE: String(suppliercode),
            GSTNO: String(gstno),
            TRANSPORTERCODE: String(transportercode),
            TERMSOFPAYMENT: String(termsofpayment),
            DISPATCHTHROUGH: String(dispatchthrough),
            DELIVERY: String(delivery),
            AddedItems: addedItems.map((item) => ({
                ITEMCODE: String(item.itemcode),
                ITEMNAME: String(item.itemname),
                QUANTITY: String(item.quantity),
                UNITPRICE: String(item.unitprice),
                TOTALAMOUNT: String(item.totalamount),
            })),
        };

        try {
            setLoading(true);
            const { ok, result } = await Insert(combinedBody);
            setLoading(false);

            if (ok && result && result.result) {
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

    // ---------------- Edit Function ----------------
    const handleEdit = async (po) => {
        const poNo = po['PO No'];
        if (!poNo) return;

        const { ok, result } = await Edit(poNo);
        if (ok && result && result.result) {
            const header = result.headerdetails[0];
            setAutoid(header.AUTOID);
            setPono(header.PONO);
            setPodate(header.PODATE ? String(header.PODATE).slice(0, 10) : '');
            setSuppliercode(header.SUPPLIERCODE || '');
            setGstno(header.GSTNO || '');
            setTransportercode(header.TRANSPORTERCODE || '');
            setTermsofpayment(header.TERMSOFPAYMENT);
            setDispatchthrough(header.DISPATCHTHROUGH);
            setDelivery(header.DELIVERY);

            setAddedItems(
                (result.itemdetails || []).map((item) => ({
                    itemcode: item.itemcode,
                    itemname: item.itemname,
                    quantity: item.quantity,
                    unitprice: item.unitprice,
                    totalamount: item.totalamount,
                }))
            );

            setSubmitLabel('Update');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showModal(result?.message || 'Failed to load record', 'danger');
        }
    };

    // ---------------- View Function ----------------
    const handleView = async (po) => {
        const poNo = po['PO No'];
        if (!poNo) return;

        const { ok, result } = await View(poNo);
        if (ok && result && result.result) {
            setItemDetailsView(result.itemdetails || []);
            setModalVisibleView(true);
        } else {
            showModal(result?.message || 'Data not found', 'danger');
        }
    };

    // ---------------- Clear Item Functions ----------------
    const handleItemClear = () => {
        setItemcode('');
        setItemname('');
        setQuantity('');
        setUnitprice('');
        setTotalamount('0.00');
        setFieldErrors((prev) => ({ ...prev, itemcode: false, quantity: false, unitprice: false }));
    };

    // ---------------- Clear All Functions ----------------
    const handleClear = async () => {
        setPono('');
        setPodate('');
        setSuppliercode('');
        setTransportercode('');
        setGstno('');
        setTermsofpayment('');
        setDispatchthrough('');
        setDelivery('');
        setAddedItems([]);
        setSubmitLabel('Submit');
        setAutoid(0);
        setValidated(false);
        setDateError(false);
        setFieldErrors({
            suppliername: false,
            itemcode: false,
            quantity: false,
            unitprice: false,
            termsofpayment: false,
            dispatchthrough: false,
            delivery: false,
        });

        handleItemClear();
        await fetchPageLoadData(1, itemsPerPage);
    };

    // Export Functions
    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(poDetails);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseOrder");
        XLSX.writeFile(workbook, "PurchaseOrder.xlsx");
    };

    // PDF Export Function
    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["PO No", "PO Date", "Supplier Name", "GST No", "Transporter Name", "Terms Of Payment", "Dispatch Through", "Delivery"]],
            body: poDetails.map(item => [
                item["PO No"], item["PO Date"], item["Supplier Name"], item["GST No"], item["Transporter Name"], item["Terms"], item["Dispatch"], item["Delivery"]
            ]),
        });
        doc.save("PurchaseOrder.pdf");
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
                    <CModalTitle>Purchase Order - Item Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="table-responsive">
                        <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                            <CTableHead className="custom-header">
                                <CTableRow>
                                    <CTableHeaderCell>Item Code</CTableHeaderCell>
                                    <CTableHeaderCell>Item Name</CTableHeaderCell>
                                    <CTableHeaderCell>Quantity</CTableHeaderCell>
                                    <CTableHeaderCell>Unit Price</CTableHeaderCell>
                                    <CTableHeaderCell>Total Amount</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {itemDetailsView.length > 0 ? (
                                    itemDetailsView.map((item, index) => (
                                        <CTableRow key={index}>
                                            <CTableDataCell>{item.itemcode}</CTableDataCell>
                                            <CTableDataCell>{item.itemname}</CTableDataCell>
                                            <CTableDataCell>{item.quantity}</CTableDataCell>
                                            <CTableDataCell>{item.unitprice}</CTableDataCell>
                                            <CTableDataCell>{item.totalamount}</CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={5} className="text-center text-muted">No Records Found</CTableDataCell>
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
                            <h4 className="mb-0 fw-bold">Purchase Order</h4>
                        </CCardHeader>
                        <CCardBody>
                            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                                <CRow className="g-4">
                                    <CCol md={3}>
                                        <CFormLabel>PO No</CFormLabel>
                                        <CFormInput readOnly value={pono} />
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>PO Date<span className="text-danger">*</span> :</CFormLabel>
                                        <CFormInput type="date" value={podate}
                                            onChange={(e) => { setPodate(e.target.value); setDateError(false); }}
                                            invalid={dateError} required
                                        />
                                        <CFormFeedback invalid>PO Date is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Supplier<span className="text-danger">*</span> :</CFormLabel>
                                        <CFormSelect value={suppliercode} onChange={handleSupplierChange}
                                            invalid={fieldErrors.suppliername} required
                                        >
                                            <option value="">-- Select Supplier --</option>
                                            {supplierlist.map((sup) => (
                                                <option key={sup.SUPPLIERCODE} value={sup.SUPPLIERCODE}>
                                                    {sup.SUPPLIERCODE} - {sup.SUPPLIERNAME}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Please select a Supplier.</CFormFeedback>
                                    </CCol>


                                    <CCol md={3}>
                                        <CFormLabel>GST No</CFormLabel>
                                        <CFormInput value={gstno} readOnly />
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Transporter<span className="text-danger">*</span> :</CFormLabel>
                                        <CFormSelect value={transportercode} onChange={handleTransporterChange}
                                            invalid={fieldErrors.transportername} required
                                        >
                                            <option value="">-- Select Transporter --</option>
                                            {transporterlist.map((trans) => (
                                                <option key={trans.TRANSPORTERCODE} value={trans.TRANSPORTERCODE}>
                                                    {trans.TRANSPORTERCODE} - {trans.TRANSPORTERNAME}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Please select a Transporter.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Terms of Payment<span className="text-danger">*</span> :</CFormLabel>
                                        <CFormSelect
                                            value={termsofpayment}
                                            onChange={(e) => { setTermsofpayment(e.target.value); setFieldErrors(prev => ({ ...prev, termsofpayment: false })); }}
                                            invalid={fieldErrors.termsofpayment} required
                                        >
                                            <option value="">--Select Terms of Payment--</option>
                                            {termsList.map((item, index) => (
                                                <option key={index} value={item.value}>{item.label}</option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Select Terms of Payment.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Dispatch Through<span className="text-danger">*</span> :</CFormLabel>
                                        <CFormSelect
                                            value={dispatchthrough}
                                            onChange={(e) => { setDispatchthrough(e.target.value); setFieldErrors(prev => ({ ...prev, dispatchthrough: false })); }}
                                            invalid={fieldErrors.dispatchthrough} required
                                        >
                                            <option value="">--Select Dispatch Mode--</option>
                                            {dispatchList.map((item, index) => (
                                                <option key={index} value={item.value}>{item.label}</option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Select Dispatch Mode.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel>Delivery<span className="text-danger">*</span> :</CFormLabel>
                                        <CFormSelect
                                            value={delivery}
                                            onChange={(e) => { setDelivery(e.target.value); setFieldErrors(prev => ({ ...prev, delivery: false })); }}
                                            invalid={fieldErrors.delivery} required
                                        >
                                            <option value="">--Select Delivery Type--</option>
                                            {deliveryList.map((item, index) => (
                                                <option key={index} value={item.value}>{item.label}</option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Select Delivery Type.</CFormFeedback>
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
                            <CRow className="g-3">
                                <CCol md={3}>
                                    <CFormLabel>Item Code<span className="text-danger">*</span> :</CFormLabel>
                                    <CFormSelect value={itemcode} onChange={handleItemCodeInputChange} invalid={fieldErrors.itemcode} >
                                        <option value="">-- Select Item Code --</option>
                                        {itemlist.map((item) => (
                                            <option key={item.value} value={item.value}>{item.value}</option>
                                        ))}
                                    </CFormSelect>
                                    <CFormFeedback invalid>Select Item Code.</CFormFeedback>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Item Name</CFormLabel>
                                    <CFormInput value={itemname || ""} readOnly />
                                </CCol>

                                <CCol md={2}>
                                    <CFormLabel>Quantity<span className="text-danger">*</span> :</CFormLabel>
                                    <CFormInput value={quantity} type="number" placeholder="Qty"
                                        onChange={handleQuantityChange} onKeyDown={handleNumberKeyDown}
                                        invalid={fieldErrors.quantity}
                                    />
                                    <CFormFeedback invalid>Enter Qty.</CFormFeedback>
                                </CCol>

                                <CCol md={2}>
                                    <CFormLabel>Unit Price<span className="text-danger">*</span> :</CFormLabel>
                                    <CFormInput value={unitprice} type="number" placeholder="Price"
                                        onChange={handleUnitPriceChange} onBlur={handleUnitPriceBlur}
                                        onKeyDown={handleNumberKeyDown} invalid={fieldErrors.unitprice}
                                    />
                                    <CFormFeedback invalid>Enter Price.</CFormFeedback>
                                </CCol>

                                <CCol md={2}>
                                    <CFormLabel>Total Amount</CFormLabel>
                                    <CFormInput value={totalamount} readOnly />
                                </CCol>

                                <CCol xs={12} className="text-end">
                                    <CButton className="me-2 text-white" color="success" disabled={loading} onClick={handleAddItem}>
                                        {loading ? <CSpinner size="sm" /> : 'Add'}
                                    </CButton>
                                    <CButton className="text-white" color="danger" disabled={loading} onClick={handleItemClear}>
                                        {loading ? <CSpinner size="sm" /> : 'Clear'}
                                    </CButton>
                                </CCol>
                            </CRow>

                            {/* ADDED ITEMS TABLE */}
                            <div className="table-responsive mt-4">
                                <CTable striped hover responsive className="align-middle table-bordered text-nowrap text-center custom-table">
                                    <CTableHead className="custom-header">
                                        <CTableRow>
                                            <CTableHeaderCell>Item Code</CTableHeaderCell>
                                            <CTableHeaderCell>Item Name</CTableHeaderCell>
                                            <CTableHeaderCell>Quantity</CTableHeaderCell>
                                            <CTableHeaderCell>Unit Price</CTableHeaderCell>
                                            <CTableHeaderCell>Total Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Remove</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {addedItems.length > 0 ? (
                                            addedItems.map((item, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{item.itemcode}</CTableDataCell>
                                                    <CTableDataCell>{item.itemname}</CTableDataCell>
                                                    <CTableDataCell>{item.quantity}</CTableDataCell>
                                                    <CTableDataCell>{item.unitprice}</CTableDataCell>
                                                    <CTableDataCell>{item.totalamount}</CTableDataCell>
                                                    <CTableDataCell>
                                                        <CButton size="sm" color="danger" onClick={() => handleRemoveItem(index)}>Remove</CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan={6} className="text-center text-muted">No items added</CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>

                            <CCol xs={12} className="text-center mt-4">
                                <CButton className="me-2" color="primary" type="button" disabled={loading} onClick={handleSubmit}>
                                    {loading ? <CSpinner size="sm" /> : (
                                        <>
                                            <CIcon icon={cilSave} className="me-2" />
                                            {submitLabel}
                                        </>
                                    )}
                                </CButton>
                                <CButton color="secondary" type="button" onClick={handleClear} disabled={loading}>
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
                                <h4 className="fw-bold text-primary mb-0">Purchase Order Details</h4>
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
                            <div className="table-responsive">
                                <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                                    <CTableHead className="custom-header">
                                        <CTableRow>
                                            {PO_COLUMN_KEYS.map((key) => (
                                                <CTableHeaderCell key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                                    {key}{' '}
                                                    {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                </CTableHeaderCell>
                                            ))}
                                            <CTableHeaderCell>Edit</CTableHeaderCell>
                                            <CTableHeaderCell>View</CTableHeaderCell>
                                        </CTableRow>
                                        <CTableRow>
                                            {PO_COLUMN_KEYS.map((key) => (
                                                <CTableHeaderCell key={`filter-${key}`} className="p-1">
                                                    <CFormInput size="sm" value={columnFilters[key]}
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
                                        {filteredpoDetails.length > 0 ? (
                                            filteredpoDetails.map((item, index) => (
                                                <CTableRow key={index}>
                                                    {PO_COLUMN_KEYS.map((key) => (
                                                        <CTableDataCell key={key}>{item[key]}</CTableDataCell>
                                                    ))}
                                                    <CTableDataCell>
                                                        <CButton size="sm" color="warning" onClick={() => handleEdit(item)}>
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CButton size="sm" color="info" onClick={() => handleView(item)}>
                                                            <CIcon icon={cilSearch} />
                                                        </CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan={PO_COLUMN_KEYS.length + 2} className="text-center text-muted">
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

export default PurchaseOrder;