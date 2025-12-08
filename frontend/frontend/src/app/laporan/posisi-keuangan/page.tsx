"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Printer, Calendar, RefreshCcw, ChevronDown, Loader2 } from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";
import Navbar from "@/components/Navbar";

// Types
interface FilterOptions {
  units: Array<{ id_unit: number; unit: string }>;
  divisis: Array<{ id_divisi: number; divisi: string }>;
}

interface Account {
  id_akun: number;
  nama_akun: string;
  periode_lalu: number;
  saldo: number;
}

interface SubCategory {
  accounts: Account[];
  subtotal_periode_lalu: number;
  subtotal_saldo: number;
}

interface Category {
  sub_categories: Record<string, SubCategory>;
  total_periode_lalu: number;
  total_saldo: number;
}

interface NeracaData {
  akun_data: Record<string, Category>;
  total_kewajiban_aset_neto: number;
  total_periode_lalu_kewajiban_aset_neto: number;
  filter: {
    start_date: string;
    end_date: string;
    unit: number | null;
    divisi: number | null;
  };
}

export default function PosisiKeuangan() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // State management
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ units: [], divisis: [] });
  const [neracaData, setNeracaData] = useState<NeracaData | null>(null);
  
  // Filter states
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedDivisi, setSelectedDivisi] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date().getFullYear() + "-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchNeracaData();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/neraca-saldo/filter-options`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFilterOptions(result.data);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchNeracaData = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (selectedUnit) params.append("unit", selectedUnit.toString());
      if (selectedDivisi) params.append("divisi", selectedDivisi.toString());
      params.append("start_date", startDate);
      params.append("end_date", endDate);

      const response = await fetch(`${API_BASE_URL}/neraca-saldo?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNeracaData(result.data);
      } else {
        alert(result.message || "Gagal mengambil data");
      }
    } catch (error) {
      console.error("Error fetching neraca data:", error);
      alert("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchNeracaData();
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedUnit) params.append("unit", selectedUnit.toString());
      if (selectedDivisi) params.append("divisi", selectedDivisi.toString());
      params.append("start_date", startDate);
      params.append("end_date", endDate);

      const response = await fetch(`${API_BASE_URL}/neraca-saldo/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Neraca_Saldo_${startDate}_${endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Gagal mengunduh file Excel");
      }
    } catch (error) {
      console.error("Error exporting excel:", error);
      alert("Terjadi kesalahan saat mengunduh file");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4 w-full max-w-4xl mx-auto">
        {/* Filter Section */}
        <div className="bg-white shadow-md rounded-xl p-5 w-full text-center">
          <h2 className="font-semibold text-lg mb-5">POSISI KEUANGAN</h2>

          {/* Tombol Export dan Print */}
          <div className="flex justify-between mb-4 rounded-full overflow-hidden border border-gray-200">
            <button 
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 font-semibold hover:bg-gray-200 transition-colors"
            >
              <FileSpreadsheet size={18} /> Export Excel
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 font-semibold hover:bg-[#a8d5f5] transition-colors"
            >
              <Printer size={18} /> Print
            </button>
          </div>

          {/* Form Filter */}
          <div className="text-left space-y-3">
            <div>
              <label className="text-sm font-medium">Unit</label>
              <div className="relative mt-1">
                <select
                  value={selectedUnit || ""}
                  onChange={(e) => setSelectedUnit(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                >
                  <option value="">Akumulasi (Semua Unit)</option>
                  {filterOptions.units.map((unit) => (
                    <option key={unit.id_unit} value={unit.id_unit}>
                      {unit.unit}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Divisi</label>
              <div className="relative mt-1">
                <select
                  value={selectedDivisi || ""}
                  onChange={(e) => setSelectedDivisi(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                >
                  <option value="">Akumulasi (Semua Divisi)</option>
                  {filterOptions.divisis.map((divisi) => (
                    <option key={divisi.id_divisi} value={divisi.id_divisi}>
                      {divisi.divisi}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Dari Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Sampai Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                />
              </div>
            </div>

            {/* Tombol Refresh */}
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 rounded-full font-semibold mt-2 hover:bg-[#a8d5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Data Section */}
        {loading ? (
          <div className="w-full mt-6 text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : neracaData ? (
          <div className="w-full mt-6">
            {Object.entries(neracaData.akun_data).map(([kategori, kategoriData]) => (
              <div key={kategori} className="mb-6">
                {/* Kategori Header */}
                <div className="rounded-t-xl bg-[#7CA6FF] text-white text-center py-2 font-semibold">
                  {kategori}
                </div>

                {/* Sub Kategori */}
                {Object.entries(kategoriData.sub_categories).map(([subKategori, subData], idx) => (
                  <div key={subKategori}>
                    <div className={`bg-[#BDE1FF] text-center py-2 text-gray-700 font-medium border-t border-gray-200 ${idx === Object.keys(kategoriData.sub_categories).length - 1 ? 'rounded-b-xl' : ''}`}>
                      {subKategori}
                    </div>

                    {/* Tabel Data */}
                    <div className="mt-3 border border-gray-300 rounded-md overflow-hidden text-sm mb-4">
                      <div className="grid grid-cols-3 bg-gray-50 font-semibold text-gray-700 text-center py-2 border-b">
                        <span>Akun</span>
                        <span>Saldo Periode Lalu</span>
                        <span>Tahun Berjalan</span>
                      </div>

                      {subData.accounts.length > 0 ? (
                        <>
                          {subData.accounts.map((akun) => (
                            <div key={akun.id_akun} className="grid grid-cols-3 py-2 border-b hover:bg-gray-50">
                              <span className="px-2 text-left">{akun.nama_akun}</span>
                              <span className="px-2 text-right">{formatCurrency(akun.periode_lalu)}</span>
                              <span className="px-2 text-right">{formatCurrency(akun.saldo)}</span>
                            </div>
                          ))}
                          {/* Subtotal */}
                          <div className="grid grid-cols-3 py-2 bg-gray-100 font-semibold">
                            <span className="px-2 text-left">Subtotal {subKategori}</span>
                            <span className="px-2 text-right">{formatCurrency(subData.subtotal_periode_lalu)}</span>
                            <span className="px-2 text-right">{formatCurrency(subData.subtotal_saldo)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 text-gray-500 italic text-center">Data belum tersedia</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Total Kategori */}
                <div className="bg-gray-200 rounded-md p-3 mb-2">
                  <div className="grid grid-cols-3 font-bold text-gray-800">
                    <span>Subtotal {kategori}</span>
                    <span className="text-right">{formatCurrency(kategoriData.total_periode_lalu)}</span>
                    <span className="text-right">{formatCurrency(kategoriData.total_saldo)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Kewajiban + Aset Neto */}
            <div className="bg-blue-100 rounded-md p-4 mt-4">
              <div className="grid grid-cols-3 font-bold text-gray-900 text-lg">
                <span>Total KEWAJIBAN + ASET NETO</span>
                <span className="text-right">{formatCurrency(neracaData.total_periode_lalu_kewajiban_aset_neto)}</span>
                <span className="text-right">{formatCurrency(neracaData.total_kewajiban_aset_neto)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full mt-6 text-center py-8">
            <p className="text-gray-500">Tidak ada data. Klik Refresh untuk memuat data.</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      {/* Navbar bawah */}
      <NavbarBottom />
    </div>
  );
}