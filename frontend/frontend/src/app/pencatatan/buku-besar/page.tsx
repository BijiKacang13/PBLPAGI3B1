"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { Calendar, Search, RefreshCcw, Printer, FileSpreadsheet, Loader2 } from "lucide-react";
import CustomCalendar from "@/components/CustomCalendar";
import NavbarBottom from "@/components/NavbarBottom";
import { useRouter } from "next/navigation";

// ===== TYPE DEFINITIONS =====
interface BukuBesarItem {
  tanggal: string;
  no_bukti: string;
  keterangan: string;
  unit?: string;
  divisi?: string;
  debit_kredit: 'debit' | 'kredit';
  nominal: number;
  akun?: string;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface AkunOption {
  id_akun: number;
  kode_akun: string;
  akun: string;
  kategori: string | null;
  sub_kategori: string | null;
}

interface BukuBesarResponse {
  success: boolean;
  message: string;
  data: {
    items: BukuBesarItem[];
    pagination: PaginationInfo;
    filters: any;
    akun: {
      id_akun: number;
      kode_akun: string;
      akun: string;
      kategori: string | null;
    } | null;
  };
}

export default function BukuBesar() {
  // ===== STATE MANAGEMENT =====
  const [unit, setUnit] = useState("");
  const [divisi, setDivisi] = useState("");
  const [akun, setAkun] = useState("1"); // Default akun_id = 1
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const router = useRouter();

  // API Data States
  const [bukuBesarData, setBukuBesarData] = useState<BukuBesarItem[]>([]);
  const [akunList, setAkunList] = useState<AkunOption[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedAkunInfo, setSelectedAkunInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current page state
  const [currentPage, setCurrentPage] = useState(1);

  

  // ===== HELPER: Get Auth Token =====
  const getAuthToken = () => {
    // Sesuaikan dengan cara kamu menyimpan token (localStorage, cookies, etc)
    return localStorage.getItem("auth_token") || "";
  };

  // ===== FETCH AKUN LIST (Dropdown Options) =====
  useEffect(() => {
    const fetchAkunList = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buku-besar/akun-list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil daftar akun");

        const result = await response.json();
        if (result.success) {
          setAkunList(result.data);
        }
      } catch (err: any) {
        console.error("Error fetching akun list:", err);
        setError(err.message);
      }
    };

    fetchAkunList();
  }, []);

  // ===== FETCH BUKU BESAR DATA =====
  const fetchBukuBesar = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (akun) params.append("akun", akun);
      if (fromDate) params.append("start_date", fromDate);
      if (toDate) params.append("end_date", toDate);
      if (unit) params.append("id_unit", unit);
      if (divisi) params.append("id_divisi", divisi);
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("per_page", "20");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buku-besar?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data buku besar");

      const result: BukuBesarResponse = await response.json();

