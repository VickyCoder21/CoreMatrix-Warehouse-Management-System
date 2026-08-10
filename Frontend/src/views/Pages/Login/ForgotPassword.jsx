import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow, CModal,
    CModalHeader, CModalTitle, CModalBody, CModalFooter, CSpinner,
} from "@coreui/react";
import '@coreui/coreui/dist/css/coreui.min.css';
import CIcon from "@coreui/icons-react";
import { cilUser, cilArrowLeft } from "@coreui/icons";
import signupImage from "../../../assets/images/CM-logo.png";
import bgimagelogin from "../../../assets/images/background.jpg";
import '../../CommonCss/common.css';
import { requestPasswordReset } from "../../../Services/UserService/PasswordResetService";

const ForgotPassword = () => {
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalColor, setModalColor] = useState('primary');

    const showModal = (message, color = 'primary') => {
        setModalMessage(message);
        setModalColor(color);
        setModalVisible(true);
    };

    useEffect(() => {
        if (modalVisible) {
            const timer = setTimeout(() => setModalVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [modalVisible]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userName) {
            showModal("Please enter your username", "danger");
            return;
        }

        try {
            setLoading(true);
            const { ok, result } = await requestPasswordReset(userName);

            if (ok && result?.result) {
                showModal(result.message || "Request submitted", "success");
                setSubmitted(true);
            } else {
                showModal(result?.message || "Unable to submit request", "danger");
            }
        } catch (error) {
            showModal("Unable to reach the server. Please try again.", "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} alignment="top">
                <CModalHeader closeButton>
                    <CModalTitle className={`text-${modalColor}`}>
                        {modalColor === "success" ? "Success" : "Message"}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p>{modalMessage}</p>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundImage:
                        `linear-gradient( rgba(0,0,0,.45), rgba(0,0,0,.45) ),
                     url(${bgimagelogin})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <CContainer>
                    <CRow className="justify-content-center">
                        <CCol md={10}>
                            <CCardGroup style={{ height: "490px", width: "900px" }} className="shadow-lg border-0 rounded-4 overflow-hidden">
                                {/* Left: Form */}
                                <CCard
                                    className="border-0"
                                    style={{
                                        background: "#ffffffdd",
                                        backdropFilter: "blur(6px)",
                                        padding: "45px"
                                    }}
                                >
                                    <CCardBody>
                                        <div className="mb-4">
                                            <h2
                                                className="fw-bold"
                                                style={{ color: "#123E92", fontSize: "34px" }}
                                            >
                                                Forgot Password?
                                            </h2>

                                            <p style={{ color: "#6b7280", fontSize: "17px" }}>
                                                {submitted
                                                    ? "Your request has been sent. An admin will reach out with a new password."
                                                    : "Enter your username and an admin will reset your password."}
                                            </p>
                                        </div>

                                        {!submitted && (
                                            <CForm onSubmit={handleSubmit}>
                                                <CInputGroup className="mb-4">
                                                    <CInputGroupText>
                                                        <CIcon icon={cilUser} />
                                                    </CInputGroupText>
                                                    <CFormInput
                                                        placeholder="Username"
                                                        autoComplete="username"
                                                        value={userName}
                                                        onChange={(e) => setUserName(e.target.value)}
                                                        disabled={loading}
                                                        required
                                                    />
                                                </CInputGroup>

                                                <CRow className="align-items-center">
                                                    <CCol xs={6}>
                                                        <CButton
                                                            type="submit"
                                                            color="primary"
                                                            className="w-100"
                                                            style={{
                                                                height: "48px",
                                                                fontSize: "17px",
                                                                fontWeight: "600",
                                                                borderRadius: "10px",
                                                                background: "#2563EB",
                                                                border: "none"
                                                            }}
                                                            disabled={loading}
                                                        >
                                                            {loading ? <CSpinner size="sm" /> : "Submit Request"}
                                                        </CButton>
                                                    </CCol>
                                                </CRow>
                                            </CForm>
                                        )}

                                        <hr className="my-4" />
                                        <div className="text-center">
                                            <CButton
                                                color="link"
                                                className="text-decoration-none p-0"
                                                onClick={() => navigate("/login")}
                                            >
                                                <CIcon icon={cilArrowLeft} className="me-1" />
                                                Back to Login
                                            </CButton>
                                        </div>
                                    </CCardBody>
                                </CCard>

                                {/* Right: Brand panel */}
                                <CCard
                                    className="text-white d-flex flex-column justify-content-center align-items-center p-5 logocolor"
                                    style={{
                                        width: "45%",
                                        background:
                                            "linear-gradient(145deg,#0B2A73,#1749B3,#0A225A)",
                                        borderTopRightRadius: "20px",
                                        borderBottomRightRadius: "20px",
                                    }}
                                >
                                    <CCardBody className="text-center">
                                        <div>
                                            <img
                                                src={signupImage}
                                                alt="CoreMatrix Technologies"
                                                style={{
                                                    width: "240px",
                                                    borderRadius: "25px",
                                                    boxShadow: "0px 15px 35px rgba(0,0,0,.35)"
                                                }}
                                            />
                                            <h2
                                                className="fw-bold mt-4"
                                                style={{ color: "#fff", letterSpacing: "0.5px" }}
                                            >
                                                CoreMatrix Technologies
                                            </h2>

                                            <p style={{ color: "#C7D8FF", fontSize: "18px", marginTop: "12px" }}>
                                                Warehouse Management System
                                            </p>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCardGroup>
                        </CCol>
                    </CRow>
                </CContainer>
            </div>
        </>
    );
};

export default ForgotPassword;