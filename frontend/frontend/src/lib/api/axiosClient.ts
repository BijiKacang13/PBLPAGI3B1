import axios, { AxiosRequestConfig } from "axios";

// Ambil BASE URL dari .env
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ===============================
// INTERCEPTOR: AUTO ATTACH TOKEN
// ===============================
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// INTERCEPTOR: HANDLE ERROR GLOBAL
// ===============================
axiosClient.interceptors.response.use(
  (response) => response.data, // otomatis response.data
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login"; // auto logout
      }
    }

    const normalized = {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan pada server",
    };

    return Promise.reject(normalized);
  }
);

// ===============================
// WRAPPER FUNCTION (lebih clean + fleksibel)
// ===============================
export const api = {
  get: (url: string, params?: any, config?: AxiosRequestConfig) =>
    axiosClient.get(url, { params, ...config }),

  post: (url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosClient.post(url, data, config),

  put: (url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosClient.put(url, data, config),

  patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosClient.patch(url, data, config),

  delete: (url: string, config?: AxiosRequestConfig) =>
    axiosClient.delete(url, config),
};

export default axiosClient;
