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
  jenis_transaksi?: string;
  unit?: string;
  divisi?: string;
  kegiatan?: string;
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

interface UnitOption {
  id_unit: number;
  kode_unit: string;
  unit: string;
}

interface DivisiOption {
  id_divisi: number;
  divisi: string;
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
  const [akun, setAkun] = useState(""); // Will be set to Kas Tunai after fetching akun list
  const [fromDate, setFromDate] = useState(() => {
    // Default from start of current year
    const now = new Date();
    return `${now.getFullYear()}-01-01`;
  });
  const [toDate, setToDate] = useState(() => {
    // Default to today
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [search, setSearch] = useState("");
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const router = useRouter();

  // API Data States
  const [bukuBesarData, setBukuBesarData] = useState<BukuBesarItem[]>([]);
  const [akunList, setAkunList] = useState<AkunOption[]>([]);
  const [unitList, setUnitList] = useState<UnitOption[]>([]);
  const [divisiList, setDivisiList] = useState<DivisiOption[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedAkunInfo, setSelectedAkunInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAkunReady, setIsAkunReady] = useState(false);

  // Current page state
  const [currentPage, setCurrentPage] = useState(1);



  // ===== HELPER: Get Auth Token =====
  const getAuthToken = () => {
    // Sesuaikan dengan cara kamu menyimpan token (localStorage, cookies, etc)
    return localStorage.getItem("auth_token") || "";
  };

  // ===== FETCH AKUN LIST & DROPDOWN OPTIONS =====
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

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }

        if (!response.ok) throw new Error("Gagal mengambil daftar akun");

        const result = await response.json();
        if (result.success) {
          setAkunList(result.data);

          // Set default akun to "Kas Tunai" if exists
          const kasTunai = result.data.find((a: AkunOption) =>
            a.akun.toLowerCase().includes('kas tunai') ||
            a.akun.toLowerCase() === 'kas' ||
            a.akun.toLowerCase().includes('kas')
          );

          if (kasTunai) {
            setAkun(kasTunai.id_akun.toString());
          } else if (result.data.length > 0) {
            // Fallback to first akun if Kas Tunai not found
            setAkun(result.data[0].id_akun.toString());
          }

          setIsAkunReady(true);
        }
      } catch (err: any) {
        console.error("Error fetching akun list:", err);
        setError(err.message);
        setIsAkunReady(true); // Still mark as ready to prevent infinite loading
      }
    };

    const fetchDropdownOptions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/input-transaksi/form-data`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const json = await res.json();
        if (json.data) {
          setUnitList(json.data.unit || json.data.units || []);
          setDivisiList(json.data.divisi || json.data.divisis || []);
        }
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
      }
    };

    fetchAkunList();
    fetchDropdownOptions();
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

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        router.push("/login");
        return;
      }

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
    // Only fetch after akun list is ready and akun is set
    if (!isAkunReady || !akun) return;

    fetchBukuBesar(currentPage);
  }, [akun, fromDate, toDate, unit, divisi, currentPage, isAkunReady]);

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

    // Reset akun to Kas Tunai
    const kasTunai = akunList.find((a) =>
      a.akun.toLowerCase().includes('kas tunai') ||
      a.akun.toLowerCase() === 'kas' ||
      a.akun.toLowerCase().includes('kas')
    );
    setAkun(kasTunai ? kasTunai.id_akun.toString() : akunList[0]?.id_akun.toString() || "");

    // Reset dates to start of year and today
    const now = new Date();
    setFromDate(`${now.getFullYear()}-01-01`);
    setToDate(now.toISOString().split('T')[0]);

    setCurrentPage(1);
  };

  // ===== HANDLE EXPORT EXCEL =====
  const handleExportExcel = async () => {
    if (!bukuBesarData.length) {
      alert("Tidak ada data untuk diexport. Coba reset filter atau perluas rentang tanggal.");
      return;
    }

    try {
      // Import xlsx-js-style dynamically for styling support
      const XLSX = await import("xlsx-js-style");

      // Get selected akun info
      const selectedAkun = akunList.find(a => a.id_akun.toString() === akun);
      const akunName = selectedAkun ? `${selectedAkun.kode_akun} ${selectedAkun.akun}` : "Semua Akun";

      // Prepare data for export
      const exportData = bukuBesarData.map((item: BukuBesarItem) => ({
        "Tanggal": item.tanggal,
        "No. Bukti": item.no_bukti,
        "Keterangan": item.keterangan,
        "Jenis Transaksi": item.jenis_transaksi || "-",
        "Unit": item.unit || "-",
        "Divisi": item.divisi || "-",
        "Debit": item.debit_kredit === 'debit' ? item.nominal : 0,
        "Kredit": item.debit_kredit === 'kredit' ? item.nominal : 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 },  // Tanggal
        { wch: 12 },  // No. Bukti
        { wch: 30 },  // Keterangan
        { wch: 15 },  // Jenis Transaksi
        { wch: 12 },  // Unit
        { wch: 12 },  // Divisi
        { wch: 15 },  // Debit
        { wch: 15 },  // Kredit
      ];

      // Style header row (row 1) with green background
      const headerStyle = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: "C6EFCE" }
        },
        font: { bold: true, sz: 11, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Apply header style
      const headers = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1"];
      headers.forEach((cell) => {
        if (worksheet[cell]) {
          worksheet[cell].s = headerStyle;
        }
      });

      // Style data cells with borders
      const dataStyle = {
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
        alignment: { vertical: "center" },
      };

      // Apply border to all data cells
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let R = 1; R <= range.e.r; R++) {
        for (let C = 0; C <= range.e.c; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (worksheet[cellRef]) {
            worksheet[cellRef].s = dataStyle;
          }
        }
      }

      // Set row heights
      worksheet['!rows'] = [{ hpt: 25 }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Buku Besar");

      // Generate filename with akun name and date
      const today = new Date().toISOString().split('T')[0];
      const safeAkunName = akunName.replace(/[/\\?%*:|"<>]/g, '-');
      XLSX.writeFile(workbook, `Buku_Besar_${safeAkunName}_${today}.xlsx`);

    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal mengexport data");
    }
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
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-printable elements */
          .no-print {
            display: none !important;
          }
          
          /* Reset page margins */
          @page {
            margin: 1cm;
            size: landscape;
          }
          
          /* Make body white and visible */
          body, html {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Reset all backgrounds */
          * {
            background: transparent !important;
          }
          
          /* Main container should be visible */
          .min-h-screen {
            min-height: auto !important;
            padding: 0 !important;
          }
          
          main {
            padding: 0 !important;
          }
          
          /* Card container */
          .bg-white {
            background: white !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Show print area */
          .print-area {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Print header */
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          
          .print-header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .print-header p {
            font-size: 12px;
            color: #333;
          }
          
          /* Table styles for print */
          table {
            width: 100% !important;
            min-width: unset !important;
            border-collapse: collapse;
            font-size: 8px;
            table-layout: fixed;
          }
          
          th, td {
            border: 1px solid #000 !important;
            padding: 3px 4px !important;
            white-space: normal;
            word-wrap: break-word;
            overflow: hidden;
          }
          
          th {
            background-color: #e0e0e0 !important;
            font-weight: bold;
          }
          
          /* Remove shadows and rounded corners */
          .shadow-md, .rounded-xl, .rounded-lg {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          /* Hide overflow scrolling */
          .overflow-x-auto {
            overflow: visible !important;
          }
        }
        
        /* Hide print header in normal view */
        .print-header {
          display: none;
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 pb-24">
        <Navbar />

        {/* CARD */}
        <main className="w-full px-4 py-6 md:px-6 lg:px-10">
          <div className="bg-white shadow-md rounded-xl p-5 w-full mb-6">
            <div className="flex items-center gap-3 mb-6 no-print">
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


            {/* Tombol Export dan Print - hidden when printing */}
            <div className="flex gap-2 mb-5 no-print">
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

            {/* FILTER FORM - hidden when printing */}
            <div className="space-y-3 no-print">
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
                    {unitList.map((u) => (
                      <option key={u.id_unit} value={u.id_unit}>
                        {u.kode_unit} - {u.unit}
                      </option>
                    ))}
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
                    {divisiList.map((d) => (
                      <option key={d.id_divisi} value={d.id_divisi}>
                        {d.divisi}
                      </option>
                    ))}
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
                  title="Reset semua filter"
                >
                  <RefreshCcw className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm no-print">
                {error}
              </div>
            )}

            {/* LOADING STATE */}
            {loading && (
              <div className="flex justify-center items-center py-8 no-print">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}

            {/* INFO AKUN TERPILIH - hidden when printing */}
            {selectedAkunInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mt-6 no-print">
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
              <div className="mt-6 w-full min-w-0 print-area">
                {/* Print Header - only visible when printing */}
                <div className="print-header">
                  <h1>LAPORAN BUKU BESAR</h1>
                  <p>Yayasan Darussalam Batam</p>
                  {selectedAkunInfo && (
                    <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                      Akun: {selectedAkunInfo.kode_akun} - {selectedAkunInfo.akun}
                    </p>
                  )}
                  <p>Periode: {fromDate} s/d {toDate}</p>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-[1200px] w-full text-sm text-gray-700">
                    <thead>
                      <tr className="border-b border-blue-300 text-gray-700 text-xs">
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>Tanggal</th>
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '90px' }}>No. Bukti</th>
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '150px' }}>Keterangan</th>
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>Jenis</th>
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '80px' }}>Unit</th>
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>Divisi</th>
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '150px' }}>Kegiatan</th>
                        <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>Akun</th>
                        <th className="py-2 px-2 text-right whitespace-nowrap" style={{ minWidth: '120px' }}>Debit (Rp)</th>
                        <th className="py-2 px-2 text-right whitespace-nowrap" style={{ minWidth: '120px' }}>Kredit (Rp)</th>
                      </tr>
                    </thead>

                    <tbody>
                      {bukuBesarData.map((item, index) => (
                        <tr key={index} className="border-b last:border-none hover:bg-gray-50">
                          <td className="py-2 px-2 whitespace-nowrap">{item.tanggal}</td>
                          <td className="py-2 px-2 whitespace-nowrap">{item.no_bukti}</td>
                          <td className="py-2 px-2">{item.keterangan}</td>
                          <td className="py-2 px-2 whitespace-nowrap">{item.jenis_transaksi || "-"}</td>
                          <td className="py-2 px-2 whitespace-nowrap">{item.unit || "-"}</td>
                          <td className="py-2 px-2 whitespace-nowrap">{item.divisi || "-"}</td>
                          <td className="py-2 px-2">{item.kegiatan || "-"}</td>
                          <td className="py-2 px-2">{item.akun || "-"}</td>
                          <td className="py-2 px-2 text-right whitespace-nowrap text-blue-600 font-medium">
                            {item.debit_kredit === "debit" ? formatCurrency(item.nominal) : "-"}
                          </td>
                          <td className="py-2 px-2 text-right whitespace-nowrap text-red-600 font-medium">
                            {item.debit_kredit === "kredit" ? formatCurrency(item.nominal) : "-"}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="border-t-2 border-blue-300 font-semibold bg-gray-50">
                        <td colSpan={8} className="py-2 px-2 text-right">Total</td>
                        <td className="py-2 px-2 text-right whitespace-nowrap text-blue-600">
                          {formatCurrency(bukuBesarData.filter(i => i.debit_kredit === "debit").reduce((sum, i) => sum + i.nominal, 0))}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap text-red-600">
                          {formatCurrency(bukuBesarData.filter(i => i.debit_kredit === "kredit").reduce((sum, i) => sum + i.nominal, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {pagination && pagination.last_page > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 no-print">
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
        <footer className="text-center text-xs text-gray-500 mt-6 no-print">
          Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025
        </footer>
      </div>
    </>
  );
}