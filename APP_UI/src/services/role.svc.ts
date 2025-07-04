import axiosInstance from "../middlewares/axiosInstance";
import { Role } from '../models/role.model';



export const getRoles = async () => {
  const response = await axiosInstance.get(`/role`);
  if (response.status === 200) {
    return response.data;
  }
};
export const getRoleData = async () => {
  const response = await axiosInstance.get(`/role`);
  if (response.status === 200) {
    return response.data;
  }
}
export const createRole = async (role: Role) => {
  const response = await axiosInstance.post(`/role`, role);
  if (response.status === 201) {
    return response.data;
  }
};
export const updateRole = async (role: Role) => {
  const response = await axiosInstance.put(`/role/${role.id}`, role);
  if (response.status === 200) {
    return response.data;
  }
};
export const deleteRole = async (id: number) => {
  const response = await axiosInstance.delete(`/role/${id}`);
  if (response.status === 200) {
    return response.data;
  }
  else {
    throw new Error(response.data || "Failed to delete role.");
  }
};

export const getusers = async () => {
  const response = await axiosInstance.get(`/user`);
  if (response.status === 200) {
    return response.data;
  }
};