  "use client";

  import Navbar from "@/components/Navbar";
  import {
    ArrowLeft,
    User,
    Home,
    Book,
    Layers,
    BarChart2,
    Pencil,
    Trash2,
    ChevronDown,
  } from "lucide-react";
  import { motion, AnimatePresence } from "framer-motion";
  import Link from "next/link";
  import TambahKegiatan from "@/components/TambahKegiatan";
  import { useState, useEffect } from "react";
  import HapusKegiatan from "@/components/HapusKegiatan";
  import EditKegiatan from "@/components/EditKegiatan";
  import { useRouter } from "next/navigation";


  type Kegiatan = {
    id_kegiatan: number;
    kode_kegiatan: string;
    kegiatan: string;
  };

  export default function Akun() {
    const [openModal, setOpenModal] = useState(false);

    const [data, setData] = useState<Kegiatan[]>([]);

    const [showDropdown, setShowDropdown] = useState(false);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [openTambah, setOpenTambah] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openHapus, setOpenHapus] = useState(false);
    const [selected, setSelected] = useState<Kegiatan | null>(null);
    const router = useRouter();


    const fetchKegiatan = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/kegiatan");

    if (!res.ok) {
      throw new Error("Fetch gagal");
    }

    const json = await res.json();

    console.log("DATA DARI API:", json); // ⬅️ WAJIB ADA

    setData(Array.isArray(json) ? json : []);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    setData([]);
  }
};

    useEffect(() => {
      fetchKegiatan();
    }, []);

    const totalPages = Math.ceil(data.length / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData: Kegiatan[] = data.slice(startIndex, endIndex);

    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

        <Navbar />

        {/* MAIN CARD */}
        <main className="container mx-auto px-4 py-6 md:px-6 lg:px-10">
          <div className="bg-white shadow-md rounded-xl px-6 py-5 md:px-8 w-full max-w-sm md:max-w-full mb-6">
            <div className="flex items-center gap-3 mb-2">
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
                DATA KEGIATAN
              </h1>
              <div className="w-10 h-10" />
            </div>

            {/* IMPORT FILE */}
            <a
              href="#"
              className="text-blue-600 text-sm font-semibold underline block text-center md:text-right mb-3"
            >
              Download Template Import Kegiatan
            </a>

            <div className="flex items-center gap-2 mb-3">
              <label className="bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-300 transition">
                Pilih File
                <input type="file" className="hidden" />
              </label>
              <input
                type="text"
                value="Tidak ada file"
                readOnly
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-500 outline-none bg-gray-50"
              />
              <button className="bg-blue-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-400 transition">
                Import Excel
              </button>
            </div>

            {/* TOMBOL TAMBAH */}
            <button
              onClick={() => setOpenModal(true)}
              className="w-full bg-blue-200 text-gray-800 py-2 rounded-xl font-semibold text-sm mb-3 shadow hover:bg-blue-400 transition"
            >
              Tambah Kegiatan
            </button>

            {/* DROPDOWN LIMIT */}
            <div className="relative text-sm mb-3">
              <label className="block text-gray-700 mb-1">
                Tampilkan Data per Halaman
              </label>

              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-32 border border-gray-300 bg-white rounded-xl px-4 py-2 flex justify-between items-center cursor-pointer shadow-sm"
              >
                <span>{limit}</span>
                <ChevronDown
                  className={`w-4 h-4 transition ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute w-32 bg-white border rounded-xl shadow-xl mt-2 py-2 z-10"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* TABEL */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 w-1/3">Kode</th>
                    <th className="text-center px-4 py-2">Akun</th>
                    <th className="text-right px-4 py-2 w-20"></th>
                  </tr>
                </thead>
                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-gray-400">
                          Data belum tersedia
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr
                          key={item.id_kegiatan}
                          className="border-t hover:bg-gray-50 transition-all"
                        >
                          <td className="px-4 py-2 text-gray-600 font-mono">
                            {item.kode_kegiatan}
                          </td>
                          <td className="px-4 py-2">{item.kegiatan}</td>
                          <td className="px-4 py-2">
                            <div className="flex justify-end gap-3">
                              <button
                                className="text-yellow-500"
                                onClick={() => {
                                  setSelected(item);
                                  setOpenEdit(true);
                                }}
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="text-red-600"
                                onClick={() => {
                                  setSelected(item);
                                  setOpenHapus(true);
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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
                className={`px-3 py-1 rounded-lg text-sm ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-200 text-gray-800 hover:bg-blue-400"
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>

        {/* MODAL */}
        <TambahKegiatan
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSuccess={() => fetchKegiatan()}
        />

        <HapusKegiatan
          open={openHapus}
          onClose={() => setOpenHapus(false)}
          onSuccess={() => fetchKegiatan()}
          data={selected}
        />

        <EditKegiatan
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSuccess={() => fetchKegiatan()}
          data={selected}
        />

      </div>
    );
  }
