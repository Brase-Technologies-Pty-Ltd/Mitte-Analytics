import axiosInstance from "../middlewares/axiosInstance";
import { User } from "../models/user.model";

export const getusers = async () => {
  const response = await axiosInstance.get(`/user`);
  if (response.status === 200) {
    return response.data;
  }
};

export const createUser = async (userdata: User) => {
  const response = await axiosInstance.post(`/user`, userdata);

  if (response.status === 201) {
    return response.data;
  }
};

export async function updateUser(id: number, userData: any) {
  const response = await axiosInstance.put(`/user/${id}`, userData);

  if (response.status === 200) {
    return response.data;
  }
}

export async function deleteOneUser(id: number) {
  return await axiosInstance.delete(`/user/${id}`);
}

export const getUserById = async (id: number) => {
  const response = await axiosInstance.get(`/user/${id}`);

  if (response.status === 200) {
    return response.data;
  }
};

export async function getUserRoleData() {
  return await axiosInstance.get(`/userrole`);
}
