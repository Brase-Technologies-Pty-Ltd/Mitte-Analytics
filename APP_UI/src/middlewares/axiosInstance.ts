import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "auth_header": localStorage.getItem("token"),
  },
});

// Function to handle logout
const handleLogout = () => {
  localStorage.removeItem("authToken");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_header");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.warn("Session expired! Redirecting to login...");
        handleLogout();
      } else if (error.response.status === 403) {
        toast.warn("Forbidden! You don't have permission.");
      } else if (error.response.status >= 500) {
        toast.error("Server error! Please try again later.");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
