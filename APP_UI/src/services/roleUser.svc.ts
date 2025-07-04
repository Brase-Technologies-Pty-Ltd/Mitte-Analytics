import axiosInstance from "../middlewares/axiosInstance";

export const getUserRoles = async () => {
  const response = await axiosInstance.get(`/userrole`);
  if (response.status === 200) {
    return response.data;
  }
};
export const getUserRoleData = async () => {
  const response = await axiosInstance.get(`/userrole`);
  if (response.status === 200) {
    return response.data;
  }
};

export const getOneUserRoleData = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/userrole/${id}`);
    if (response.status === 200) {
      return { status: response.status, data: response.data };
    } else {
      console.error(
        `Error fetching user role data (Status ${response.status}):`,
        response.data
      );
      return { status: response.status, data: null };
    }
  } catch (error: any) {
    console.error("Error fetching user role data:", error);
    return {
      status: error.response?.status || undefined,
      data: error.response?.data || null,
    };
  }
};

export const putUserRoleData = async (id: number, data: any) => {
  const response = await axiosInstance.put(`/userrole/${id}`, data);

  if (response.status === 200) {
    return response.data;
  }
};

export const addUserRoleData = async (data: any) => {
  const response = await axiosInstance.post(`/userrole`, data);
  if (response.status === 201) {
    return response.data;
  } else {
    throw new Error(response.data || "Failed to assign user role.");
  }
};

export const updateUserRoleData = async (id: number, data: any) => {
  const response = await axiosInstance.put(`/userrole/${id}`, data);
  if (response.status === 200) {
    return response.data;
  }
};
