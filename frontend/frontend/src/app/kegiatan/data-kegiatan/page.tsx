"use client";

import {
  ArrowLeft,
  User,
  Home,
  Book,
  Layers,
  BarChart2,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TambahKegiatan from "@/components/TambahKegiatan";
import { useState, useEffect } from "react";

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

  // FETCH DATA
  const fetchKegiatan = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kegiatan`);
      const json = await res.json();
      setData(json); // json sudah sesuai tipe Kegiatan[]
    } catch (error) {
      console.log("Gagal mengambil data:", error);
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
      {/* HEADER */}
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1">
          <img
            src="/logo.png"
            alt="Logo Yayasan"
            width={55}
            height={55}
            className="w-16 h-16 object-contain"
          />
          <div className="w-[2px] h-10 bg-[#1A3E85]"></div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <h1 className="text-3xl font-extrabold text-[#1A3E85] tracking-wide">
                SIA
              </h1>
              <p className="text-xs font-semibold text-[#1A3E85] tracking-wide leading-tight">
                <span className="inline-block w-[70px] text-left">YAYASAN</span>
                <br />
                <span className="inline-block w-[70px] text-left">
                  DARUSSALAM
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-full bg-blue-200 border border-blue-200">
          <User size={20} className="text-blue-900" />
        </div>
      </header>

      {/* MAIN CARD */}
      <div className="mt-4 w-[90%] max-w-md mx-auto bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-center font-semibold text-gray-800 mb-4">
          DATA KEGIATAN
        </h2>

        {/* IMPORT FILE */}
        <a
          href="#"
          className="text-blue-600 text-sm font-semibold underline block text-center mb-3"
        >
          Download Template Import Kegiatan
        </a>

        <div className="flex items-center gap-2 mb-3">
          <label className="bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-300 transition">
            Pilih File
            <input type="file" className="hidden" />
          </label>
          <input
            type="text"
            value="Tidak ada file"
            readOnly
            className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-xs text-gray-500 outline-none bg-gray-50"
          />
          <button className="bg-blue-500 text-white px-3 py-2 rounded-full text-xs font-semibold hover:bg-blue-600 transition">
            Import Excel
          </button>
        </div>

        {/* TOMBOL TAMBAH */}
        <button
          onClick={() => setOpenModal(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold text-sm mb-3 shadow hover:bg-blue-700 transition"
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
                <th className="text-left px-4 py-2">Akun</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.id_kegiatan}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-2 text-gray-600 font-mono">
                    {item.kode_kegiatan}
                  </td>
                  <td className="px-4 py-2">{item.kegiatan}</td>
                </tr>
              ))}
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

      {/* FOOTER */}
      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      {/* MODAL */}
      <TambahKegiatan
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
