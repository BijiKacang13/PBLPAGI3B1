"use client";

import Navbar from "@/components/Navbar";
import TambahTransaksi from "@/components/TambahTransaksi";
import NavbarBottom from "@/components/NavbarBottom";
import { useState } from "react";

export default function Akun() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20 relative">

      <Navbar />

      {/* MAIN CARD RESPONSIVE */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm md:max-w-full mb-6">

        <h2 className="text-center font-bold text-gray-900 text-lg md:text-xl mb-4">
          INPUT TRANSAKSI
        </h2>

        <a
          href="#"
          className="text-blue-600 text-sm font-semibold underline block mb-4 text-center md:text-left"
        >
          Download Template Input Transaksi
        </a>

        {/* Pilih File + Input File */}
        <div className="w-full flex items-center gap-3 mb-4">

          {/* PILIH FILE BTN */}
          <label className="w-28 bg-gray-200 text-gray-700 px-3 py-2 rounded-full 
            text-sm font-medium cursor-pointer hover:bg-gray-300 transition text-center whitespace-nowrap">
            Pilih File
            <input type="file" className="hidden" />
          </label>

          {/* FILE NAME */}
          <input
            type="text"
            value="Tidak ada file"
            readOnly
            className="flex-1 border border-gray-300 rounded-full px-3 py-2 
              text-xs text-gray-500 outline-none bg-gray-50"
          />

          {/* IMPORT BUTTON */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-blue-600 transition w-full md:w-auto">
            Import Excel
          </button>
        </div>

        {/* Tombol Tambah Transaksi */}
        <button
          onClick={() => setOpenModal(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold text-sm md:text-base shadow hover:bg-blue-700 transition"
        >
          Tambah Transaksi
        </button>
        </div>
      </main>

      {/* FOOTER */}
      <p className="text-gray-400 text-xs italic mt-8 text-center leading-tight">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      {/* Modal Tambah Transaksi */}
      <TambahTransaksi open={openModal} onClose={() => setOpenModal(false)} />


    </div>
  );
}
