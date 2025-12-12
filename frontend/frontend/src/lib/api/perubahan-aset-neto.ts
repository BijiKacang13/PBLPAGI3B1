// File: lib/api/perubahan-aset-neto.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const authFetch = async (url: string, options?: RequestInit) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    ...options,
  });

  // Handle unauthorized globally
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  return res;
};

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
    const query = new URLSearchParams();
    if (params.tanggal_mulai) query.append("tanggal_mulai", params.tanggal_mulai);
    if (params.tanggal_selesai) query.append("tanggal_selesai", params.tanggal_selesai);
    if (params.unit !== undefined && params.unit !== null) query.append("unit", params.unit.toString());
    if (params.divisi !== undefined && params.divisi !== null) query.append("divisi", params.divisi.toString());

    const res = await authFetch(`/perubahan-aset-neto?${query.toString()}`);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || "Gagal memuat data laporan");
    }
    return res.json();
  },

  // Get units list
  getUnits: async (): Promise<Unit[]> => {
    const res = await authFetch("/perubahan-aset-neto/units");
    if (!res.ok) throw new Error("Gagal memuat data unit");
    const body = await res.json();
    return body.data;
  },

  // Get divisi list
  getDivisi: async (): Promise<Divisi[]> => {
    const res = await authFetch("/perubahan-aset-neto/divisi");
    if (!res.ok) throw new Error("Gagal memuat data divisi");
    const body = await res.json();
    return body.data;
  },

  // Export to Excel
  exportExcel: async (params: PerubahanAsetNetoParams): Promise<void> => {
    const queryParams = new URLSearchParams();
    
    if (params.tanggal_mulai) queryParams.append('tanggal_mulai', params.tanggal_mulai);
    if (params.tanggal_selesai) queryParams.append('tanggal_selesai', params.tanggal_selesai);
    if (params.unit !== undefined && params.unit !== null) queryParams.append('unit', params.unit.toString());
    if (params.divisi !== undefined && params.divisi !== null) queryParams.append('divisi', params.divisi.toString());

    const token = localStorage.getItem('auth_token');
    const url = `${API_BASE_URL}/perubahan-aset-neto/export-excel?${queryParams.toString()}`;
    
    try {
      // Use fetch to download with authorization header
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Perubahan_Aset_Neto_${params.tanggal_mulai || ''}_${params.tanggal_selesai || ''}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },
};