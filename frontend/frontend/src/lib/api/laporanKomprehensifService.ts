// File: lib/services/laporanKomprehensifService.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Buat instance axios dengan config default
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
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

// Interceptor untuk handle error response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid, redirect ke login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface LaporanFilters {
  id_unit?: number | null;
  id_divisi?: number | null;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
}

export interface AkunData {
  akun: string;
  total_tanpa: number;
  total_dengan: number;
  total: number;
}

export interface LaporanSummary {
  total_pendapatan: number;
  total_pendapatan_terikat: number;
  total_pendapatan_all: number;
  total_beban: number;
  total_beban_terikat: number;
  total_beban_all: number;
  kenaikan_penghasilan_komprehensif: number;
}

export interface LaporanResponse {
  success: boolean;
  data: {
    pendapatan_all: { [key: string]: AkunData[] };
    beban_all: { [key: string]: AkunData[] };
    summary: LaporanSummary;
    filters: LaporanFilters;
  };
}

export interface Unit {
  id_unit: number;
  nama_unit: string;
}

export interface Divisi {
  id_divisi: number;
  nama_divisi: string;
}

export interface OptionsResponse {
  success: boolean;
  data: {
    units: Unit[];
    divisis: Divisi[];
  };
}

// API Service
export const laporanKomprehensifService = {
  /**
   * Ambil data laporan komprehensif
   */
  async getLaporan(filters: LaporanFilters): Promise<LaporanResponse> {
    try {
      const response = await apiClient.get<LaporanResponse>('/laporan-komprehensif', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching laporan:', error);
      throw error;
    }
  },

  /**
   * Ambil data dropdown options (units & divisions)
   */
  async getOptions(): Promise<OptionsResponse> {
    try {
      const response = await apiClient.get<OptionsResponse>('/laporan-komprehensif/options');
      return response.data;
    } catch (error) {
      console.error('Error fetching options:', error);
      throw error;
    }
  },

  /**
   * Download Excel file
   */
  async exportExcel(filters: LaporanFilters): Promise<void> {
    try {
      const response = await apiClient.get('/laporan-komprehensif/export-excel', {
        params: filters,
        responseType: 'blob', // Important untuk download file
      });

      // Buat URL untuk blob dan trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename dari response header atau gunakan default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'Laporan_Komprehensif.xlsx';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length > 1) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  },
};

export default laporanKomprehensifService;