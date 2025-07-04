import axiosInstance from "../middlewares/axiosInstance";

export const getImprestProduct = async () => {
    const response = await axiosInstance.get(`/imprestproduct`);
    if (response.status === 200) {
        return response.data;
    }

};