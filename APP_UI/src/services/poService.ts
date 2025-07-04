import axiosInstance from "../middlewares/axiosInstance";

export const getPO = async () => {
    const response = await axiosInstance.get(`/purchase`);
    if (response.status === 200) {
        return response.data;
    }

}
export const emailnotifcation = async () => {
    const response = await axiosInstance.get(`/email`);
    if (response.status === 200) {
      return response.data;
    }
  }
  export const getmotionalert = async () => {
    const response = await axiosInstance.get(`/motionalert`);
    if (response.status === 200) {
      return response.data;
    }
  
  }
export const createPO = async (data: any) => {
    const poData = JSON.stringify(data);
    const response = await axiosInstance.post(`/purchase/initiate`, poData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 201) {
        return response.data;
    }

}