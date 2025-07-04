import axiosInstance from "../middlewares/axiosInstance";


export const getImprests = async () => {

    const response = await axiosInstance.get(`/imprest/all`);
    if (response.status === 200) {
      return response.data;  
    }
  
  }
  export const getSingleImprests = async () => {
    const response = await axiosInstance.get(`/imprest`);
    if (response.status === 200) {
      return response.data;
    }
  }
  export const getImprestProduct = async () => {
    const response = await axiosInstance.get(`/imprestproduct`);
    if (response.status === 200) {
        return response.data;
    }

};

export const updateImprest = async (id: number, data: any) => { 
    const response = await axiosInstance.put(`/imprest/${id}`, data);
    if (response.status === 200) {
        return response.data;
    }
} 
export const createImprest = async (data: any) => {
    const response = await axiosInstance.post(`/imprest`, data);
    if (response.status === 200) {
        return response.data;
    }
}

export const deleteOneImprest = async (id: number) => {
    const response = await axiosInstance.delete(`/imprest/${id}`);
    if (response.status === 200) {
        return response.data;
    }
}
export const getAllImprests = async () => {
    const response = await axiosInstance.get(`/imprest/all`);
    if (response.status === 200) {
        return response.data;
    }
}
export const getImprestById = async (id: number) => {
    const response = await axiosInstance.get(`/imprest/${id}`);
    if (response.status === 200) {
        return response.data;
    }
}
