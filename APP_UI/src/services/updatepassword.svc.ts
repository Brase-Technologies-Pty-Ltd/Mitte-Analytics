import axiosInstance from "../middlewares/axiosInstance";

export const updatePassword = async (data: any) => {
    try {
        const response = await axiosInstance.post(`/updatepassword`, data);
        if (response.status === 200) {
            return { message: response.data.message };
        } else {
            return { message: response.data.error || "Failed to update password" };
        }
    } catch (error) {
        return { message: "An error occurred" };
    }
};

export const updateForAdminPassword = async (data: any) => {
    
    try {
        const response = await axiosInstance.post(`/updatepassword/updateThroughAdmin`, data);
        if (response.status === 200) {
            return { message: response.data.message };
        } else {
            return { message: response.data.error || "Failed to update password" };
        }
    } catch (error) {
        return { message: "An error occurred" };
    }
}

