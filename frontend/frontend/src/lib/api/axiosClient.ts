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
        // Check if we're not already on the login page
        if (!window.location.pathname.includes("/login")) {
          // Clear all auth data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          localStorage.removeItem("user_role");
          localStorage.removeItem("user_unit_id");
          localStorage.removeItem("user_unit_name");
          localStorage.removeItem("session_expires_in");
          localStorage.removeItem("remember_me");

          // Dispatch custom event that SessionProvider will catch
          window.dispatchEvent(new CustomEvent("session-expired"));
        }
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

// ===============================
// SESSION EXPIRED HANDLER
// ===============================
export const handleSessionExpired = () => {
  if (typeof window !== "undefined") {
    if (!window.location.pathname.includes("/login")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_unit_id");
      localStorage.removeItem("user_unit_name");
      localStorage.removeItem("session_expires_in");
      localStorage.removeItem("remember_me");

      alert("Sesi sudah habis, silahkan login ulang");
      window.location.href = "/login";
    }
  }
};

// ===============================
// AUTH FETCH WRAPPER
// Wrapper untuk fetch yang otomatis handle 401
// ===============================
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    handleSessionExpired();
  }

  return response;
};

export default axiosClient;
