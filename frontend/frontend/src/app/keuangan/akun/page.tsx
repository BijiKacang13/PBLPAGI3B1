"use client";

import Navbar from "@/components/Navbar";
import { api } from "@/lib/api/axiosClient";
import { ArrowLeft, Pencil, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import NavbarBottom from "@/components/NavbarBottom";
import TambahAkun from "@/components/TambahAkun";
import EditAkun from "@/components/EditAkun";
import HapusAkun from "@/components/HapusAkun";
import SuccessAlert from "@/components/SuccessAlert";
import { useRouter } from "next/navigation";

type Akun = {
  id_akun: number;
  id_sub_kategori_akun: number;
  kode_akun: string;
  akun: string;
  saldo_awal_debit: number;
  saldo_awal_kredit: number;
};

export default function AkunPage() {
  const [data, setData] = useState<Akun[]>([]);
  const [selected, setSelected] = useState<Akun | null>(null);
  const router = useRouter();

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  // Modal
  const [openTambah, setOpenTambah] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHapus, setOpenHapus] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Import
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("Tidak ada file");
  const [loadingImport, setLoadingImport] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ======================
  // FETCH
  // ======================
  const fetchAkun = async () => {
    try {
      setLoadingData(true);

      const res = await api.get("/akun");

      const arr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const mapped = arr.map((x: any) => ({
        id_akun: Number(x.id_akun),
        id_sub_kategori_akun: Number(x.id_sub_kategori_akun),
        kode_akun: x.kode_akun,
        akun: x.akun,
        saldo_awal_debit: Number(x.saldo_awal_debit),
        saldo_awal_kredit: Number(x.saldo_awal_kredit),
      }));

      setData(mapped);
    } catch (err) {
      console.error("Gagal fetch akun:", err);
      setData([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAkun();
  }, []);

  // ======================
  // SEARCH
  // ======================
  const filtered = data.filter(
    (x) =>
      x.kode_akun.toLowerCase().includes(search.toLowerCase()) ||
      x.akun.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => setPage(1), [search]);

  // ======================
  // PAGINATION
  // ======================
  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // ======================
  // IMPORT EXCEL
  // ======================
  const handleImportExcel = async () => {
    if (!file) {
      alert("Pilih file terlebih dahulu");
      return;
    }

    setLoadingImport(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/akun/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        }
      );

      // Handle 401
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
        alert("Sesi sudah habis, silahkan login ulang");
        router.push("/login");
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        // Build detailed message like Pencatatan page
        const data = result.data || {};
        const created = data.created_count || 0;
        const updated = data.updated_count || 0;
        const skipped = data.skipped_count || 0;

        let msg = '';
        if (created > 0 && updated > 0) {
          msg = `BERHASIL IMPORT: ${created} AKUN BARU, ${updated} DIUPDATE`;
        } else if (created > 0) {
          msg = `BERHASIL IMPORT: ${created} AKUN BARU`;
        } else if (updated > 0) {
          msg = `BERHASIL UPDATE: ${updated} AKUN`;
        } else if (skipped > 0) {
          msg = 'TIDAK ADA PERUBAHAN';
        } else {
          msg = 'IMPORT SELESAI';
        }

        setSuccessMessage(msg);
        setShowSuccess(true);
        fetchAkun();
        setFile(null);
        setFileName("Tidak ada file");
      } else {
        alert(result.message || "Gagal import");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal import");
    } finally {
      setLoadingImport(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      <main className="w-full px-4 py-6 md:px-6 lg:px-10">
        <div className="bg-white shadow-md rounded-xl px-6 py-5 md:px-8 w-full mb-6">

          {/* TITLE */}
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
              AKUN
            </h1>
            <div className="w-10 h-10" />
          </div>

          {/* DOWNLOAD TEMPLATE */}
          <a
            href="/assets/templates/Template_Akun.xlsx"
            download="Template_Akun.xlsx"
            className="text-blue-600 text-sm font-semibold underline block text-right mb-3"
          >
            Download Template Import Akun
          </a>

          <div className="flex items-center gap-2 mb-3">
            <label
              htmlFor="fileUploadAkun"
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-300 transition"
            >
              Pilih File
            </label>
            <input
              id="fileUploadAkun"
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
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
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-500 bg-gray-50"
            />
            <button
              onClick={handleImportExcel}
              disabled={loadingImport}
              className="bg-blue-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingImport ? "Mengimpor..." : "Import Excel"}
            </button>
          </div>

          {/* BUTTON TAMBAH */}
          <button
            onClick={() => setOpenTambah(true)}
            className="w-full bg-blue-200 text-gray-800 py-2 rounded-xl font-semibold text-sm mb-3 shadow hover:bg-blue-400 transition"
          >
            Tambah Akun
          </button>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Cari akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* DROPDOWN */}
          <div className="relative text-sm mb-3">
            <label className="block text-gray-700 mb-1">
              Tampilkan Data per Halaman
            </label>

            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-32 border border-gray-300 bg-white rounded-xl px-4 py-2 flex justify-between cursor-pointer shadow-sm"
            >
              <span>{limit}</span>
              <ChevronDown
                className={`w-4 h-4 transition ${showDropdown ? "rotate-180" : ""
                  }`}
              />
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
                    className={`px-4 py-2 cursor-pointer ${limit === value
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-blue-50"
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
                  <th className="px-4 py-2 text-right w-1/4">Saldo Debit Awal</th>
                  <th className="px-4 py-2 text-right w-1/4">Saldo Kredit Awal</th>
                  <th className="px-4 py-2 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm mt-3">Memuat data...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((item) => (
                    <tr key={item.id_akun} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-gray-600">{item.kode_akun}</td>
                      <td className="px-4 py-2">{item.akun}</td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.saldo_awal_debit)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.saldo_awal_kredit)}
                      </td>
                      <td className="px-4 py-2 flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setSelected(item);
                            setOpenEdit(true);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelected(item);
                            setOpenHapus(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400">
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
              className={`px-3 py-1 rounded-lg text-sm ${page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-200 text-gray-800 hover:bg-blue-400"
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
              className={`px-3 py-1 rounded-lg text-sm ${page === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-200 text-gray-800 hover:bg-blue-400"
                }`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </main>

      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      <NavbarBottom />

      {/* MODALS */}
      <TambahAkun
        open={openTambah}
        onClose={() => setOpenTambah(false)}
        onSuccess={fetchAkun}
      />
      <EditAkun
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchAkun}
        data={selected}
      />
      <HapusAkun
        open={openHapus}
        onClose={() => setOpenHapus(false)}
        onSuccess={fetchAkun}
        data={selected}
      />

      {/* SUCCESS ALERT */}
      <SuccessAlert
        show={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
        autoCloseMs={3000}
      />
    </div>
  );
}
