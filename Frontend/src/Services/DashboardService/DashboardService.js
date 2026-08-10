import axiosInstance from "../BaseService/BaseURL";

export const DashboardPageLoad = async () => {
    try {
        const response = await axiosInstance.get(`/api/Dashboard/DashboardPageLoad`);
        return {
            ok: true,
            result: response.data,
        };
    } catch (error) {
        return {
            ok: false,
            result: error.response?.data || { message: "Error fetching dashboard details" },
        };
    }
};

export const DashboardPurchaseOrderSummary = async () => {
    try {
        const response = await axiosInstance.get('/api/Dashboard/DashboardPurchaseOrderSummary');
        return { 
            ok: true, result: response.data 
        };
    } catch (error) {
        return { 
            ok: false, 
            result: error.response?.data || { message: 'Server error' } 
        };
    }
};