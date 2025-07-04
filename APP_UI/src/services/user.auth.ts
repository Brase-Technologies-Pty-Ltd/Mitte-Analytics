import axios from "axios";
import { UserAuth, UserToken } from "../models/userAuth.modal";
import { Authentication } from "../models/authentication.model";
import axiosInstance from "../middlewares/axiosInstance";

const url = import.meta.env.VITE_REACT_APP_API_URL + "auth";

export const userAuthentication = async (payload: UserAuth) => {
  type Nullable<T> = T | null;
  let authentication: Nullable<string> = null;
  const response = await axios.post(`${url}/login`, payload);
  if (response.status === 200) {
    authentication = response.data;
  }
  return authentication;
};

export const fetchUserData = async (payload: UserToken) => {
  type Nullable<T> = T | null;
  let authentication: Nullable<Authentication> = null;
  const response = await axios.post(
    `${url}/userdata`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        auth_header: payload?.token,
      },
    }
  );
  if (response.status === 200) {
    authentication = response.data.user;
  }
  return authentication;
};

export const updatePassword = async (data: any) => {
  try {
    const response = await fetch(`${url}/updatepassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (response.ok) {
      return { message: responseData.message };
    } else {
      return { message: responseData.error || "Failed to update password" };
    }
  } catch (error) {
    return { message: "An error occurred" };
  }
};

//  @@@@@------- Reset Password service start-----@@@@@

export const resetPassword = async (data: any) => {
  try {
    const response = await axiosInstance.post(`/auth/change-password`, {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    return response;
  } catch (error: any) {
    return error.response?.data || "An error occurred";
  }
};

export const sendOtp = async (email: any) => {
  try {
    const response = await axiosInstance.post(`/auth/forgot-password`, email);

    return response;
  } catch (error: any) {
    return error.response?.data || "An error occurred";
  }
};

export const validateOtp = async (data: any) => {
  try {
    const response = await axiosInstance.post(`/auth/otp-validation`, {
      email: data.email,
      otp: data.otp,
    });

    return response;
  } catch (error: any) {
    return error.response?.data || "An error occurred";
  }
};
