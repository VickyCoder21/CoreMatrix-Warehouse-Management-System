import React, { useState, useEffect } from 'react';
import '../CommonCss/GrnLabelPrint.css';
import '../CommonCss/common.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import CIcon from '@coreui/icons-react';
import axios from "axios";
import { cilPrint, cilXCircle, cilCheckCircle, cilFile, cilEducation } from '@coreui/icons';

import {
  CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
  CRow, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react';

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// SERVICES
import { PageLoad, insertGrnLabelPrint, FetchGrnLabelRePrint } from "../../Services/TransactionService/GRNLabelPrintService";

// Columns for the bottom "already printed" table — keys must match GrnSaveDetails rows
const SAVED_COLUMN_KEYS = ['GRN No', 'Item Code', 'Item Name', 'Accepted Qty', 'Stuffing Qty', 'Barcode'];

const GrnLabelPrint = () => {

  // ---------------- Header / dropdown state ----------------
  const [dropDownGRNno, setDropDownGRNno] = useState([]);
  const [allGrnData, setAllGrnData] = useState([]); // raw lookup rows from Pageload
  const [dropdownItemcode, setDropdownItemcode] = useState([]);
  const [grnno, setGrnno] = useState('');
  const [singleitemcode, setSingleitemcode] = useState('');
  const [singleitemname, setSingleitemname] = useState('');
  const [singlequantity, setSinglequantity] = useState('');   // available accepted qty for this item
  const [stuffingQty, setStuffingQty] = useState('');

  // ---------------- Preview (display-only) ----------------
  const [previewRows, setPreviewRows] = useState([]);
  const [showPreviewTable, setShowPreviewTable] = useState(false);
  const [showPrintButton, setShowPrintButton] = useState(false);

  // ---------------- Validation / UI ----------------
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalColor, setModalColor] = useState('primary');

  // ---------------- Saved/printed table ----------------
  const [savedGrnDetails, setSavedGrnDetails] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ---------------- Table: filter / sort ----------------
  const [columnFilters, setColumnFilters] = useState(
    SAVED_COLUMN_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
  );
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filteredSavedDetails, setFilteredSavedDetails] = useState([]);

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

  // ---------------- Modal ----------------
  const showModal = (message, color = 'primary') => {
    setModalMessage(message);
    setModalColor(color);
    setModalVisible(true);
  };


  // ---------------- Filter and sort the savedGrnDetails whenever they change ----------------
  useEffect(() => {
    let data = [...savedGrnDetails];

    SAVED_COLUMN_KEYS.forEach((key) => {
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

    setFilteredSavedDetails(data);
  }, [savedGrnDetails, columnFilters, sortConfig]);


  // ---------------- API: Page Load ----------------
  const fetchPageLoadData = async (page = 1) => {
    const { ok, result } = await PageLoad(page, itemsPerPage);
    if (ok && result?.result) {
      const rows = result.grnDetails || [];
      setAllGrnData(rows);

      const uniqueGrns = [...new Set(rows.map((r) => r.GRNNO))];
      setDropDownGRNno(uniqueGrns.map((no) => ({ value: no, label: no })));

      setSavedGrnDetails(result.grnSaveDetails || []);
      setTotalCount(result.totalRecords || 0);
    } else {
      showModal(result?.message || 'Data not found', 'danger');
    }
  };

  // ---------------- Initial load ----------------
  useEffect(() => {
    fetchPageLoadData(currentPage);
  }, [currentPage, itemsPerPage]);


  // ---------------- Handlers ----------------
  const handleGrnnoChange = (e) => {
    const selectedGRN = e.target.value;
    setGrnno(selectedGRN);

    if (!selectedGRN) {
      setSingleitemcode('');
      setSingleitemname('');
      setDropdownItemcode([]);
      return;
    }

    const filtered = allGrnData.filter((item) => item.GRNNO === selectedGRN);
    const seen = new Set();
    const uniqueItems = filtered.filter((item) => {
      if (seen.has(item.ITEMCODE)) return false;
      seen.add(item.ITEMCODE);
      return true;
    });

    setDropdownItemcode(
      uniqueItems.map((item) => ({
        value: item.ITEMCODE,
        label: item.ITEMCODE,
        ITEMNAME: item.ITEMNAME,
        QUANTITY: item.QUANTITY,
      }))
    );

    setSingleitemcode('');
    setSingleitemname('');
    setSinglequantity('');
    setStuffingQty('');
    setShowPreviewTable(false);
    setShowPrintButton(false);
  };


  // ---------------- Handler for item code change ----------------
  const handleItemcodeChange = (e) => {
    const selectedCode = e.target.value;
    setSingleitemcode(selectedCode);

    const matched = dropdownItemcode.find((item) => item.value === selectedCode);

    if (matched) {
      setSingleitemname(matched.ITEMNAME || '');
      setSinglequantity(matched.QUANTITY || '');
      setStuffingQty('');
    } else {
      setSingleitemname('');
      setSinglequantity('');
      setStuffingQty('');
    }
  };


  // ---------------- Handler for stuffing qty blur ----------------
  const handleStuffingQtyBlur = () => {
    if (!stuffingQty) {
      showModal("Please Enter Stuffing Qty", "danger");
      return;
    }

    const stuffing = parseInt(stuffingQty, 10);
    const accepted = parseInt(singlequantity, 10);

    if (stuffing <= 0) {
      showModal("Stuffing Qty must be greater than 0", "danger");
      setStuffingQty("");
      return;
    }

    if (stuffing > accepted) {
      showModal("Stuffing Qty cannot be greater than Accepted Qty.", "danger");
      setStuffingQty("");
      return;
    }
  };


  // ---------------- Handler for Add button click ----------------
  const handleSingleAdd = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!grnno) {
      showModal("Please Select GRN No.", "danger");
      return;
    }

    if (!singleitemcode) {
      showModal("Please Select Item Code.", "danger");
      return;
    }

    if (form.checkValidity() === false || !grnno || !singleitemcode || !singleitemname || !singlequantity) {
      setValidated(true);
      return;
    }

    if (!stuffingQty || parseInt(stuffingQty, 10) <= 0) {
      showModal('Stuffing Qty is not available.', 'danger');
      return;
    }

    const totalQty = parseInt(singlequantity, 10);
    const perLabel = parseInt(stuffingQty, 10);
    const splitCount = Math.ceil(totalQty / perLabel);

    const rows = [];
    let remaining = totalQty;
    let currentSplit = 1;
    while (remaining > 0) {
      const currentStuffed = Math.min(perLabel, remaining);
      rows.push({
        GRNNo: grnno,
        ItemCode: singleitemcode,
        ItemName: singleitemname,
        Quantity: currentStuffed,
        Split: `${currentSplit}/${splitCount}`,
      });
      remaining -= currentStuffed;
      currentSplit++;
    }

    setPreviewRows(rows);
    setShowPreviewTable(true);
    setShowPrintButton(true);
  };

  // ---------------- API: Insert and Print ----------------
  // Load HTML template for barcode label
  const loadTemplate = async () => {
    const response = await axios.get('/GRNlabelprint.html', { responseType: 'text' });
    return response.data;
  };

  // Render the labels HTML for printing
  const renderLabelsHtml = (barcodeDetails) => {
    return Promise.all(
      (barcodeDetails || []).map(async (item) => {

        let template = await loadTemplate();
        template = template.replaceAll("$GRNNO$", item.GRNNO || "");
        template = template.replaceAll("$SUPPLIER$", item.SUPPLIERNAME || "");
        template = template.replaceAll("$ITEMCODE$", item.ITEMCODE || "");
        template = template.replaceAll("$ITEMNAME$", item.ITEMNAME || "");
        template = template.replaceAll("$QUANTITY$", item.STUFFINGQTY ?? item.ACCEPTEDQTY ?? "");
        template = template.replaceAll("$GRNDATE$", item.GRNDATE || "");
        template = template.replaceAll("$BARCODE$", item.BARCODE || "");

        const qrUrl = `https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(item.BARCODE || "")}`;
        template = template.replaceAll("$qrcode$", `<img src="${qrUrl}" width="120" height="120" />`);

        return `<div class="label-block">${template}</div>`;
      })
    ).then((blocks) => blocks.join(""));
  };

  const openAndPrint = async (html) => {
    const printWindow = window.open('', '', 'width=900,height=650');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    await new Promise(resolve => setTimeout(resolve, 500));
    setTimeout(() => printWindow.print(), 500);
  };


  // ---------------- Handler for Print button click ----------------
  const handlePrintClick = async () => {
    if (loading) return;
    setLoading(true);
    setShowPrintButton(false);

    try {
      const payload = {
        GRNDetails: [
          {
            GRNNO: grnno,
            ITEMCODE: singleitemcode,
            ITEMNAME: singleitemname,
            ACCEPTEDQTY: singlequantity,
            STUFFINGQTY: stuffingQty,
          },
        ],
      };

      const { ok, result } = await insertGrnLabelPrint(payload);

      if (!ok || !result?.result) {
        showModal(result?.message || 'Failed to save', 'danger');
        setShowPrintButton(true);
        return;
      }

      const html = await renderLabelsHtml(result.barcodeDetails);
      await openAndPrint(html);
      handleClear();
    } catch (err) {
      showModal('Printing failed', 'danger');
      setShowPrintButton(true);
    } finally {
      setLoading(false);
    }
  };


  // ---------------- Handler for Re-Print button click ----------------
  const handleRePrint = async (item) => {
    const payload = {
      GRNNO: item["GRN No"],
      ITEMCODE: item["Item Code"],
      BARCODE: item["Barcode"],
    };

    const { ok, result } = await FetchGrnLabelRePrint(payload);

    if (!ok || !result?.result) {
      showModal(result?.message || 'Failed to fetch label', 'danger');
      return;
    }

    const html = await renderLabelsHtml(result.barcodeDetails);
    await openAndPrint(html);
  };


  // ---------------- Handler for Clear button click ----------------
  const handleClear = () => {
    setGrnno('');
    setSingleitemcode('');
    setDropdownItemcode([]);
    setSingleitemname('');
    setSinglequantity('');
    setStuffingQty('');
    setPreviewRows([]);
    setShowPreviewTable(false);
    setShowPrintButton(false);
    setValidated(false);
    fetchPageLoadData(1);
  };

  // ---------------- Exports ----------------
  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(savedGrnDetails);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GRN Label Print Details');
    XLSX.writeFile(workbook, 'GRNLabelPrintDetails.xlsx');
  };

  const handlePdfExport = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['GRN No', 'Item Code', 'Item Name', 'Accepted Qty', 'Stuffing Qty', 'Barcode']],
      body: savedGrnDetails.map((item) => [
        item['GRN No'], item['Item Code'], item['Item Name'], item['Accepted Qty'], item['Stuffing Qty'], item['Barcode'],
      ]),
    });
    doc.save('GRNLabelPrintDetails.pdf');
  };

  const handlePrint = () => {
    const printContent = document.getElementById('GRNLabelPrint_details').innerHTML;
    const printWindow = window.open('', '', 'width=900,height=650');
    printWindow.document.write(`
      <html>
        <head>
          <title>GRN Label Details</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>GRN Label Details</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ---------------- JSX Render ----------------
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
          <p className="fs-5 fw-semibold mt-3 mb-0" style={{ whiteSpace: 'pre-line' }}>{modalMessage}</p>
        </CModalBody>
        <CModalFooter className="justify-content-center py-2">
          <CButton color="secondary" className="px-4" onClick={() => setModalVisible(false)}>Close</CButton>
        </CModalFooter>
      </CModal>

      <CRow>
        <CCol xs={12}>
          {/* ENTRY FORM */}
          <CCard className="shadow-lg border-0 mb-4">
            <CCardHeader className="bg-primary text-white py-3">
              <h4 className="mb-0 fw-bold">GRN Label Print</h4>
            </CCardHeader>
            <CCardBody>
              <CForm noValidate validated={validated} onSubmit={handleSingleAdd}>
                <CRow className="g-4">
                  <CCol md={3}>
                    <CFormLabel>GRN No<span className="text-danger">*</span></CFormLabel>
                    <CFormSelect value={grnno} onChange={handleGrnnoChange} required>
                      <option value="">-- Select GRN No --</option>
                      {dropDownGRNno.map((rec) => (
                        <option key={rec.value} value={rec.value}>{rec.label}</option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel>Item Code<span className="text-danger">*</span></CFormLabel>
                    <CFormSelect key={`item-dropdown-${grnno}`} value={singleitemcode} onChange={handleItemcodeChange} required >
                      <option value="">-- Select Item Code --</option>
                      {dropdownItemcode.map((rec, idx) => (
                        <option key={rec.value || `opt-${idx}`} value={rec.value}>{rec.label}</option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel>Item Name</CFormLabel>
                    <CFormInput value={singleitemname} readOnly />
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel>Quantity</CFormLabel>
                    <CFormInput value={singlequantity} readOnly />
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel>Stuffing Qty<span className="text-danger">*</span></CFormLabel>
                    <CFormInput value={stuffingQty} placeholder='Stuf Qty' maxLength={2}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) setStuffingQty(value);
                      }}
                      onBlur={handleStuffingQtyBlur}
                    />
                  </CCol>

                  <CCol xs={12} className="pt-4 text-end">
                    {showPrintButton && (
                      <CButton className="me-2" color="success" onClick={handlePrintClick} disabled={loading}>
                        {loading ? <CSpinner size="sm" /> : 'Print'}
                      </CButton>
                    )}
                    <CButton className="me-2" type="submit" color="primary" disabled={loading}>
                      {loading ? <CSpinner size="sm" /> : 'Add'}
                    </CButton>
                    <CButton type="button" color="secondary" disabled={loading} onClick={handleClear}>
                      {loading ? <CSpinner size="sm" /> : 'Clear'}
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>

          {/* PREVIEW TABLE */}
          {showPreviewTable && (
            <CCard className="shadow-lg border-0 mb-4">
              <CCardBody>
                <div className="table-responsive">
                  <CTable striped responsive className="align-middle table-bordered text-nowrap text-center custom-table">
                    <CTableHead className="custom-header">
                      <CTableRow>
                        <CTableHeaderCell>GRN No</CTableHeaderCell>
                        <CTableHeaderCell>Item Code</CTableHeaderCell>
                        <CTableHeaderCell>Item Name</CTableHeaderCell>
                        <CTableHeaderCell>Quantity</CTableHeaderCell>
                        <CTableHeaderCell>Label</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {previewRows.map((row, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{row.GRNNo}</CTableDataCell>
                          <CTableDataCell style={{ whiteSpace: 'pre' }}>{row.ItemCode}</CTableDataCell>
                          <CTableDataCell>{row.ItemName}</CTableDataCell>
                          <CTableDataCell>{row.Quantity}</CTableDataCell>
                          <CTableDataCell>{row.Split}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          )}

          {/* SAVED / ALREADY PRINTED */}
          <CCard className="shadow-lg border-0">
            <CCardHeader className="bg-white">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <h4 className="fw-bold text-primary mb-0">GRN Label Print Details</h4>
                <div>
                  <CButton color="success" size="sm" title="Excel" className="me-2" onClick={handleExcelExport}>
                    <CIcon icon={cilEducation} className="me-1" />
                  </CButton>
                  <CButton color="danger" size="sm" title="PDF" className="me-2" onClick={handlePdfExport}>
                    <CIcon icon={cilFile} className="me-1" />
                  </CButton>
                  <CButton color="primary" size="sm" title="Print" onClick={handlePrint}>
                    <CIcon icon={cilPrint} className="me-1" />
                  </CButton>
                </div>
              </div>
            </CCardHeader>

            <CCardBody id="GRNLabelPrint_details">
              <div className="table-responsive">
                <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                  <CTableHead className="custom-header">
                    <CTableRow>
                      {SAVED_COLUMN_KEYS.map((key) => (
                        <CTableHeaderCell key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          {key}{' '}
                          {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                        </CTableHeaderCell>
                      ))}
                      <CTableHeaderCell>Re Print</CTableHeaderCell>
                    </CTableRow>
                    <CTableRow>
                      {SAVED_COLUMN_KEYS.map((key) => (
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
                    {filteredSavedDetails.length > 0 ? (
                      filteredSavedDetails.map((row, index) => (
                        <CTableRow key={index}>
                          {SAVED_COLUMN_KEYS.map((key) => (
                            <CTableDataCell key={key} style={key === 'Item Code' ? { whiteSpace: 'pre' } : undefined}>
                              {row[key]}
                            </CTableDataCell>
                          ))}
                          <CTableDataCell>
                            <CButton size="sm" color="danger" onClick={() => handleRePrint(row)}>
                              <CIcon icon={cilPrint} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={SAVED_COLUMN_KEYS.length + 1} className="text-center text-muted">
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

export default GrnLabelPrint;