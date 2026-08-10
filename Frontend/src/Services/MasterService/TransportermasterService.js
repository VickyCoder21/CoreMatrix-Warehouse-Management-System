import axiosInstance from "../BaseService/BaseURL";

export const Pageload = async (pageNumber, pageSize) => {
  try {
    const response = await axiosInstance.get(
      `/api/TransporterMaster/TransporterMasterPageload?pageNumber=${pageNumber}&pageSize=${pageSize}`
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
    const response = await axiosInstance.post(
      `/api/TransporterMaster/TransporterMasterInsert`,
      payload
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

