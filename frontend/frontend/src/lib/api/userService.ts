// lib/api/userService.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// =============================
// Types
// =============================

export type Role = "admin" | "user" | "auditor" | "akuntan_unit";

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
  email?: string;
  username: string;
  telp?: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

/**
 * =============================
 * USER (admin / user / auditor)
 * =============================
 */
export interface CreateUserData {
  nama: string;
  email?: string;
  username: string;
  password: string;
  password_confirmation: string;
  telp?: string;
  role: "admin" | "user" | "auditor";
  id_divisi?: number;
}

export interface UpdateUserData {
  nama?: string;
  email?: string;
  username?: string;
  password?: string;
  password_confirmation?: string;
  telp?: string;
  role?: "admin" | "user" | "auditor";
  id_divisi?: number;
}

/**
 * =============================
 * AKUNTAN UNIT
 * =============================
 */
export interface AkuntanUnit {
  id_akuntan_unit: number;
  id_unit: number;
  email: string;
  telp: string;
  user: User;
  unit: Unit;
  hakAkses: Record<string, boolean>;
}

export interface CreateAkuntanUnitData {
  nama: string;
  username: string;
  password: string;
  password_confirmation: string;
  id_unit: number;
  email: string;
  telp: string;

  // hak akses
  view_rapbs_akun?: boolean;
  create_rapbs_akun?: boolean;
  update_rapbs_akun?: boolean;
  view_rapbs_kegiatan?: boolean;
  create_rapbs_kegiatan?: boolean;
  update_rapbs_kegiatan?: boolean;
  view_jurnal_umum?: boolean;
  create_jurnal_umum?: boolean;
  update_jurnal_umum?: boolean;
  delete_jurnal_umum?: boolean;
  view_buku_besar?: boolean;
  create_buku_besar?: boolean;
  delete_buku_besar?: boolean;
  view_laporan_komprehensif?: boolean;
  view_laporan_posisi_keuangan?: boolean;
  view_laporan_arus_kas?: boolean;
  view_laporan_perubahan_aset_neto?: boolean;
  view_laporan_catatan_atas_laporan_keuangan?: boolean;
  view_laporan_proyeksi_rencana_dan_realisasi_anggaran?: boolean;
}

/**
 * =============================
 * API RESPONSE
 * =============================
 */
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
    last_page: number;
    per_page: number;
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

    if (!response.ok) {
      if (response.status === 422 && data.errors) {
        throw new Error(Object.values(data.errors).flat().join(", "));
      }

      if (response.status === 401) {
        throw new Error("Unauthenticated: Token tidak valid atau expired");
      }

      throw new Error(data.message || "Terjadi kesalahan server");
    }

    return data;
  } catch {
    console.error("RAW RESPONSE:", raw);
    throw new Error("Response bukan JSON. Cek API / token.");
  }
}

// =============================
// Service
// =============================

export const userService = {
  /**
   * FORM DATA
   */
  async getFormData() {
    const res = await fetch(`${API_BASE_URL}/users/form-data`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse<
      ApiResponse<{ unit: Unit[]; divisi: Divisi[] }>
    >(res);

    return result.data;
  },

  /**
   * USER (admin / user / auditor)
   */
  async getUsers(params?: any) {
    const q = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    const res = await fetch(`${API_BASE_URL}/users?${q}`, {
      headers: getHeaders(false),
    });

    return handleResponse<PaginatedResponse<User>>(res);
  },

  async createUser(data: CreateUserData) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<ApiResponse<User>>(res);
    return result.data;
  },

  async getUser(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse<ApiResponse<User>>(res);
    return result.data;
  },

  async updateUser(id: number, data: UpdateUserData) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<ApiResponse<User>>(res);
    return result.data;
  },

  async deleteUser(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse<ApiResponse<null>>(res);
  },

  /**
   * AKUNTAN UNIT
   */
  async createAkuntanUnit(data: CreateAkuntanUnitData) {
    const res = await fetch(`${API_BASE_URL}/akuntan-unit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<ApiResponse<AkuntanUnit>>(res);
    return result.data;
  },

  async getAkuntanUnits(params?: any) {
    const q = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    const res = await fetch(`${API_BASE_URL}/akuntan-unit?${q}`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse<ApiResponse<AkuntanUnit[]>>(res);
    return result.data;
  },

  async getAkuntanUnit(id: number) {
    const res = await fetch(`${API_BASE_URL}/akuntan-unit/${id}`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse<ApiResponse<AkuntanUnit>>(res);
    return result.data;
  },

  async updateAkuntanUnit(id: number, data: Partial<CreateAkuntanUnitData>) {
    const res = await fetch(`${API_BASE_URL}/akuntan-unit/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<ApiResponse<AkuntanUnit>>(res);
    return result.data;
  },

  async deleteAkuntanUnit(id: number) {
    const res = await fetch(`${API_BASE_URL}/akuntan-unit/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse<ApiResponse<null>>(res);
  },
};
