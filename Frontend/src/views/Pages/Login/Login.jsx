import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow, CModal,
    CModalHeader, CModalTitle, CModalBody, CModalFooter, CSpinner,
} from "@coreui/react";
import '@coreui/coreui/dist/css/coreui.min.css';
import CIcon from "@coreui/icons-react";
import { cilUser, cilLockLocked } from "@coreui/icons";
import signupImage from "../../../assets/images/CM-logo.png";
import bgimagelogin from "../../../assets/images/background.jpg";
import '../../CommonCss/common.css';
import { loginUser } from "../../../Services/LoginService/LoginService";
import { setAuthenticatedUser } from "/src/utils/auth";

const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
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
            const timer = setTimeout(() => {
                setModalVisible(false);
            }, 3000); // Auto-close modal after 3s
            return () => clearTimeout(timer);
        }
    }, [modalVisible]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userName || !password) {
            showModal("Please enter Username and Password", "danger");
            return;
        }

        const payload = {
            username: userName,
            password: password,
        };

        try {
            setLoading(true);
            const { ok, result } = await loginUser(payload);

            if (ok && result?.result) {
                const user = result.loginDetails[0];


                setAuthenticatedUser(user, result.screenDetails || [], result.token || "");

                showModal("Login Successful", "success");

                setTimeout(() => {
                    navigate("/dashboard", { replace: true });
                }, 1000);
            } else {
                showModal(result?.message || "Invalid Username or Password", "danger");
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
                                {/* Left: Login Form */}
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
                                                style={{
                                                    color: "#123E92",
                                                    fontSize: "38px"
                                                }}
                                            >
                                                Welcome Back
                                            </h2>

                                            <p
                                                style={{
                                                    color: "#6b7280",
                                                    fontSize: "18px"
                                                }}
                                            >
                                                Sign in to your Warehouse Management System
                                            </p>
                                        </div>

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

                                            <CInputGroup className="mb-4">
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    type="password"
                                                    placeholder="Password"
                                                    autoComplete="current-password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
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
                                                    >
                                                        {loading ? <CSpinner size="sm" /> : "Login"}
                                                    </CButton>
                                                </CCol>

                                            </CRow>

                                            <div className="text-end mt-2">
                                                <CButton
                                                    color="link"
                                                    className="text-decoration-none p-0"
                                                    style={{ fontSize: "14px" }}
                                                    onClick={() => navigate("/forgot-password")}
                                                >
                                                    Forgot Password?
                                                </CButton>
                                            </div>
                                        </CForm>

                                        <hr className="my-4" />
                                        <div className="text-center">
                                            <small className="text-muted">
                                                © {new Date().getFullYear()} CoreMatrix Technologies Pvt. Ltd.
                                            </small>
                                        </div>
                                    </CCardBody>
                                </CCard>

                                {/* Right: Logo and Message */}
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
                                                    boxShadow:
                                                        "0px 15px 35px rgba(0,0,0,.35)"
                                                }}
                                            />
                                            <h2
                                                className="fw-bold mt-4"
                                                style={{
                                                    color: "#fff",
                                                    letterSpacing: "0.5px"
                                                }}
                                            >
                                                CoreMatrix Technologies
                                            </h2>

                                            <p
                                                style={{
                                                    color: "#C7D8FF",
                                                    fontSize: "18px",
                                                    marginTop: "12px"
                                                }}
                                            >
                                                Warehouse Management System
                                            </p>

                                            <hr
                                                style={{
                                                    borderColor: "rgba(255,255,255,.2)",
                                                    margin: "28px 40px"
                                                }}
                                            />

                                            <p
                                                style={{
                                                    color: "#DCE7FF",
                                                    fontSize: "15px",
                                                    lineHeight: "28px"
                                                }}
                                            >
                                                Secure Enterprise Portal
                                                <br />
                                                Inventory • Purchase • Warehouse
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

export default Login;