import axiosInstance from "../BaseService/BaseURL";

export const PageLoad = async (pageNumber, pageSize) => {
  try {
    const response = await axiosInstance.get(
      `/api/UserCreation/UserCreationPageload?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return {
      ok: true,
      result: response.data,
    };
  } catch (error) {
    return {
      ok: false,
      result: error.response?.data || { message: "Server error" },
    };
  }
};


export const Insert = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/UserCreation/UserCreationInsert", payload);
    return {
      ok: true,
      result: response.data,
    };
  } catch (error) {
    return {
      ok: false,
      result: error.response?.data || { message: "Server error" },
    };
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/UserCreation/GetUserById/${id}`);
    return {
      ok: true,
      result: response.data,
    };
  } catch (error) {
    return {
      ok: false,
      result: error.response?.data || { message: "Error fetching user details" },
    };
  }
};


