import React, { useEffect, useState } from "react";
import CIcon from '@coreui/icons-react'
import { cilXCircle, cilCheckCircle } from '@coreui/icons'
import {
  CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormLabel, CTable,
  CRow, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CFormFeedback, CSpinner,
  CFormCheck, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import '../CommonCss/common.css';
import { PageLoad, fetchUserRightsUsername, Insert } from "../../Services/UserService/UserRightsService";

const ScreenAuthorization = () => {
  const [usernameDropdown, setUsernameDropdown] = useState([]); //store employee dropdown data
  const [selectedUsername, setSelectedUsername] = useState(""); //store selected employee code
  const [screenAccess, setScreenAccess] = useState([]); //store screen access data for selected employee
  const [selectAll, setSelectAll] = useState(false); //store state of "Select All Rights" checkbox
  const [modalVisible, setModalVisible] = useState(false); //store modal visibility
  const [modalMessage, setModalMessage] = useState(''); //store modal message
  const [modalColor, setModalColor] = useState('primary'); //store modal color (primary, success, danger)

  // Function to show modal with message and color
  const showModal = (message, color = 'primary') => {
    setModalMessage(message);
    setModalColor(color);
    setModalVisible(true);
  };

  // Fetch page load data for dropdown
  const fetchPageLoadData = async () => {
    const { ok, result } = await PageLoad();
    if (ok && result?.result) {
      const userList = result.usernamesdetails || [];
      setUsernameDropdown(
        userList.map((record) => ({
          value: record.USERNAME,
          label: record.USERNAME,
        }))
      );
    } else {
      showModal(result.message || "Data not found", "danger");
    }
  };

  // Fetch user rights for selected username
  useEffect(() => {
    fetchPageLoadData();
  }, []);

  // Handle username selection change
  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setSelectedUsername(username);

    if (!username) {
      setScreenAccess([]);
      return;
    }

    const { ok, result } = await fetchUserRightsUsername(username);
    if (ok && result?.result) {
      const normalized = result.userDetails.map((item) => ({
        ScreenId: item["Screen Id"],
        ScreenName: item.ScreenName,
        FunctionName: item["Function Name"],
        View:
          item.View === true ||
          item.View === "true" ||
          item.View === 1 ||
          item.View === "1",
      }));
      setScreenAccess(normalized);
      setSelectAll(normalized.every((s) => s.View));
    } else {
      showModal(result.message || "Data not found", "danger");
    }
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (screenId) => {
    const updated = screenAccess.map((screen) =>
      screen.ScreenId === screenId
        ? { ...screen, View: !screen.View }
        : screen
    );
    setScreenAccess(updated);
    setSelectAll(updated.every((s) => s.View));
  };

  // Handle "Select All Rights" checkbox change
  const handleSelectAllRights = () => {
    const newSelectAll = !selectAll;
    const updated = screenAccess.map((screen) => ({
      ...screen,
      View: newSelectAll,
    }));
    setScreenAccess(updated);
    setSelectAll(newSelectAll);
  };

  // Handle save button click
  const handleSave = async () => {
    if (!selectedUsername) {
      showModal("Please select a username.", "danger");
      return;
    }

    const payload = {
      Username: selectedUsername,
      ScreenRights: screenAccess.filter(screen => screen.View === true).map(screen => ({
        ScreenId: screen.ScreenId,
        ScreenName: screen.ScreenName,
        FunctionName: screen.FunctionName,
        View: "true", // since only true values are selected
      })),
    };

    const { ok, result } = await Insert(payload);

    if (ok && result?.result) {
      showModal("Screen rights saved successfully", "success");
      setSelectedUsername("");
      setScreenAccess([]);
      setSelectAll(false);
    } else {
      showModal(result?.message || "Failed to save", "danger");
    }
  };

  // Handle clear button click
  const handleClear = async () => {
    setSelectedUsername('');
    setScreenAccess([]);
    setSelectAll(false);
  };


  return (
    <>
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} alignment="top">
        <CModalHeader closeButton>
          <CModalTitle className={`text-${modalColor} fw-bold`}>
            {modalColor === "success" ? "Success" : "Error"}
          </CModalTitle>
        </CModalHeader>

        <div className="mx-auto" style={{ width: "70%" }}>
          <CModalBody className="text-center">
            {modalColor === "success" && (
              <>
                <CIcon
                  icon={cilCheckCircle}
                  className="text-success"
                  style={{ width: "70px", height: "70px", marginBottom: "10px" }}
                />
                <p className="mt-2 fs-5 text-success">{modalMessage}</p>
              </>
            )}
            {modalColor === "danger" && (
              <>
                <CIcon
                  icon={cilXCircle}
                  className="text-danger"
                  style={{ width: "80px", height: "80px", marginBottom: "10px" }}
                />
                <p className="mt-2 fs-5 text-danger">{modalMessage}</p>
              </>
            )}
          </CModalBody>

          <CModalFooter className="justify-content-center">
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </div>
      </CModal>
      <CCard>
        <CCardHeader>
          <strong>User Screen Rights</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <div className="row g-3 align-items-center">
              <CCol md={3}>
                <CFormLabel htmlFor="ddlUsername">
                  Employee Code<span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  id="ddlUsername"
                  value={selectedUsername}
                  onChange={handleUsernameChange}
                  required
                >
                  <option value="">-- Select Employee --</option>
                  {usernameDropdown.map((rec) => (
                    <option key={rec.value} value={rec.value}>
                      {rec.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={3} className="pt-4">
                <CFormCheck
                  id="selectAllCheckbox"
                  label="Select All Rights"
                  checked={selectAll}
                  onChange={handleSelectAllRights}
                />
              </CCol>
              <CCol md={3} className="pt-4 ms-auto text-end">
                <CButton
                  color="success"
                  className="mt-3 me-2"
                  disabled={!selectedUsername || screenAccess.length === 0}
                  onClick={handleSave}
                >
                  Save Rights
                </CButton>
                <CButton
                  color="danger"
                  className="mt-3"
                  onClick={handleClear}
                >
                  Clear
                </CButton>
              </CCol>
            </div>
          </CForm>

          <div className="table-responsive">
            <CTable
              striped
              className="mt-4 align-middle table-bordered text-nowrap text-center custom-header"
            >
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Screen ID</CTableHeaderCell>
                  <CTableHeaderCell>Screen Name</CTableHeaderCell>
                  <CTableHeaderCell>Function Name</CTableHeaderCell>
                  <CTableHeaderCell>View</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {screenAccess.length > 0 ? (
                  screenAccess.map((screen, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{screen.ScreenId}</CTableDataCell>
                      <CTableDataCell>{screen.ScreenName}</CTableDataCell>
                      <CTableDataCell>{screen.FunctionName}</CTableDataCell>
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={screen.View}
                          onChange={() => handleCheckboxChange(screen.ScreenId)}
                        />
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={4} className="text-center text-muted">
                      Select an employee to view screen rights
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </>
  );
};

export default ScreenAuthorization;