import axiosInstance from "../BaseService/BaseURL";

export const Pageload = async (pageNumber, pageSize) => {
  try {
    const response = await axiosInstance.get(
      `/api/GRN/GRNPageload?pageNumber=${pageNumber}&pageSize=${pageSize}`
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


export const PoNoFetch = async (pono) => {
  try {
    const response = await axiosInstance.get(
      `api/GRN/GRNPoNoFetch?PoNo=${pono}`
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

export const insert = async (Datainsert) => {
  try {
    const response = await axiosInstance.post(
      `api/GRN/GRNInsert`,
      Datainsert
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

export const Edit = async (GRNNo) => {
  try {
    const response = await axiosInstance.get(
      `api/GRN/GRNEdit?GRNNo=${GRNNo}`
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

export const View = async (GRNNo) => {
  try {
    const response = await axiosInstance.get(
      `/api/GRN/GRNView?GRNNo=${GRNNo}`
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