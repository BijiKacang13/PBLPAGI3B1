"use client";

import {
  User,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TambahTransaksi from "@/components/TambahTransaksi";
import NavbarBottom from "@/components/NavbarBottom";
import { useState } from "react";

export default function Akun() {
  const [openModal, setOpenModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [limit, setLimit] = useState(2);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20 relative">
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
          INPUT TRANSAKSI
        </h2>

        <a
          href="#"
          className="text-blue-600 text-sm font-semibold underline block text-center mb-3"
        >
          Download Template Input Transaksi
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

        {/* Tombol Tambah Transaksi */}
        <button
          onClick={() => setOpenModal(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold text-sm mb-3 shadow hover:bg-blue-700 transition"
        >
          Tambah Transaksi
        </button>

        {/* Dropdown tampilkan data */}
        <div className="relative text-sm mb-3">
          <label className="block text-gray-700 mb-1">
            Tampilkan Data per Halaman
          </label>

          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-32 border border-gray-300 bg-white/60 backdrop-blur-md rounded-xl px-4 py-2 flex justify-between items-center cursor-pointer shadow-sm hover:border-blue-400 transition"
          >
            <span className="text-gray-800">{limit}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
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
                transition={{ duration: 0.15 }}
                className="absolute w-32 bg-white/80 backdrop-blur-lg border border-gray-200 shadow-xl rounded-2xl mt-2 py-2 z-10"
              >
                {[2, 5, 10].map((value) => (
                  <div
                    key={value}
                    onClick={() => {
                      setLimit(value);
                      setShowDropdown(false);
                    }}
                    className={`px-4 py-2 cursor-pointer rounded-lg transition ${
                      limit === value
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-blue-50 text-gray-700"
                    }`}
                  >
                    {value} Data
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      {/* ✅ Modal Tambah Transaksi */}
      <TambahTransaksi open={openModal} onClose={() => setOpenModal(false)} />

      {/* ✅ Navbar ikut blur saat modal terbuka */}
      <NavbarBottom isModalOpen={openModal} />
    </div>
  );
}
