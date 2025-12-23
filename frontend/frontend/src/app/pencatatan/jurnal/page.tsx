"use client";

import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import { useEffect, useState } from "react";
import { Calendar, Search, RefreshCcw, Printer, FileSpreadsheet } from "lucide-react";
import CustomCalendar from "@/components/CustomCalendar";
import { useRouter } from "next/navigation";

export default function JurnalUmum() {
  const router = useRouter();
  const [unit, setUnit] = useState("Akumulasi (Semua Unit)");
  const [divisi, setDivisi] = useState("Akumulasi (Semua Divisi)");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  // ⬅ diubah: data sekarang object, bukan array
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ==========================
  // FETCH API
  // ==========================
  const fetchJurnal = async (paginationUrl?: string) => {
    try {
      setLoading(true);

      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum`;

      const url = paginationUrl
        ? paginationUrl // utk next/prev
        : `${baseUrl}?unit=${unit}&divisi=${divisi}&from=${fromDate}&to=${toDate}&search=${search}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      const json = await res.json();

      // ⬅ API mengembalikan { success: true, data: {...pagination} }
      setData(json.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
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
    return json.data; // ⬅ array langsung
  };
  
  const handleExportExcel = async () => {
    try {
      const rows = await fetchExportData();
      if (!rows?.length) {
        alert("Tidak ada data untuk diexport");
        return;
      }
      console.log("EXPORT EXCEL DATA:", rows);
      // lanjutkan ke XLSX
    } catch (err) {
      console.error(err);
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
      // lanjutkan ke layout print
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data print");
    }
  };

  // LOAD AWAL
  useEffect(() => {
    fetchJurnal();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      <Navbar />

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
              JURNAL UMUM
            </h1>
            <div className="w-10 h-10" />
          </div>

          {/* Tombol Export & Print */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={handleExportExcel}
              disabled={loading || !(data?.data?.length > 0)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !(data?.data?.length > 0)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-medium py-2 rounded-full hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>


          {/* Filter */}
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
                  <option>Akumulasi (Semua Unit)</option>
                  <option>TK</option>
                  <option>SD</option>
                  <option>SMP</option>
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
                  <option>Akumulasi (Semua Divisi)</option>
                  <option>Keuangan</option>
                  <option>Kesiswaan</option>
                  <option>Umum</option>
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
                onClick={() => {
                  setSearch("");
                  setUnit("Akumulasi (Semua Unit)");
                  setDivisi("Akumulasi (Semua Divisi)");
                  setFromDate("");
                  setToDate("");
                  fetchJurnal();
                }}
              >
                <RefreshCcw className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* =============================== */}
          {/*              TABEL              */}
          {/* =============================== */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead>
                <tr className="border-b border-blue-300 text-gray-700 text-xs">
                  <th className="py-2 text-left">Tgl</th>
                  <th className="py-2 text-left">No. Bukti</th>
                  <th className="py-2 text-left">Keterangan</th>
                  <th className="py-2 text-left">Unit</th>
                  <th className="py-2 text-left">Divisi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : !data || data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400 text-xs">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((item: any, index: number) => (
                    <tr key={index} className="border-b last:border-none">
                      <td className="py-2">{item.tanggal}</td>
                      <td>{item.no_bukti}</td>
                      <td>{item.keterangan}</td>
                      <td>{item.unit?.nama_unit || "-"}</td>
                      <td>{item.divisi?.nama_divisi || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
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

      <NavbarBottom />
    </div>
  );
}
