import axiosInstance from "../BaseService/BaseURL";

export const Pageload = async (pageNumber, pageSize) => {
  try {
    const response = await axiosInstance.get(
      `api/PurchaseOrder/PurchaseOrderPageLoad?pageNumber=${pageNumber}&pageSize=${pageSize}`

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


export const Fetch = async (Prno) => {
  try {
    const response = await axiosInstance.get(
      `api/PurchaseOrder/PurchaseOrderFetch?Prno=${Prno}`

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
      `api/PurchaseOrder/PurchaseOrderInsert`,
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


export const Edit = async (PoNo) => {
  try {
    const response = await axiosInstance.get(
      `/api/PurchaseOrder/PurchaseOrderEdit`,
      {
        params: { PoNo },
      }
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


export const View = async (PoNo) => {
  try {
    const response = await axiosInstance.get(
      `/api/PurchaseOrder/PurchaseOrderView`,
      {
        params: { PoNo },
      }
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