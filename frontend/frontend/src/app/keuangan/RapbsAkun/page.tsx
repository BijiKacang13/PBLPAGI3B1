"use client";

import Navbar from "@/components/Navbar";
import { api } from "@/lib/api/axiosClient";
import { ArrowLeft, Pencil, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import NavbarBottom from "@/components/NavbarBottom";
import EditRapbsAkun from "@/components/EditRapbsAkun";

type RapbsAkun = {
  id_akun: number;
  kode_akun: string;
  akun: string;
  budget: number;
};

export default function RapbsAkunPage() {
  const [data, setData] = useState<RapbsAkun[]>([]);
  const [selected, setSelected] = useState<RapbsAkun | null>(null);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  // Modals
  const [openEdit, setOpenEdit] = useState(false);

  // Import Excel
  const [fileName, setFileName] = useState("Tidak ada file");
  const [file, setFile] = useState<File | null>(null);

  // ======================
  // FETCH DATA
  // ======================
  const fetchRapbsAkun = async () => {
    try {
      const res = await api.get("/budget-rapbs-akun");

      // res sudah langsung data array karena interceptor otomatis response.data
      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

      const mapped = arr.map((x: any) => ({
        id_akun: Number(x.id_akun),
        kode_akun: x.kode_akun ?? "",
        akun: x.akun ?? "",
        budget: Number(x.budget_rapbs) || 0,
      }));

      setData(mapped);
    } catch (err: any) {
      console.error("Gagal fetch RAPBS akun:", err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchRapbsAkun();
  }, []);

  // ======================
  // IMPORT EXCEL
  // ======================
  const handleImportExcel = async () => {
    if (!file) {
      alert("Pilih file terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/budget-rapbs-akun/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Import berhasil");
      fetchRapbsAkun();
      setFile(null);
      setFileName("Tidak ada file");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal import");
    }
  };

  // ======================
  // SEARCH & PAGINATION
  // ======================
  const filtered = data.filter(
    (x) =>
      x.kode_akun.toLowerCase().includes(search.toLowerCase()) ||
      x.akun.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      <div className="mt-4 w-[90%] max-w-md mx-auto bg-white rounded-2xl shadow-md p-5">
        {/* TITLE */}
        <div className="flex items-center mb-4">
          <Link href="/keuangan">
            <ArrowLeft className="text-gray-700 w-5 h-5" />
          </Link>
          <h2 className="flex-1 text-center font-semibold text-gray-800">
            BUDGET RAPBS PER AKUN
          </h2>
        </div>

        {/* DOWNLOAD TEMPLATE */}
        <a
          href="#"
          className="text-blue-600 text-sm font-semibold underline block text-center mb-3"
        >
          Download Template Import RAPBS per-Akun
        </a>

        {/* IMPORT */}
        <div className="flex items-center gap-2 mb-4">
          <label
            htmlFor="fileUpload"
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-300 transition"
          >
            Pilih File
          </label>

          <input
            id="fileUpload"
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              setFileName(f?.name || "Tidak ada file");
            }}
          />

          <input
            type="text"
            value={fileName}
            readOnly
            className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-xs text-gray-500 outline-none bg-gray-50"
          />

          <button
            onClick={handleImportExcel}
            className="bg-blue-500 text-white px-3 py-2 rounded-full text-xs font-semibold hover:bg-blue-600 transition"
          >
            Import
          </button>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Cari akun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-full px-4 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* LIMIT DROPDOWN */}
        <div className="relative text-sm mb-3">
          <label className="block text-gray-700 mb-1">Tampilkan Data per Halaman</label>

          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-32 border border-gray-300 bg-white rounded-xl px-4 py-2 flex justify-between cursor-pointer shadow-sm"
          >
            <span>{limit}</span>
            <ChevronDown className={`w-4 h-4 transition ${showDropdown ? "rotate-180" : ""}`} />
          </div>

          {showDropdown && (
            <div className="absolute w-32 bg-white border rounded-xl shadow-xl mt-2 py-2 z-10">
              {[2, 5, 10].map((value) => (
                <div
                  key={value}
                  onClick={() => {
                    setLimit(value);
                    setPage(1);
                    setShowDropdown(false);
                  }}
                  className={`px-4 py-2 cursor-pointer ${
                    limit === value ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50"
                  }`}
                >
                  {value} Data
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-gray-700 min-w-[600px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left w-1/6">Kode</th>
                <th className="px-4 py-2 text-left w-1/4">Akun</th>
                <th className="px-4 py-2 text-right w-1/4">Budget RAPBS</th>
                <th className="px-4 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id_akun} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-600">{item.kode_akun}</td>
                  <td className="px-4 py-2">{item.akun}</td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(item.budget)}
                  </td>
                  <td className="px-4 py-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelected(item);
                        setOpenEdit(true);
                      }}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded-lg text-sm ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Sebelumnya
          </button>

          <span className="text-gray-700 text-sm font-semibold">
            Page {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-lg text-sm ${
              page === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Selanjutnya
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>
      <NavbarBottom />

      {/* MODAL EDIT */}
      <EditRapbsAkun
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchRapbsAkun}
        data={selected}
      />
    </div>
  );
}
