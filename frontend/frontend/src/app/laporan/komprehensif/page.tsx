"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  Calendar,
  RefreshCw, User
} from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";

export default function LaporanKomprehensif() {
  const router = useRouter();

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

      {/* Judul dan Tombol Navigasi */}
      <div className="flex items-center gap-2 px-4 mt-1">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold text-lg">LAPORAN KOMPREHENSIF</h2>
      </div>

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-4 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm">
          {/* Tombol Export dan Print */}
          <div className="flex bg-gray-100 rounded-lg overflow-hidden mb-5">
            <button className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-800 py-2 font-medium border border-gray-200 rounded-l-lg hover:bg-gray-50 transition">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-gray-800 py-2 font-medium border border-gray-200 rounded-r-lg hover:bg-blue-200 transition">
              <Printer size={18} /> Print
            </button>
          </div>

          {/* Filter */}
          <div className="flex flex-col gap-3">
            {/* Unit */}
            <div>
              <label className="text-sm text-gray-700">Unit</label>
              <select className="w-full mt-1 border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-600 focus:ring focus:ring-blue-200 outline-none">
                <option>Akumulasi (Semua Unit)</option>
              </select>
            </div>

            {/* Divisi */}
            <div>
              <label className="text-sm text-gray-700">Divisi</label>
              <select className="w-full mt-1 border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-600 focus:ring focus:ring-blue-200 outline-none">
                <option>Akumulasi (Semua Divisi)</option>
              </select>
            </div>

            {/* Dari Tanggal */}
            <div>
              <label className="text-sm text-gray-700">Dari Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full mt-1 border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-600 focus:ring focus:ring-blue-200 outline-none"
                />
                <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            {/* Sampai Tanggal */}
            <div>
              <label className="text-sm text-gray-700">Sampai Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full mt-1 border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-600 focus:ring focus:ring-blue-200 outline-none"
                />
                <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            {/* Tombol Refresh */}
            <button className="flex items-center justify-center gap-2 mt-2 bg-blue-100 text-gray-800 py-2 rounded-full font-medium hover:bg-blue-200 transition">
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Daftar Section Laporan */}
        <div className="w-full max-w-sm mt-6">
          <div className="rounded-t-xl bg-[#7CA6FF] text-white text-center py-2 font-semibold">
            Penerimaan dan Sumbangan
          </div>
          <div className="bg-[#BDE1FF] text-center py-2 text-gray-700 font-medium border-t border-gray-200">
            Penerimaan dan Sumbangan Pendidikan
          </div>
          <div className="bg-gray-200 text-center py-2 text-gray-700 font-medium border-t border-gray-300 rounded-b-xl">
            Penerimaan dan Sumbangan non-Pendidikan
          </div>

          {/* Tabel Data */}
          <div className="mt-3 border border-gray-300 rounded-md overflow-hidden text-sm">
            <div className="grid grid-cols-3 bg-gray-50 font-semibold text-gray-700 text-center py-2 border-b">
              <span>Akun</span>
              <span>Dengan Pembatasan</span>
              <span>Tanpa Pembatasan</span>
            </div>
                       <div className="p-2 text-gray-500 italic text-center">Data belum tersedia</div>

          </div>
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      {/* Navbar bawah */}
      <NavbarBottom />
    </div>
  );
}
