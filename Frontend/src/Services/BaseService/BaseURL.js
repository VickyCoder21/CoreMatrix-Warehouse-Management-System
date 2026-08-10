import axios from "axios";
import { getToken, logout } from "/src/utils/auth";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7107",
  headers: {
    "Content-Type": "application/json",
  },
});

// Step 8: attach the JWT to every outgoing request automatically —
// no service file needs to touch headers itself.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If the token is missing/expired/invalid, every [Authorize]-protected
// endpoint returns 401. Rather than leaving the user staring at a page
// full of silently-failed requests, clear the stale session and bounce
// to /login. A hard redirect (not useNavigate) is intentional here —
// interceptors run outside the React tree, and a full reload also
// guarantees no stale in-memory state survives the forced logout.
//
// IMPORTANT: the Login endpoint itself also legitimately returns 401
// for wrong credentials (LoginController's Unauthorized(...)) — that
// is NOT a session expiry, it's an expected error the login form needs
// to handle normally. Excluding it here stops this interceptor from
// hijacking a wrong-password attempt into a silent page reload before
// Login.jsx ever gets to show its error modal.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/api/Login/Login");

    if (error.response?.status === 401 && !isLoginRequest) {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;