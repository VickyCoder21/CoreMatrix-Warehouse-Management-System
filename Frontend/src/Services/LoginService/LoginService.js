import axiosInstance from "../BaseService/BaseURL";

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post("/api/Login/Login", credentials);

    return {
      ok: true,
      result: response.data,
    };
  } catch (error) {
    return {
      ok: false,
      result: error.response?.data || {
        message: "Server error",
      },
    };
  }
};