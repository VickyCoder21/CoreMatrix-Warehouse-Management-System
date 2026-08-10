import axiosInstance from "../BaseService/BaseURL";

export const PageLoad = async (pageNumber, pageSize) => {
  try {
    const response = await axiosInstance.get(
      `/api/GRNLabelPrint/GRNLabelPrintPageload?pageNumber=${pageNumber}&pageSize=${pageSize}`
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


export const insertGrnLabelPrint = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/GRNLabelPrint/GRNLabelPrintInsert", payload);
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


export const FetchGrnLabelRePrint = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/GRNLabelPrint/FetchGrnLabelRePrint", payload);
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