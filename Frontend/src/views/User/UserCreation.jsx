import React, { useState, useEffect } from 'react';
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
    CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CFormFeedback, CSpinner,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow,
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import { cilPencil, cilCheckCircle, cilXCircle } from "@coreui/icons";
import '@coreui/coreui/dist/css/coreui.min.css';
import "../CommonCss/common.css";
import { PageLoad, Insert, getUserById } from "../../Services/UserService/UserCreationService";

const getBadge = (status) => {
    switch (status) {
        case 'Active': return 'success';
        case 'Inactive': return 'secondary';
        default: return 'primary';
    }
};

// Columns for the main User list — keys must match what PageLoad returns inside employeeDetails
const USER_COLUMN_KEYS = ['Employee Code', 'Employee Name', 'User Name', 'Record Status'];

const UserCreation = () => {
    const [autoid, setAutoid] = useState('0');
    const [employeeCode, setEmployeeCode] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [password, setPassword] = useState('');
    const [recordStatus, setRecordStatus] = useState('');

    const [employeeCodes, setEmployeeCodes] = useState([]);
    const [recordStatuses, setRecordStatuses] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState([]);

    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalColor, setModalColor] = useState('primary');

    const [isEditMode, setIsEditMode] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ---------------- Table: filter / sort ----------------
    const [columnFilters, setColumnFilters] = useState(
        USER_COLUMN_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
    );
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filteredEmployeeDetails, setFilteredEmployeeDetails] = useState([]);

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

    useEffect(() => {
        let data = [...employeeDetails];

        USER_COLUMN_KEYS.forEach((key) => {
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

        setFilteredEmployeeDetails(data);
    }, [employeeDetails, columnFilters, sortConfig]);

    const showModal = (message, color = 'primary') => {
        setModalMessage(message);
        setModalColor(color);
        setModalVisible(true);
    };

    const fetchPageLoadData = async (page = 1) => {
        const { ok, result } = await PageLoad(page, itemsPerPage);

        if (ok && result?.result) {
            const codes = result.employeeCodedetails || [];

            setEmployeeCodes(
                codes.map((record) => ({
                    value: record.EMPLOYEECODE,
                    label: record.EMPLOYEECODE,
                    EMPLOYEENAME: record.EMPLOYEENAME,
                }))
            );

            setRecordStatuses(result.recordStatus || []);
            setEmployeeDetails(result.employeeDetails || []);
            setTotalCount(result.totalRecords || 0);
        } else {
            showModal(result?.message || 'Data not found', 'danger');
        }
    };

    useEffect(() => {
        fetchPageLoadData(currentPage, itemsPerPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage]);

    const handleEmployeeCodeChange = (e) => {
        const code = e.target.value;
        setEmployeeCode(code);

        const matched = employeeCodes.find((rec) => rec.value === code);
        setEmployeeName(matched ? matched.EMPLOYEENAME || '' : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (
            form.checkValidity() === false ||
            !employeeCode ||
            !employeeName ||
            !username ||
            !password ||
            !confirmPassword ||
            !recordStatus ||
            password !== confirmPassword
        ) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const payload = {
            Autoid: autoid,
            Employeecode: employeeCode,
            Employeename: employeeName,
            Username: username,
            Password: password,
            Confirmpassword: confirmPassword,
            Status: recordStatus,
        };

        setLoading(true);
        const { ok, result } = await Insert(payload);
        setLoading(false);

        if (ok && result?.result) {
            showModal(result.message || 'User created successfully', 'success');
            handleClear();
        } else {
            showModal(result?.message || 'Failed to create user', 'danger');
        }
    };

    const handleEdit = async (item) => {
        const id = item['Edit'];
        setAutoid(id);

        if (!id) {
            showModal('Invalid user ID', 'danger');
            return;
        }

        setIsEditMode(true);
        setLoading(true);

        const { ok, result } = await getUserById(id);
        setLoading(false);

        if (ok && result?.result) {
            const data = result.userDetails?.[0];
            if (!data) {
                showModal('User not found', 'danger');
                return;
            }

            // Guard against no match instead of crashing on matchedEmployeeCode.value
            const matchedEmployeeCode = employeeCodes.find(
                (rec) => rec.value === data.EMPLOYEECODE
            );
            setEmployeeCode(matchedEmployeeCode?.value || data.EMPLOYEECODE || '');
            setEmployeeName(data.EMPLOYEENAME || '');
            setUsername(data.USERNAME || '');
            setPassword(data.USERPASSWORD || '');
            setConfirmPassword(data.CONFIRMPASSWORD || '');

            const matchedRecordStatus = recordStatuses.find(
                (rec) => rec.METASUBCODE === data.STATUS
            );
            setRecordStatus(matchedRecordStatus ? matchedRecordStatus.METASUBCODE : '');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showModal(result?.message || 'User not found', 'danger');
        }
    };

    const handleClear = async () => {
        setAutoid('0');
        setEmployeeCode('');
        setEmployeeName('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setRecordStatus('');
        setValidated(false);
        setIsEditMode(false);
        await fetchPageLoadData(currentPage);
    };

    return (
        <>
            {/* SUCCESS / ERROR MODAL */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} alignment="center" backdrop="static">
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
                <CModalFooter className="justify-content-center">
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
                </CModalFooter>
            </CModal>

            <CRow>
                <CCol xs={12}>
                    <CCard className="shadow-lg border-0 mb-4">
                        <CCardHeader className="bg-primary text-white py-3">
                            <h4 className="mb-0 fw-bold">User Creation</h4>
                        </CCardHeader>
                        <CCardBody>
                            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                                <CRow className="g-4">
                                    <CCol md={3}>
                                        <CFormLabel htmlFor="ddlemployeecode">Employee Code<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect
                                            id="ddlemployeecode"
                                            value={employeeCode}
                                            onChange={handleEmployeeCodeChange}
                                            required
                                        >
                                            <option value="">-- Select Employee Code --</option>
                                            {employeeCodes.map((rec) => (
                                                <option key={rec.value} value={rec.value}>{rec.label}</option>
                                            ))}
                                        </CFormSelect>
                                        <CFormFeedback invalid>Please select an employee code.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel htmlFor="txtemployeename">Employee Name</CFormLabel>
                                        <CFormInput
                                            id="txtemployeename"
                                            value={employeeName}
                                            readOnly
                                            style={{ backgroundColor: '#f7e9d5' }}
                                        />
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel htmlFor="txtusername">User Name<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            id="txtusername"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                        <CFormFeedback invalid>Username is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel htmlFor="txtpassword">Password<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            id="txtpassword"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <CFormFeedback invalid>Password is required.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel htmlFor="txtconfirmpassword">Confirm Password<span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            id="txtconfirmpassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <CFormFeedback invalid>
                                            {confirmPassword !== password ? 'Passwords do not match.' : 'Confirmation Password is required.'}
                                        </CFormFeedback>
                                    </CCol>

                                    <CCol md={3}>
                                        <CFormLabel htmlFor="ddlrecordstatus">Record Status<span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect
                                            id="ddlrecordstatus"
                                            value={recordStatus}
                                            onChange={(e) => setRecordStatus(e.target.value)}
                                            required
                                        >
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
                                        <CButton className="me-2" type="submit" color="primary" disabled={loading}>
                                            {loading ? <CSpinner size="sm" /> : isEditMode ? 'Update' : 'Submit'}
                                        </CButton>
                                        <CButton color="secondary" type="button" onClick={handleClear} disabled={loading}>
                                            {loading ? <CSpinner size="sm" /> : 'Clear'}
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </CForm>
                        </CCardBody>
                    </CCard>

                    <CCard className="shadow-lg border-0">
                        <CCardHeader className="bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <h4 className="fw-bold text-primary mb-0">User Creation Details</h4>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <div className="table-responsive">
                                <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                                    <CTableHead className="custom-header">
                                        <CTableRow>
                                            {USER_COLUMN_KEYS.map((key) => (
                                                <CTableHeaderCell key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                                    {key}{' '}
                                                    {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                </CTableHeaderCell>
                                            ))}
                                            <CTableHeaderCell>Edit</CTableHeaderCell>
                                        </CTableRow>
                                        <CTableRow>
                                            {USER_COLUMN_KEYS.map((key) => (
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
                                        {filteredEmployeeDetails.length > 0 ? (
                                            filteredEmployeeDetails.map((item, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{item['Employee Code']}</CTableDataCell>
                                                    <CTableDataCell>{item['Employee Name']}</CTableDataCell>
                                                    <CTableDataCell>{item['User Name']}</CTableDataCell>
                                                    <CTableDataCell>
                                                        <CBadge color={getBadge(item['Record Status'])}>
                                                            {item['Record Status']}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CButton size="sm" color="warning" onClick={() => handleEdit(item)}>
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan={USER_COLUMN_KEYS.length + 1} className="text-center text-muted">
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

export default UserCreation;