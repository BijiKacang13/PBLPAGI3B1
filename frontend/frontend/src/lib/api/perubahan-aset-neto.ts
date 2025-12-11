// File: lib/api/perubahan-aset-neto.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Untuk mengirim cookies (sanctum)
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface PerubahanAsetNetoParams {
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  unit?: number | null;
  divisi?: number | null;
}

export interface AsetNetoData {
  saldo_awal: number;
  kenaikan_periode_lalu: number;
  kenaikan_periode_berjalan: number;
  saldo_akhir: number;
}

export interface ReportData {
  dengan_pembatasan: AsetNetoData;
  tanpa_pembatasan: AsetNetoData;
}

export interface ApiResponse {
  success: boolean;
  data: {
    report_data: ReportData;
    total_saldo_akhir: number;
    start: string;
    end: string;
    id_unit: number | null;
    id_divisi: number | null;
    user: {
      role: string;
      id_unit: number | null;
    };
  };
  message: string;
}

export interface Unit {
  id_unit: number;
  unit: string;
}

export interface Divisi {
  id_divisi: number;
  divisi: string;
}

// API Functions
export const perubahanAsetNetoApi = {
  // Get report data
  getData: async (params: PerubahanAsetNetoParams): Promise<ApiResponse> => {
    const response = await apiClient.get('/perubahan-aset-neto', { params });
    return response.data;
  },

  // Get units list
  getUnits: async (): Promise<Unit[]> => {
    const response = await apiClient.get('/perubahan-aset-neto/units');
    return response.data.data;
  },

  // Get divisi list
  getDivisi: async (): Promise<Divisi[]> => {
    const response = await apiClient.get('/perubahan-aset-neto/divisi');
    return response.data.data;
  },

  // Export to Excel
  exportExcel: (params: PerubahanAsetNetoParams): void => {
    const queryParams = new URLSearchParams();
    
    if (params.tanggal_mulai) queryParams.append('tanggal_mulai', params.tanggal_mulai);
    if (params.tanggal_selesai) queryParams.append('tanggal_selesai', params.tanggal_selesai);
    if (params.unit) queryParams.append('unit', params.unit.toString());
    if (params.divisi) queryParams.append('divisi', params.divisi.toString());

    const token = localStorage.getItem('auth_token');
    const url = `${API_BASE_URL}/perubahan-aset-neto/export-excel?${queryParams.toString()}&token=${token}`;
    
    window.open(url, '_blank');
  },
};