// lib/api/userService.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// =============================
// Types
// =============================

export interface Unit {
  id: number;
  name: string;
  kode_unit?: string;
}

export interface Divisi {
  id: number;
  name: string;
}

export interface User {
  id: number;
  id_unit?: number;
  id_divisi?: number;
  nama: string;
  email: string;
  username: string;
  telp: string;
  role: "admin" | "user" | "auditor";
  permissions?: string[];
  unit?: Unit;
  divisi?: Divisi;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  nama: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  telp: string;
  role: string;
  id_unit?: number;
  id_divisi?: number;
  permissions?: string[];
}

export interface UpdateUserData {
  nama?: string;
  email?: string;
  username?: string;
  password?: string;
  password_confirmation?: string;
  telp?: string;
  role?: string;
  id_unit?: number;
  id_divisi?: number;
  permissions?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

// =============================
// Helpers
// =============================

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function getHeaders(isJson: boolean = true) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();

  try {
    const data = JSON.parse(raw);

    // Error handling
    if (!response.ok) {
      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors)
          .flat()
          .join(", ");
        throw new Error(errorMessages);
      }

      if (response.status === 401) {
        throw new Error("Unauthenticated: Token tidak valid atau sudah expired");
      }

      throw new Error(data.message || "Terjadi kesalahan pada server");
    }

    return data;
  } catch {
    console.error("SERVER RESPONSE (RAW):", raw);
    throw new Error(
      "Server membalas HTML, bukan JSON. Cek API, route, atau token autentikasi."
    );
  }
}

// =============================
// Service
// =============================

export const userService = {
  // Get unit + divisi
  async getFormData() {
    const res = await fetch(`${API_BASE_URL}/users/form-data`, {
      method: "GET",
      headers: getHeaders(false),
    });

    const result = await handleResponse<
      ApiResponse<{ unit: Unit[]; divisi: Divisi[] }>
    >(res);

    return result.data;
  },

  // Get all users
  async getUsers(params?: any) {
    const q = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const res = await fetch(`${API_BASE_URL}/users?${q}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    return handleResponse<PaginatedResponse<User>>(res);
  },

  // Create user
  async createUser(data: CreateUserData) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<ApiResponse<User>>(res);
    return result.data;
  },

  // Get detail user
  async getUser(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    const result = await handleResponse<ApiResponse<User>>(res);
    return result.data;
  },

  // Update user
  async updateUser(id: number, data: UpdateUserData) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<ApiResponse<User>>(res);
    return result.data;
  },

  // Delete
  async deleteUser(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse<ApiResponse<null>>(res);
  },
};
