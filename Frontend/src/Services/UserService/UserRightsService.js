import axiosInstance from "../BaseService/BaseURL";

export const PageLoad = async () => {
    try {
        const response = await axiosInstance.get(
            `/api/UserRights/UserrightsPageload`
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


export const fetchUserRightsUsername = async (username) => {
    try {
        const response = await axiosInstance.get(
            `/api/UserRights/GetUserByUername/${username}`
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
        const response = await axiosInstance.post("/api/UserRights/GetUserInsert", payload);
        return {
            ok: true,
            result: response.data,
        };
    } catch (error) {
        return {
            ok: false,
            result: error?.response?.data || { message: "Server error" },
        };
    }
};
