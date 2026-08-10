import axiosInstance from "../BaseService/BaseURL";

export const ReportPageLoad = async () => {
    try {
        const response = await axiosInstance.get(
            "api/TransporterMasterReport/TransporterMasterReportPageLoad"
        );

        return {
            ok: true,
            result: response.data,
        };
    } catch (error) {
        return {
            ok: false,
            result: error.message,
        };
    }
};


export const GenerateReport = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "api/TransporterMasterReport/GenerateTransporterMasterReport",
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            ok: true,
            result: response.data,
        };
    } catch (error) {
        return {
            ok: false,
            result: error.message,
        };
    }
};