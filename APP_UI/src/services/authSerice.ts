import axiosInstance from "../middlewares/axiosInstance";

const login = async (user_name: string, password: string) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      user_name,
      password,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Login failed. Please try again.";
    throw errorMessage;
  }
};


const registerUser = async (userData: {
  userName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  status: boolean;
}) => {
  try {
    const response = await axiosInstance.post("/user", userData);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.message || "Registration failed";
  }
};

// Send OTP
const sendOtp = async (email: string) => {
  try {
    const response = await axiosInstance.post(`auth/send-otp`, { email });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message || "An error occurred while sending OTP."
    );
  }
};

// Verify OTP
const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await axiosInstance.post(`auth/verify-otp`, {
      email,
      otp,
    });
    localStorage.setItem("resetToken", response.data.resetToken);
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message || "An error occurred while sending OTP."
    );
  }
};

// Reset Password
const resetPassword = async (password: string) => {
  try {
    const resetToken = localStorage.getItem("resetToken");
    const response = await axiosInstance.post(`auth/reset-password`, {
      resetToken,
      password,
    });

    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message || "An error occurred while sending OTP."
    );
  }
};

const getLogs = async () => {
  try {
    const response = await axiosInstance.get("/logs");
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message;
  }
};

const deleteLogs = async () => {
  try {
    const response = await axiosInstance.post("/logs/delete");
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message;
  }
};

const fetchUserData = async (payload: any) => {
  const response = await axiosInstance.post(
    `/auth/userdata`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        auth_header: payload?.token,
      },
    }
  );
  if (response.status === 200) {
    return response.data.user;
  } else {
    return null;
  }
};

const updateForAdminPassword = async (data: any) => {
  try {
    const response = await axiosInstance.post(
      `updatepassword/updateThroughAdmin`,
      data
    );
    const result = response.data;
    return result;
  } catch (error) {
    return { message: "An error occurred" };
  }
};
const isAdmin = async () => {
  try {
    const roles: any = localStorage.getItem("roles");
    return (
      roles && roles?.some((role: any) => role?.name?.toLowerCase() === "admin")
    );
  } catch (error) {
    return false;
  }
};
const authService = {
  login,
  registerUser,
  sendOtp,
  verifyOtp,
  resetPassword,
  getLogs,
  deleteLogs,
  fetchUserData,
  updateForAdminPassword,
  isAdmin,
};

export default authService;
