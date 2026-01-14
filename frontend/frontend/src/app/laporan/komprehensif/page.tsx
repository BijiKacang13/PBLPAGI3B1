"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  Calendar,
  RefreshCcw,
  Loader2,
  ChevronDown,
} from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";
import Navbar from "@/components/Navbar";
import laporanKomprehensifService, {
  LaporanResponse,
  Unit,
  Divisi,
  AkunData,
} from "@/lib/api/laporanKomprehensifService";

export default function LaporanKomprehensif() {
  const router = useRouter();

  // State untuk data
  const [units, setUnits] = useState<Unit[]>([]);
  const [divisis, setDivisis] = useState<Divisi[]>([]);
  const [laporanData, setLaporanData] = useState<LaporanResponse | null>(null);

  // State untuk filters
  const [filters, setFilters] = useState({
    id_unit: null as number | null,
    id_divisi: null as number | null,
    tanggal_mulai: new Date().getFullYear() + "-01-01",
    tanggal_selesai: new Date().toISOString().split("T")[0],
  });

  // Role state
  const [userRole, setUserRole] = useState<string>("");
  const [userUnitName, setUserUnitName] = useState<string>("");

  // Initial filters (default values)
  const initialFilters = {
    id_unit: null as number | null,
    id_divisi: null as number | null,
    tanggal_mulai: new Date().getFullYear() + "-01-01",
    tanggal_selesai: new Date().toISOString().split("T")[0],
  };

  // State untuk loading
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch options (units & divisions) saat komponen mount
  useEffect(() => {
    fetchOptions();

    // Get user role & unit name
    const role = localStorage.getItem("user_role") || "";
    setUserRole(role);
    const unitName = localStorage.getItem("user_unit_name") || "";
    setUserUnitName(unitName);

    // Set unit filter if akuntan_unit
    if (role === "akuntan_unit") {
      const unitId = localStorage.getItem("user_unit_id");
      if (unitId && !isNaN(Number(unitId))) {
        setFilters(prev => ({ ...prev, id_unit: Number(unitId) }));
      }
    }
  }, []);

  // Auto-fetch laporan saat filter berubah
  useEffect(() => {
    fetchLaporan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.id_unit, filters.id_divisi, filters.tanggal_mulai, filters.tanggal_selesai]);

  const fetchOptions = async () => {
    try {
      const response = await laporanKomprehensifService.getOptions();
      if (response.success) {
        setUnits(response.data.units);
        setDivisis(response.data.divisis);
      }
    } catch (err) {
      console.error("Error fetching options:", err);
      setError("Gagal mengambil data unit dan divisi");
    }
  };

  const fetchLaporan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await laporanKomprehensifService.getLaporan(filters);
      if (response.success) {
        setLaporanData(response);
      }
    } catch (err: any) {
      console.error("Error fetching laporan:", err);
      setError(err.response?.data?.message || "Gagal mengambil data laporan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    field: string,
    value: string | number | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "" ? null : value,
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await laporanKomprehensifService.exportExcel(filters);
    } catch (err: any) {
      console.error("Error exporting Excel:", err);
      alert(err.response?.data?.message || "Gagal mengekspor Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderAkunSection = (
    title: string,
    data: { [key: string]: AkunData[] },
    bgColor: string
  ) => {
    const hasData = Object.keys(data).length > 0;

    return (
      <div className="w-full mt-6">
        <div
          className={`rounded-t-xl ${bgColor} text-white text-center py-2 font-semibold`}
        >
          {title}
        </div>

        {hasData ? (
          Object.entries(data).map(([subKategori, items]) => (
            <div key={subKategori}>
              <div className="bg-[#BDE1FF] text-center py-2 text-gray-700 font-medium border-t border-gray-200">
                {subKategori}
              </div>

              <div className="border border-gray-300 text-sm">
                <div className="grid grid-cols-4 bg-gray-50 font-semibold text-gray-700 text-center py-2 border-b text-xs">
                  <span className="col-span-1">Akun</span>
                  <span>Tanpa</span>
                  <span>Dengan</span>
                  <span>Jumlah</span>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 py-2 px-2 border-b last:border-b-0 text-xs"
                  >
                    <span className="col-span-1 text-left truncate">
                      {item.akun}
                    </span>
                    <span className="text-right">
                      {formatCurrency(item.total_tanpa)}
                    </span>
                    <span className="text-right">
                      {formatCurrency(item.total_dengan)}
                    </span>
                    <span className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-4 text-center text-gray-500 italic text-sm border border-gray-300 rounded-b-xl">
            Data belum tersedia
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4 md:px-6 lg:px-10 w-full max-w-4xl mx-auto">
        {/* Kartu judul + filter */}
        <div className="bg-white shadow-md rounded-xl p-5 w-full text-center">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold text-lg flex-1 text-center">
              LAPORAN KOMPREHENSIF
            </h2>
            <div className="w-10" />
          </div>

          {/* Tombol Export dan Print */}
          <div className="flex justify-between mb-4 rounded-full overflow-hidden border border-gray-200">
            <button
              onClick={handleExportExcel}
              disabled={isExporting || isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={18} />
              )}
              Export Excel
            </button>
            <button
              onClick={handlePrint}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 font-semibold hover:bg-[#a8d5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={18} /> Print
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-left">
              {error}
            </div>
          )}

          {/* Filter */}
          <div className="text-left space-y-3 mt-4">
            {/* Unit */}
            <div>
              <label className="text-sm font-medium">Unit</label>
              <div className="relative mt-1">
                {userRole === "akuntan_unit" && userUnitName ? (
                  <div className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-100 cursor-not-allowed">
                    {userUnitName} (Unit Anda)
                  </div>
                ) : (
                  <>
                    <select
                      value={filters.id_unit || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "id_unit",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                    >
                      <option value="">Akumulasi (Semua Unit)</option>
                      {units.map((unit) => (
                        <option key={unit.id_unit} value={unit.id_unit}>
                          {unit.nama_unit}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                  </>
                )}
              </div>
            </div>

            {/* Divisi */}
            <div>
              <label className="text-sm font-medium">Divisi</label>
              <div className="relative mt-1">
                <select
                  value={filters.id_divisi || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "id_divisi",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                >
                  <option value="">Akumulasi (Semua Divisi)</option>
                  {divisis.map((divisi) => (
                    <option key={divisi.id_divisi} value={divisi.id_divisi}>
                      {divisi.nama_divisi}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Dari Tanggal */}
            <div>
              <label className="text-sm font-medium">Dari Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={filters.tanggal_mulai}
                  onChange={(e) =>
                    handleFilterChange("tanggal_mulai", e.target.value)
                  }
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                />

              </div>
            </div>

            {/* Sampai Tanggal */}
            <div>
              <label className="text-sm font-medium">Sampai Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={filters.tanggal_selesai}
                  onChange={(e) =>
                    handleFilterChange("tanggal_selesai", e.target.value)
                  }
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

        {/* Loading State */}
        {isLoading && (
          <div className="w-full mt-6 text-center py-8">
            <Loader2 size={32} className="animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        )}

        {/* Render Data Laporan */}
        {!isLoading && laporanData && (
          <div className="w-full mt-6">
            {/* Pendapatan */}
            {renderAkunSection(
              "Penerimaan dan Sumbangan",
              laporanData.data.pendapatan_all,
              "bg-[#7CA6FF]"
            )}

            {/* Total Pendapatan */}
            {laporanData.data.summary && (
              <div className="w-full mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-4 text-sm font-semibold">
                  <span className="col-span-1">Total Pendapatan</span>
                  <span className="text-right">
                    {formatCurrency(laporanData.data.summary.total_pendapatan)}
                  </span>
                  <span className="text-right">
                    {formatCurrency(
                      laporanData.data.summary.total_pendapatan_terikat
                    )}
                  </span>
                  <span className="text-right">
                    {formatCurrency(
                      laporanData.data.summary.total_pendapatan_all
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Beban */}
            {renderAkunSection(
              "Beban",
              laporanData.data.beban_all,
              "bg-[#FF7C7C]"
            )}

            {/* Total Beban */}
            {laporanData.data.summary && (
              <div className="w-full mt-4 bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-4 text-sm font-semibold">
                  <span className="col-span-1">Total Beban</span>
                  <span className="text-right">
                    {formatCurrency(laporanData.data.summary.total_beban)}
                  </span>
                  <span className="text-right">
                    {formatCurrency(
                      laporanData.data.summary.total_beban_terikat
                    )}
                  </span>
                  <span className="text-right">
                    {formatCurrency(laporanData.data.summary.total_beban_all)}
                  </span>
                </div>
              </div>
            )}

            {/* Kenaikan/Penurunan Penghasilan Komprehensif */}
            {laporanData.data.summary && (
              <div className="w-full mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-bold text-center">
                  <div className="mb-2 text-gray-700">
                    KENAIKAN (PENURUNAN) PENGHASILAN KOMPREHENSIF
                  </div>
                  <div
                    className={`text-lg ${laporanData.data.summary
                      .kenaikan_penghasilan_komprehensif >= 0
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    Rp{" "}
                    {formatCurrency(
                      laporanData.data.summary.kenaikan_penghasilan_komprehensif
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && !laporanData && (
          <div className="w-full mt-6 text-center py-8">
            <p className="text-gray-500">
              Tidak ada data. Klik Refresh untuk memuat data.
            </p>
          </div>
        )}

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      {/* Navbar bawah */}
      <NavbarBottom />
    </div>
  );
}