      if (result.success) {
        setBukuBesarData(result.data.items);
        setPagination(result.data.pagination);
        setSelectedAkunInfo(result.data.akun);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error("Error fetching buku besar:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== INITIAL FETCH & REFETCH ON FILTER CHANGE =====
  useEffect(() => {
    fetchBukuBesar(currentPage);
  }, [akun, fromDate, toDate, unit, divisi, currentPage]);

  // ===== HANDLE SEARCH BUTTON =====
  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1
    fetchBukuBesar(1);
  };

  // ===== HANDLE RESET FILTERS =====
  const handleReset = () => {
    setSearch("");
    setUnit("");
    setDivisi("");
    setAkun("1");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // ===== HANDLE EXPORT EXCEL =====
  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (akun) params.append("akun", akun);
    if (fromDate) params.append("start_date", fromDate);
    if (toDate) params.append("end_date", toDate);
    if (unit) params.append("id_unit", unit);
    if (divisi) params.append("id_divisi", divisi);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/buku-besar/export?${params.toString()}`;
    
    // Open in new tab to download
    window.open(url, "_blank");
  };

  // ===== HANDLE PRINT =====
  const handlePrint = () => {
    window.print();
  };

  // ===== FORMAT CURRENCY =====
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar />

      {/* CARD */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm md:max-w-full mb-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 className="flex-1 text-lg md:text-lg font-bold text-gray-800 text-center sm:text-start">
              BUKU BESAR
            </h1>
            <div className="w-10 h-10" />
          </div>


          {/* Tombol Export dan Print */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={handleExportExcel}
              disabled={loading || !bukuBesarData.length}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || !bukuBesarData.length}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-medium py-2 rounded-full hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>

          {/* FILTER FORM */}
          <div className="space-y-3">
            {/* Unit */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Unit</label>
              <div className="relative">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white appearance-none"
                >
                  <option value="">Akumulasi (Semua Unit)</option>
                  {/* TODO: Fetch dari API jika ada endpoint untuk list unit */}
                  <option value="1">TK</option>
                  <option value="2">SD</option>
                  <option value="3">SMP</option>
                </select>
                <span className="absolute right-4 top-2.5 text-gray-400">▼</span>
              </div>
            </div>

            {/* Divisi */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Divisi</label>
              <div className="relative">
                <select
                  value={divisi}
                  onChange={(e) => setDivisi(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white appearance-none"
                >
                  <option value="">Akumulasi (Semua Divisi)</option>
                  {/* TODO: Fetch dari API jika ada endpoint untuk list divisi */}
                  <option value="1">Keuangan</option>
                  <option value="2">Kesiswaan</option>
                  <option value="3">Umum</option>
                </select>
                <span className="absolute right-4 top-2.5 text-gray-400">▼</span>
              </div>
            </div>

            {/* Akun */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Akun</label>
              <div className="relative">
                <select
                  value={akun}
                  onChange={(e) => setAkun(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white appearance-none"
                >
                  <option value="">Pilih Akun</option>
                  {akunList.map((item) => (
                    <option key={item.id_akun} value={item.id_akun}>
                      {item.kode_akun} - {item.akun}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-2.5 text-gray-400">▼</span>
              </div>
            </div>

            {/* Dari Tanggal */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dari Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700"
                />
                <button
                  onClick={() => {
                    setShowFromCalendar(!showFromCalendar);
                    setShowToCalendar(false);
                  }}
                  className="absolute right-4 top-2.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                </button>
                {showFromCalendar && (
                  <CustomCalendar
                    selectedDate={fromDate}
                    onSelectDate={setFromDate}
                    onClose={() => setShowFromCalendar(false)}
                  />
                )}
              </div>
            </div>

            {/* Sampai Tanggal */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sampai Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700"
                />
                <button
                  onClick={() => {
                    setShowToCalendar(!showToCalendar);
                    setShowFromCalendar(false);
                  }}
                  className="absolute right-4 top-2.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                </button>
                {showToCalendar && (
                  <CustomCalendar
                    selectedDate={toDate}
                    onSelectDate={setToDate}
                    onClose={() => setShowToCalendar(false)}
                  />
                )}
              </div>
            </div>

            {/* Pencarian */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Apa yang ingin anda cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 disabled:opacity-50"
              >
                <Search className="w-4 h-4 text-blue-600" />
              </button>
              <button
                className="bg-blue-500 p-2 rounded-full hover:bg-blue-600"
                onClick={handleReset}
              >
                <RefreshCcw className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          {/* INFO AKUN TERPILIH */}
          {selectedAkunInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mt-6">
              <p className="text-sm font-medium text-blue-900">
                {selectedAkunInfo.kode_akun} - {selectedAkunInfo.akun}
              </p>
              {selectedAkunInfo.kategori && (
                <p className="text-xs text-blue-700 mt-1">Kategori: {selectedAkunInfo.kategori}</p>
              )}
            </div>
          )}

          {/* TABEL */}
          {!loading && bukuBesarData.length > 0 && (
            <div className="mt-6">
              {/* Header Tabel - Desktop */}
              <div className="hidden md:grid md:grid-cols-7 text-sm font-semibold border-b-2 border-blue-300 pb-2 text-gray-700 gap-2">
                <span>Tanggal</span>
                <span>No. Bukti</span>
                <span className="col-span-2">Keterangan</span>
                <span>Unit</span>
                <span className="text-right">Debit</span>
                <span className="text-right">Kredit</span>
              </div>

              {/* Header Tabel - Mobile */}
              <div className="md:hidden flex justify-between text-sm font-semibold border-b border-blue-300 pb-1 text-gray-700">
                <span>Tgl</span>
                <span>No. Bukti</span>
                <span>Keterangan</span>
              </div>

              {/* Data Rows - Desktop */}
              <div className="hidden md:block text-sm text-gray-700 mt-2 space-y-2">
                {bukuBesarData.map((item, index) => (
                  <div key={index} className="grid grid-cols-7 gap-2 py-2 border-b border-gray-100 hover:bg-gray-50">
                    <span className="text-xs">{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                    <span className="text-xs">{item.no_bukti}</span>
                    <span className="col-span-2 text-xs">{item.keterangan}</span>
                    <span className="text-xs">{item.unit || "-"}</span>
                    <span className="text-right text-xs font-medium text-blue-600">
                      {item.debit_kredit === "debit" ? formatCurrency(item.nominal) : "-"}
                    </span>
                    <span className="text-right text-xs font-medium text-red-600">
                      {item.debit_kredit === "kredit" ? formatCurrency(item.nominal) : "-"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Data Rows - Mobile */}
              <div className="md:hidden text-sm text-gray-700 mt-2 space-y-2">
                {bukuBesarData.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                      <span className="text-xs font-medium">{item.no_bukti}</span>
                    </div>
                    <p className="text-xs mb-1">{item.keterangan}</p>
                    <div className="flex justify-between text-xs">
                      <span className={item.debit_kredit === "debit" ? "text-blue-600 font-medium" : "text-gray-400"}>
                        D: {item.debit_kredit === "debit" ? formatCurrency(item.nominal) : "-"}
                      </span>
                      <span className={item.debit_kredit === "kredit" ? "text-red-600 font-medium" : "text-gray-400"}>
                        K: {item.debit_kredit === "kredit" ? formatCurrency(item.nominal) : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Halaman {currentPage} dari {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.last_page))}
                    disabled={currentPage === pagination.last_page}
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NO DATA */}
          {!loading && bukuBesarData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Tidak ada data untuk ditampilkan</p>
              <p className="text-xs mt-1">Silakan pilih akun dan tanggal untuk melihat data</p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-gray-500 mt-6">
        Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025
      </footer>
    </div>
  );
}