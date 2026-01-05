"use client";

import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import SuccessAlert from "@/components/SuccessAlert";
import { useEffect, useState, useRef } from "react";
import { Calendar, Search, RefreshCcw, Printer, FileSpreadsheet, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import CustomCalendar from "@/components/CustomCalendar";
import { useRouter } from "next/navigation";

interface UnitOption {
  id_unit: number;
  kode_unit: string;
  unit: string;
}

interface DivisiOption {
  id_divisi: number;
  divisi: string;
}

export default function JurnalUmum() {
  const router = useRouter();
  const [unit, setUnit] = useState("");
  const [divisi, setDivisi] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  const [data, setData] = useState<any>(null);
  const [hasUnposted, setHasUnposted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postingLoading, setPostingLoading] = useState(false);

  // Dropdown options from API
  const [unitList, setUnitList] = useState<UnitOption[]>([]);
  const [divisiList, setDivisiList] = useState<DivisiOption[]>([]);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJurnalId, setSelectedJurnalId] = useState<number | null>(null);
  const [confirmType, setConfirmType] = useState<"single" | "all" | "delete">("single");

  // Action menu state
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Success alert state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // User role state
  const [userRole, setUserRole] = useState<string>("");


  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("user_role") || "";
    setUserRole(role);

    const fetchDropdownData = async () => {
    };

    fetchDropdownData();
  }, []); // Empty dependency array to run once on mount

  const fetchJurnal = async (paginationUrl?: string) => {
    try {
      setLoading(true);

      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum`;

      let url = paginationUrl;
      if (!paginationUrl) {
        // Build query params, only include non-empty values
        const params = new URLSearchParams();
        if (unit) params.append('unit', unit);
        if (divisi) params.append('divisi', divisi);
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
        if (search) params.append('search', search);

        url = `${baseUrl}?${params.toString()}`;
      }

      const res = await fetch(url!, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      // Handle 401 Unauthenticated
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_unit_id");
        localStorage.removeItem("user_unit_name");
        alert("Sesi sudah habis, silahkan login ulang");
        window.location.href = "/login";
        return;
      }

      const json = await res.json();

      setData(json.data);
      setHasUnposted(json.has_unposted || false);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSingle = async (id: number) => {
    try {
      setPostingLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buku-besar/posting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ id_jurnal_umum: id }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage("BERHASIL POSTING KE BUKU BESAR");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        fetchJurnal();
      } else {
        alert(json.message || "Gagal memposting jurnal");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memposting jurnal");
    } finally {
      setPostingLoading(false);
      setShowConfirmModal(false);
      setSelectedJurnalId(null);
    }
  };

  const handlePostAll = async () => {
    try {
      setPostingLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buku-besar/posting-semua`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          start_date: fromDate || null,
          end_date: toDate || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage(`${json.data.total_posted} JURNAL BERHASIL DIPOSTING`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        fetchJurnal();
      } else {
        alert(json.message || "Gagal memposting jurnal");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memposting jurnal");
    } finally {
      setPostingLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setPostingLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      const json = await res.json();

      if (json.success) {
        alert("Jurnal berhasil dihapus!");
        fetchJurnal();
      } else {
        alert(json.error || json.message || "Gagal menghapus jurnal");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus jurnal");
    } finally {
      setPostingLoading(false);
      setShowConfirmModal(false);
      setSelectedJurnalId(null);
    }
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleEdit = (id: number) => {
    setOpenMenuId(null);
    router.push(`/pencatatan/jurnal/edit_jurnal?id=${id}`);
  };

  const openConfirmDelete = (id: number) => {
    setOpenMenuId(null);
    setSelectedJurnalId(id);
    setConfirmType("delete");
    setShowConfirmModal(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openConfirmSingle = (id: number) => {
    setSelectedJurnalId(id);
    setConfirmType("single");
    setShowConfirmModal(true);
  };

  const openConfirmAll = () => {
    setConfirmType("all");
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmType === "single" && selectedJurnalId) {
      handlePostSingle(selectedJurnalId);
    } else if (confirmType === "all") {
      handlePostAll();
    } else if (confirmType === "delete" && selectedJurnalId) {
      handleDelete(selectedJurnalId);
    }
  };

  // EXPORT DATA (Excel & Print)
  const fetchExportData = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum/export` +
      `?unit=${unit}&divisi=${divisi}&from=${fromDate}&to=${toDate}&search=${search}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    const json = await res.json();
    return json.data;
  };

  const handleExportExcel = async () => {
    try {
      const rows = await fetchExportData();
      if (!rows?.length) {
        alert("Tidak ada data untuk diexport. Coba reset filter atau perluas rentang tanggal.");
        return;
      }

      // Import xlsx-js-style dynamically for styling support
      const XLSX = await import("xlsx-js-style");

      // Prepare data for export - matching the expected format
      const exportData = rows.map((item: any) => {
        // Get debit and kredit accounts from detail_jurnal_umum
        const debitDetail = item.detail_jurnal_umum?.find((d: any) => d.debit_kredit === 'debit');
        const kreditDetail = item.detail_jurnal_umum?.find((d: any) => d.debit_kredit === 'kredit');
        const nominal = debitDetail?.nominal || kreditDetail?.nominal || 0;

        return {
          "Tanggal": item.tanggal,
          "Keterangan": item.keterangan,
          "Jenis Transaksi": item.jenis_transaksi,
          "Unit": item.unit?.unit || "-",
          "Divisi": item.divisi?.divisi || "-",
          "Kegiatan": item.kegiatan ? `${item.kegiatan.kode_kegiatan} ${item.kegiatan.kegiatan}` : "-",
          "Sumber Anggaran": item.sumber_anggaran ? `${item.sumber_anggaran.kode_akun} ${item.sumber_anggaran.akun}` : "-",
          "Kode Sumbangan": item.kode_sumbangan || "-",
          "Kode PH": item.kode_ph || "-",
          "Akun Debit": debitDetail?.akun ? `${debitDetail.akun.kode_akun} ${debitDetail.akun.akun}` : "-",
          "Akun Kredit": kreditDetail?.akun ? `${kreditDetail.akun.kode_akun} ${kreditDetail.akun.akun}` : "-",
          "Nominal": nominal,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 },  // Tanggal
        { wch: 20 },  // Keterangan
        { wch: 14 },  // Jenis Transaksi
        { wch: 10 },  // Unit
        { wch: 12 },  // Divisi
        { wch: 25 },  // Kegiatan
        { wch: 22 },  // Sumber Anggaran
        { wch: 15 },  // Kode Sumbangan
        { wch: 10 },  // Kode PH
        { wch: 22 },  // Akun Debit
        { wch: 22 },  // Akun Kredit
        { wch: 14 },  // Nominal
      ];

      // Style header row (row 1) with green background
      const headerStyle = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: "C6EFCE" } // Light green like Excel
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
      const headers = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1", "K1", "L1"];
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Jurnal Umum");

      // Generate filename with date
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Jurnal_Umum_${today}.xlsx`);

    } catch (err) {
      console.error("Export error:", err);
      alert("Gagal mengambil data export");
    }
  };

  const handlePrint = async () => {
    try {
      const rows = await fetchExportData();
      if (!rows?.length) {
        alert("Tidak ada data untuk dicetak");
        return;
      }
      console.log("PRINT DATA:", rows);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data print");
    }
  };

  // LOAD AWAL
  useEffect(() => {
    fetchDropdownOptions();
    fetchJurnal(); // Initial fetch
  }, []);

  // Auto-fetch when filters change
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip the initial mount (already fetched above)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    fetchJurnal();
  }, [unit, divisi, fromDate, toDate]);

  // Fetch Unit and Divisi options
  const fetchDropdownOptions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/input-transaksi/form-data`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
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

  // Handle reset filters
  const handleReset = () => {
    setSearch("");
    setUnit("");
    setDivisi("");
    setFromDate("");
    setToDate("");
  };

  // Loading state - show spinner
  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#004CDF] mx-auto mb-3" />
            <p className="text-gray-600">Memuat data jurnal...</p>
          </div>
        </div>
        <NavbarBottom />
      </div>
    );
  }

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
            margin: 0.5cm;
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
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          
          .print-header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .print-header p {
            font-size: 11px;
            color: #333;
          }
          
          /* Table styles for print */
          table {
            width: 100% !important;
            min-width: unset !important;
            border-collapse: collapse;
            font-size: 7px;
            table-layout: fixed;
          }
          
          th, td {
            border: 1px solid #000 !important;
            padding: 2px 3px !important;
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

      <div className="min-h-screen bg-gray-100 pb-20">

        <Navbar />

        <main className="w-full px-4 py-6 md:px-6 lg:px-10 min-w-0">
          <div className="bg-white shadow-md rounded-xl p-5 w-full mb-6 overflow-hidden min-w-0 flex flex-col">
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
                JURNAL UMUM
              </h1>
              <div className="w-10 h-10" />
            </div>


            {/* Tombol Export & Print */}
            <div className="flex gap-2 mb-5 no-print">
              <button
                onClick={handleExportExcel}
                disabled={loading || !(data?.data?.length > 0)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Excel
              </button>

              <button
                onClick={() => window.print()}
                disabled={loading || !(data?.data?.length > 0)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-medium py-2 rounded-full hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>


            {/* Filter - hidden when printing */}
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

              {/* Dari tanggal */}
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

              {/* Sampai tanggal */}
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

              {/* SEARCH */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Apa yang ingin anda cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700"
                />

                <button
                  className="bg-blue-100 p-2 rounded-full"
                  onClick={() => fetchJurnal()}
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

            {/* =============================== */}
            {/*              TABEL              */}
            {/* =============================== */}
            <div className="mt-6 w-full min-w-0 print-area">
              {/* Print Header - only visible when printing */}
              <div className="print-header">
                <h1>LAPORAN JURNAL UMUM</h1>
                <p>Yayasan Darussalam Batam</p>
                <p style={{ marginTop: '10px' }}>
                  Periode: {fromDate || 'Awal'} s/d {toDate || 'Hari ini'}
                </p>
              </div>

              {/* Header dengan tombol posting - FIXED, tidak ikut scroll */}
              <div className="flex items-center justify-between mb-2 no-print">
                <span className="text-xs text-gray-500">Data Jurnal Umum</span>
                {hasUnposted && userRole !== "auditor" && (
                  <button
                    onClick={openConfirmAll}
                    disabled={postingLoading}
                    className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {postingLoading ? "Memproses..." : "Posting Semua"}
                  </button>
                )}
              </div>

              {/* Table Container - HANYA INI yang scroll */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-[1400px] w-full text-sm text-gray-700">
                  <thead>
                    <tr className="border-b border-blue-300 text-gray-700 text-xs">
                      <th className="py-2 px-2 text-center whitespace-nowrap" style={{ minWidth: '40px' }}>Aksi</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '50px' }}>Status</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>Tgl</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '90px' }}>No. Bukti</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '150px' }}>Keterangan</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>Jenis</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '80px' }}>Unit</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>Divisi</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '150px' }}>Kegiatan</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '130px' }}>Sumber Anggaran</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '110px' }}>Kd Sumbangan</th>
                      <th className="py-2 px-2 text-left whitespace-nowrap" style={{ minWidth: '80px' }}>Kd P&H</th>
                      <th className="py-2 px-2 text-right whitespace-nowrap" style={{ minWidth: '120px' }}>Akun Debit (Rp)</th>
                      <th className="py-2 px-2 text-right whitespace-nowrap" style={{ minWidth: '120px' }}>Akun Kredit (Rp)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={14} className="text-center py-4 text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : !data || data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center py-4 text-gray-400 text-xs">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      <>
                        {data?.data?.map((item: any, index: number) => (
                          <tr key={index} className="border-b last:border-none hover:bg-gray-50">
                            {/* Action Menu - Hidden for auditor */}
                            <td className="py-2 px-2 text-center relative">
                              {userRole !== "auditor" ? (
                                <div ref={openMenuId === item.id_jurnal_umum ? menuRef : null}>
                                  <button
                                    onClick={() => toggleMenu(item.id_jurnal_umum)}
                                    className="p-1 rounded-full hover:bg-gray-200 transition"
                                    title="Menu Aksi"
                                  >
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                  </button>

                                  {/* Dropdown Menu */}
                                  {openMenuId === item.id_jurnal_umum && (
                                    <div className="absolute left-8 top-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                                      <button
                                        onClick={() => handleEdit(item.id_jurnal_umum)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => openConfirmDelete(item.id_jurnal_umum)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                            {/* Status Posting */}
                            <td className="py-2 px-2">
                              {item.is_posted ? (
                                <span
                                  className="inline-block w-3 h-3 rounded-full bg-green-500"
                                  title="Sudah diposting"
                                />
                              ) : userRole !== "auditor" ? (
                                <button
                                  onClick={() => openConfirmSingle(item.id_jurnal_umum)}
                                  disabled={postingLoading}
                                  className="inline-block w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer animate-pulse disabled:opacity-50"
                                  title="Klik untuk posting ke Buku Besar"
                                />
                              ) : (
                                <span
                                  className="inline-block w-3 h-3 rounded-full bg-red-500"
                                  title="Belum diposting"
                                />
                              )}
                            </td>
                            <td className="py-2 px-2 whitespace-nowrap">{item.tanggal}</td>
                            <td className="py-2 px-2 whitespace-nowrap">{item.no_bukti}</td>
                            <td className="py-2 px-2">{item.keterangan}</td>
                            <td className="py-2 px-2 whitespace-nowrap">{item.jenis_transaksi || "-"}</td>
                            <td className="py-2 px-2 whitespace-nowrap">{item.unit?.unit || "-"}</td>
                            <td className="py-2 px-2 whitespace-nowrap">{item.divisi?.divisi || "-"}</td>
                            <td className="py-2 px-2">{item.kegiatan?.kegiatan || "-"}</td>
                            <td className="py-2 px-2">{item.sumber_anggaran?.akun || "-"}</td>
                            <td className="py-2 px-2 whitespace-nowrap">{item.kode_sumbangan || "-"}</td>
                            <td className="py-2 px-2 whitespace-nowrap">{item.kode_ph || "-"}</td>
                            <td className="py-2 px-2 text-right whitespace-nowrap">
                              {(() => {
                                const debitItem = item.detail_jurnal_umum?.find((d: any) => d.debit_kredit === 'debit');
                                if (debitItem) {
                                  const akunName = debitItem.akun ? `${debitItem.akun.kode_akun} ${debitItem.akun.akun}` : '';
                                  const nominal = debitItem.nominal?.toLocaleString("id-ID") || "0";
                                  return (
                                    <div>
                                      <div className="text-xs text-gray-500 truncate max-w-[150px]" title={akunName}>{akunName}</div>
                                      <div className="font-medium">{nominal}</div>
                                    </div>
                                  );
                                }
                                return item.total_debit?.toLocaleString("id-ID") || "0";
                              })()}
                            </td>
                            <td className="py-2 px-2 text-right whitespace-nowrap">
                              {(() => {
                                const kreditItem = item.detail_jurnal_umum?.find((d: any) => d.debit_kredit === 'kredit');
                                if (kreditItem) {
                                  const akunName = kreditItem.akun ? `${kreditItem.akun.kode_akun} ${kreditItem.akun.akun}` : '';
                                  const nominal = kreditItem.nominal?.toLocaleString("id-ID") || "0";
                                  return (
                                    <div>
                                      <div className="text-xs text-gray-500 truncate max-w-[150px]" title={akunName}>{akunName}</div>
                                      <div className="font-medium">{nominal}</div>
                                    </div>
                                  );
                                }
                                return item.total_kredit?.toLocaleString("id-ID") || "0";
                              })()}
                            </td>
                          </tr>
                        ))}
                        {/* Total Row */}
                        <tr className="border-t-2 border-blue-300 font-semibold bg-gray-50">
                          <td colSpan={12} className="py-2 px-2 text-right">Total</td>
                          <td className="py-2 px-2 text-right whitespace-nowrap">
                            {data?.data?.reduce((sum: number, item: any) => sum + (item.total_debit || 0), 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-2 text-right whitespace-nowrap">
                            {data?.data?.reduce((sum: number, item: any) => sum + (item.total_kredit || 0), 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION - Outside scroll container */}
              <div className="flex justify-center mt-4 gap-3 text-sm">
                <button
                  disabled={!data?.prev_page_url}
                  onClick={() => fetchJurnal(data.prev_page_url)}
                  className="px-3 py-1 rounded-full border disabled:opacity-40"
                >
                  Prev
                </button>

                <button
                  disabled={!data?.next_page_url}
                  onClick={() => fetchJurnal(data.next_page_url)}
                  className="px-3 py-1 rounded-full border disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>

        {/* =============================== */}
        {/*       CONFIRMATION MODAL        */}
        {/* =============================== */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {confirmType === "delete" ? "Konfirmasi Hapus" : "Konfirmasi Posting"}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                {confirmType === "single"
                  ? "Apakah Anda yakin ingin memposting jurnal ini ke Buku Besar?"
                  : confirmType === "all"
                    ? "Apakah Anda yakin ingin memposting SEMUA jurnal yang belum diposting ke Buku Besar?"
                    : "Apakah Anda yakin ingin menghapus jurnal ini? Data yang dihapus tidak dapat dikembalikan."}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedJurnalId(null);
                  }}
                  disabled={postingLoading}
                  className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={postingLoading}
                  className={`px-6 py-2 rounded-full font-medium transition disabled:opacity-50 ${confirmType === "delete"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                >
                  {postingLoading ? "Memproses..." : confirmType === "delete" ? "Ya, Hapus" : "Ya, Posting"}
                </button>
              </div>
            </div>
          </div>
        )}

        <NavbarBottom />

        <SuccessAlert
          show={showSuccess}
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      </div>
    </>
  );
}
