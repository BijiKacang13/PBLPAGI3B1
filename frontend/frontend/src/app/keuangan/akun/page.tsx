"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Pencil, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type Akun = {
  id_akun: number;
  kode_akun: string;
  akun: string;
};

export default function AkunPage() {
  const [data, setData] = useState<Akun[]>([]);

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
  const [selected, setSelected] = useState<Akun | null>(null);

  // ======================
  // FETCH DATA
  // ======================
  const fetchAkun = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/akun");
      const json = await res.json();

      let arr: any[] = [];

      if (Array.isArray(json)) arr = json;
      else if (Array.isArray(json.data)) arr = json.data;
      else if (Array.isArray(json.akun)) arr = json.akun;
      else if (Array.isArray(json?.data?.data)) arr = json.data.data;

      const mapped = arr.map((x) => ({
        id_akun: Number(x.id_akun),
        kode_akun: x.kode_akun,
        akun: x.akun,
      }));

      setData(mapped);
    } catch (error) {
      console.log("Gagal mengambil data akun:", error);
    }
  };

  useEffect(() => {
    fetchAkun();
  }, []);

  // ======================
  // SEARCH + FILTER
  // ======================
  const filtered = data.filter(
    (x) =>
      x.kode_akun.toLowerCase().includes(search.toLowerCase()) ||
      x.akun.toLowerCase().includes(search.toLowerCase())
  );

  // Reset page kalau search berubah
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ======================
  // PAGINATION LOGIC
  // ======================
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
            AKUN
          </h2>
        </div>

        {/* BUTTON TAMBAH */}
        <button
          onClick={() => setOpenTambah(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold text-sm mb-3 shadow hover:bg-blue-700 transition"
        >
          Tambah Akun
        </button>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Cari akun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-full px-4 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* DROPDOWN LIMIT */}
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
              className={`w-4 h-4 transition ${
                showDropdown ? "rotate-180" : ""
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
                  className={`px-4 py-2 cursor-pointer ${
                    limit === value
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
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left w-1/3">Kode</th>
                <th className="px-4 py-2 text-left">Akun</th>
                <th className="px-4 py-2 w-20"></th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((item) => (
                <tr key={item.id_akun} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-600">
                    {item.kode_akun}
                  </td>

                  <td className="px-4 py-2">{item.akun}</td>

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
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
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

      {/*  
      <TambahAkun open={openTambah} onClose={() => setOpenTambah(false)} onSuccess={fetchAkun} />

      <EditAkun open={openEdit} onClose={() => setOpenEdit(false)} onSuccess={fetchAkun} data={selected} />

      <HapusAkun open={openHapus} onClose={() => setOpenHapus(false)} onSuccess={fetchAkun} data={selected} />
      */}
    </div>
  );
}
