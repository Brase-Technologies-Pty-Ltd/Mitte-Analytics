import { Camera } from "../models/camera.model";
import axiosInstance from "../middlewares/axiosInstance";

export const getCameras = async () => {
    const response = await axiosInstance.get(`/camera`);
  if (response.status === 200) {
    return response.data;
  }
}

export const createCamera = async (cameraData: Camera) => {
    const response = await axiosInstance.post(`/camera`, cameraData);
  if (response.status === 201) {
    return response.data;
  }
}

export async function updateCamera(id: number, camera: any) {
    const response = await axiosInstance.put(`/camera/${id}`, camera);
  if (response.status === 200) {
    return response.data;
  }
}

export async function deleteOneCamera(id: number) {
    const response = await axiosInstance.delete(`/camera/${id}`);
  if (response.status === 200) {
    return response.data;
  }
}



