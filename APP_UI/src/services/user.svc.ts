import axiosInstance from "../middlewares/axiosInstance";
import { User } from "../models/user.model";

export const getusers = async () => {
  const response = await axiosInstance.get(`/user`);
  if (response.status === 200) {
    return response.data;
  }
}

export const createUser = async (data: User) => {
  const response = await axiosInstance.post(`/user`, data);
  if (response.status === 200) {
    return response.data;
  }
}
export const updateUser = async (id: number, data: User) => {
  const response = await axiosInstance.put(`/user/${id}`, data);
  if (response.status === 200) {
    return response.data;
  }
}
export const deleteUser = async (id: number) => {
  const response = await axiosInstance.delete(`/user/${id}`);
  if (response.status === 200) {
    return response.data;
  }
}

export const getuserById = async (id: number) => {
  const response = await axiosInstance.get(`/user/${id}`);
  if (response.status === 200) {
    return response.data;
  }
}