import React, { useEffect, useState } from 'react';
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CTable,
    CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CBadge, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CFormInput, CFormLabel, CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilCheckCircle, cilXCircle, cilSync } from '@coreui/icons';
import '@coreui/coreui/dist/css/coreui.min.css';
import '../CommonCss/common.css';
import { PageLoad, approveReset } from "../../Services/UserService/PasswordResetService";

const REQUEST_COLUMN_KEYS = ['Request Id', 'Username', 'Employee Name', 'Requested On', 'Status'];

const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    let pw = '';
    for (let i = 0; i < 10; i++) {
        pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pw;
};

const PasswordResetRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Reset modal state
    const [resetModalVisible, setResetModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);

    // Success/error modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalColor, setModalColor] = useState('primary');

    const showModal = (message, color = 'primary') => {
        setModalMessage(message);
        setModalColor(color);
        setModalVisible(true);
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { ok, result } = await PageLoad();
            if (ok && result?.result) {
                setRequests(result.requestDetails || []);
            } else {
                showModal(result?.message || 'Unable to load requests', 'danger');
            }
        } catch (error) {
            showModal('Unable to reach the server.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const openResetModal = (request) => {
        setSelectedRequest(request);
        setNewPassword('');
        setResetModalVisible(true);
    };

    const handleConfirmReset = async () => {
        if (!newPassword || newPassword.length < 6) {
            showModal('New password must be at least 6 characters.', 'danger');
            return;
        }

        try {
            setSaving(true);
            const { ok, result } = await approveReset(selectedRequest['Request Id'], newPassword);

            if (ok && result?.result) {
                setResetModalVisible(false);
                showModal(
                    `Password reset for ${selectedRequest['Username']}. New password: ${newPassword}`,
                    'success'
                );
                fetchRequests();
            } else {
                showModal(result?.message || 'Failed to reset password', 'danger');
            }
        } catch (error) {
            showModal('Unable to reach the server.', 'danger');
        } finally {
            setSaving(false);
        }
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
                    <p className="fs-5 fw-semibold mt-3 mb-0">{modalMessage}</p>
                </CModalBody>
                <CModalFooter className="justify-content-center">
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
                </CModalFooter>
            </CModal>

            {/* RESET PASSWORD MODAL */}
            <CModal visible={resetModalVisible} onClose={() => setResetModalVisible(false)} alignment="center">
                <CModalHeader closeButton>
                    <CModalTitle>Reset Password — {selectedRequest?.['Username']}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CFormLabel>New Password</CFormLabel>
                    <div className="d-flex gap-2">
                        <CFormInput
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter a new password"
                        />
                        <CButton color="secondary" variant="outline" onClick={() => setNewPassword(generateRandomPassword())}>
                            <CIcon icon={cilSync} className="me-1" />
                            Generate
                        </CButton>
                    </div>
                    <small className="text-muted d-block mt-2">
                        Share this password with the user through your usual channel — it won't be emailed automatically.
                    </small>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setResetModalVisible(false)} disabled={saving}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleConfirmReset} disabled={saving}>
                        {saving ? <CSpinner size="sm" /> : 'Confirm Reset'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CRow>
                <CCol xs={12}>
                    <CCard className="shadow-lg border-0">
                        <CCardHeader className="bg-white">
                            <h4 className="fw-bold text-primary mb-0">Password Reset Requests</h4>
                        </CCardHeader>
                        <CCardBody>
                            <div className="table-responsive">
                                <CTable bordered striped hover responsive align="middle" className="text-center custom-table">
                                    <CTableHead className="custom-header">
                                        <CTableRow>
                                            {REQUEST_COLUMN_KEYS.map((key) => (
                                                <CTableHeaderCell key={key}>{key}</CTableHeaderCell>
                                            ))}
                                            <CTableHeaderCell>Action</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {loading ? (
                                            <CTableRow>
                                                <CTableDataCell colSpan={REQUEST_COLUMN_KEYS.length + 1} className="text-center py-4">
                                                    <CSpinner size="sm" color="primary" />
                                                </CTableDataCell>
                                            </CTableRow>
                                        ) : requests.length > 0 ? (
                                            requests.map((row, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{row['Request Id']}</CTableDataCell>
                                                    <CTableDataCell>{row['Username']}</CTableDataCell>
                                                    <CTableDataCell>{row['Employee Name']}</CTableDataCell>
                                                    <CTableDataCell>{row['Requested On']}</CTableDataCell>
                                                    <CTableDataCell>
                                                        <CBadge color={row['Status'] === 'PENDING' ? 'warning' : 'secondary'}>
                                                            {row['Status']}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {row['Status'] === 'PENDING' && (
                                                            <CButton size="sm" color="primary" onClick={() => openResetModal(row)}>
                                                                <CIcon icon={cilLockLocked} className="me-1" />
                                                                Reset
                                                            </CButton>
                                                        )}
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan={REQUEST_COLUMN_KEYS.length + 1} className="text-center text-muted">
                                                    No requests found
                                                </CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    );
};

export default PasswordResetRequests;