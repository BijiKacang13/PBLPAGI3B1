"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, Printer, RefreshCcw, ChevronDown, Loader2 } from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";
import Navbar from "@/components/Navbar";

// Types
interface FilterOptions {
  units: Array<{ id_unit: number; unit: string }>;
  divisis: Array<{ id_divisi: number; divisi: string }>;
}

interface PRRAItem {
  id_akun?: number;
  id_kegiatan?: number;
  nama_akun?: string;
  nama_kegiatan?: string;
  budget_rapbs: number;
  realisasi: number;
  selisih: number;
  persentase_capaian: number;
}

interface SubKategori {
  items: PRRAItem[];
}

interface PRRAData {
  grouped_data: Record<string, Record<string, PRRAItem[]>>;
  total_budget: number;
  total_realisasi: number;
  total_selisih: number;
  filter: {
    berdasarkan: "akun" | "kegiatan";
    start_date: string;
    end_date: string;
    unit: number | null;
    divisi: number | null;
  };
}

interface UserRole {
  role: "admin" | "auditor" | "akuntan_unit";
  id_unit?: number;
}

export default function ProyeksiRencanaRealisasiAnggaran() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // State management
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ units: [], divisis: [] });
  const [prraData, setPrraData] = useState<PRRAData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>({ role: "admin" });

  // Filter states
  const [berdasarkan, setBerdasarkan] = useState<"akun" | "kegiatan">("akun");
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedDivisi, setSelectedDivisi] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date().getFullYear() + "-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Initial filters (default values)
  const initialFilters = {
    berdasarkan: "akun" as "akun" | "kegiatan",
    unit: null as number | null,
    divisi: null as number | null,
    start_date: new Date().getFullYear() + "-01-01",
    end_date: new Date().toISOString().split("T")[0],
  };

  // Fetch filter options and user role on mount
  useEffect(() => {
    fetchFilterOptions();
    const role = localStorage.getItem("user_role") as "admin" | "auditor" | "akuntan_unit";
    const unitId = localStorage.getItem("user_unit_id");

    if (role) {
      setUserRole({
        role,
        id_unit: unitId ? parseInt(unitId) : undefined
      });

      // Set unit for akuntan_unit
      if (role === "akuntan_unit" && unitId) {
        setSelectedUnit(parseInt(unitId));
      }
    }
  }, []);

  // Auto-fetch data saat filter berubah
  useEffect(() => {
    fetchPRRAData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [berdasarkan, selectedUnit, selectedDivisi, startDate, endDate]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prra/filter-options`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          Accept: "application/json",
        },
      });

      // Handle 401 Unauthenticated
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_unit_id");
        localStorage.removeItem("user_unit_name");
        alert("Sesi sudah habis, silahkan login ulang");
        router.push("/login");
        return;
      }

      const result = await response.json();

      if (result.success) {
        setFilterOptions(result.data);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchPRRAData = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("berdasarkan", berdasarkan);
      if (selectedUnit) params.append("unit", selectedUnit.toString());
      if (selectedDivisi) params.append("divisi", selectedDivisi.toString());
      params.append("start_date", startDate);
      params.append("end_date", endDate);

      const response = await fetch(`${API_BASE_URL}/prra?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          Accept: "application/json",
        },
      });

      // Handle 401 Unauthenticated
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_unit_id");
        localStorage.removeItem("user_unit_name");
        alert("Sesi sudah habis, silahkan login ulang");
        router.push("/login");
        return;
      }

      const result = await response.json();

      if (result.success) {
        setPrraData(result.data);
      } else {
        alert(result.message || "Gagal mengambil data");
      }
    } catch (error) {
      console.error("Error fetching PRRA data:", error);
      alert("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setBerdasarkan(initialFilters.berdasarkan);
    setSelectedUnit(userRole.role === "akuntan_unit" ? userRole.id_unit || null : initialFilters.unit);
    setSelectedDivisi(initialFilters.divisi);
    setStartDate(initialFilters.start_date);
    setEndDate(initialFilters.end_date);
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      params.append("berdasarkan", berdasarkan);
      if (selectedUnit) params.append("unit", selectedUnit.toString());
      if (selectedDivisi) params.append("divisi", selectedDivisi.toString());
      params.append("start_date", startDate);
      params.append("end_date", endDate);

      const response = await fetch(`${API_BASE_URL}/prra/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PRRA_${berdasarkan}_${startDate}_${endDate}.xlsx`;
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
    const abs = Math.abs(value);
    const formatted = new Intl.NumberFormat("id-ID").format(abs);
    return value < 0 ? `(${formatted})` : formatted;
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2) + "%";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4 md:px-6 lg:px-10 w-full max-w-4xl mx-auto">
        {/* Filter Section */}
        <div className="bg-white shadow-md rounded-xl p-5 w-full text-center">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold text-lg flex-1 text-center">
              PROYEKSI RENCANA & REALISASI ANGGARAN
            </h2>
            <div className="w-10" />
          </div>

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
              <label className="text-sm font-medium">Berdasarkan</label>
              <div className="relative mt-1">
                <select
                  value={berdasarkan}
                  onChange={(e) => setBerdasarkan(e.target.value as "akun" | "kegiatan")}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                >
                  <option value="akun">Akun</option>
                  <option value="kegiatan">Kegiatan</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Unit</label>
              <div className="relative mt-1">
                {userRole.role === "admin" || userRole.role === "auditor" ? (
                  <>
                    <select
                      value={selectedUnit || ""}
                      onChange={(e) => setSelectedUnit(e.target.value ? Number(e.target.value) : null)}
                      className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                    >
                      <option value="">Semua Unit</option>
                      {filterOptions.units.map((unit) => (
                        <option key={unit.id_unit} value={unit.id_unit}>
                          {unit.unit}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                  </>
                ) : (
                  <>
                    <select
                      className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-100 appearance-none"
                      disabled
                    >
                      {filterOptions.units
                        .filter((unit) => unit.id_unit === userRole.id_unit)
                        .map((unit) => (
                          <option key={unit.id_unit} value={unit.id_unit}>
                            {unit.unit}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                  </>
                )}
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
                  <option value="">Semua Divisi</option>
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
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 rounded-full font-semibold mt-2 hover:bg-[#9CCFFF] transition"
            >
              <RefreshCcw size={18} />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Data Section */}
        {loading ? (
          <div className="w-full mt-6 text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : prraData ? (
          <div className="w-full mt-6">
            {Object.entries(prraData.grouped_data).map(([kategori, subKategoriData]) => (
              <div key={kategori} className="mb-6">
                {/* Kategori Header */}
                <div className="rounded-t-xl bg-[#7CA6FF] text-white text-center py-2 font-semibold uppercase">
                  {kategori}
                </div>

                {/* Tabel Data */}
                <div className="border border-gray-300 rounded-b-xl overflow-hidden text-sm">
                  <div className="grid grid-cols-5 bg-gray-50 font-semibold text-gray-700 text-center py-2 border-b">
                    <span className="px-2">{berdasarkan === "akun" ? "Akun" : "Kegiatan"}</span>
                    <span className="px-2">Budget RAPBS</span>
                    <span className="px-2">Realisasi</span>
                    <span className="px-2">Selisih</span>
                    <span className="px-2">% Capaian</span>
                  </div>

                  {Object.entries(subKategoriData).map(([subKategori, items]) =>
                    items.map((item: PRRAItem, idx: number) => (
                      <div
                        key={idx}
                        className="grid grid-cols-5 py-2 border-b hover:bg-gray-50"
                      >
                        <span className="px-2 text-left">
                          {item.nama_akun || item.nama_kegiatan}
                        </span>
                        <span className="px-2 text-right">
                          {formatCurrency(item.budget_rapbs)}
                        </span>
                        <span className="px-2 text-right">
                          {formatCurrency(item.realisasi)}
                        </span>
                        <span className="px-2 text-right">
                          {formatCurrency(item.selisih)}
                        </span>
                        <span className="px-2 text-right">
                          {formatPercentage(item.persentase_capaian)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            {/* Total Section */}
            {prraData && (
              <div className="bg-blue-100 rounded-md p-4 mt-4">
                <div className="grid grid-cols-5 font-bold text-gray-900 text-sm">
                  <span>TOTAL</span>
                  <span className="text-right">{formatCurrency(prraData.total_budget)}</span>
                  <span className="text-right">{formatCurrency(prraData.total_realisasi)}</span>
                  <span className="text-right">{formatCurrency(prraData.total_selisih)}</span>
                  <span className="text-right">
                    {prraData.total_budget !== 0
                      ? formatPercentage((prraData.total_realisasi / prraData.total_budget) * 100)
                      : "0%"}
                  </span>
                </div>
              </div>
            )}
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