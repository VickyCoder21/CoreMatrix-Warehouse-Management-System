import axiosInstance from "../BaseService/BaseURL";

export const requestPasswordReset = async (username) => {
  try {
    const response = await axiosInstance.post("/api/PasswordReset/RequestReset", { username });
    return { ok: true, result: response.data };
  } catch (error) {
    return { ok: false, result: error.response?.data || { message: "Server error" } };
  }
};

export const PageLoad = async () => {
  try {
    const response = await axiosInstance.get("/api/PasswordReset/PasswordResetPageload");
    return { ok: true, result: response.data };
  } catch (error) {
    return { ok: false, result: error.response?.data || { message: "Server error" } };
  }
};

export const approveReset = async (autoId, newPassword) => {
  try {
    const response = await axiosInstance.post("/api/PasswordReset/ApproveReset", {
      autoId,
      newPassword,
    });
    return { ok: true, result: response.data };
  } catch (error) {
    return { ok: false, result: error.response?.data || { message: "Server error" } };
  }
};