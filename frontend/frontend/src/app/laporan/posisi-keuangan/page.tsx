"use client";

import { useRouter } from "next/navigation";
import { FileSpreadsheet, Printer, Calendar, RefreshCcw, ChevronDown, ArrowLeft } from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";

export default function PosisiKeuangan() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
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
                <span className="inline-block w-[70px] text-left">DARUSSALAM</span>
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => router.back()}
          className="p-2 rounded-full bg-blue-200 border border-blue-200 cursor-pointer hover:bg-blue-300 transition"
        >
          <ArrowLeft size={20} className="text-blue-900" />
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm text-center">
          <h2 className="font-semibold text-lg mb-5">POSISI KEUANGAN</h2>

          {/* Tombol Export dan Print */}
          <div className="flex justify-between mb-4 rounded-full overflow-hidden border border-gray-200">
            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 font-semibold">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 font-semibold">
              <Printer size={18} /> Print
            </button>
          </div>

          {/* Form Filter */}
          <div className="text-left space-y-3">
            <div>
              <label className="text-sm font-medium">Unit</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="Akumulasi (Semua Unit)"
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                  readOnly
                />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Divisi</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="Akumulasi (Semua Divisi)"
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                  readOnly
                />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Dari Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="hh/bb/tttt"
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Sampai Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="hh/bb/tttt"
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>
            </div>

            {/* Tombol Refresh */}
            <button className="w-full flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 rounded-full font-semibold mt-2">
              <RefreshCcw size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Section Data */}
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
              <span>Saldo Periode Lalu</span>
              <span>Tahun Berjalan</span>
            </div>
                       <div className="p-2 text-gray-500 italic text-center">Data belum tersedia</div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      {/* Navbar bawah */}
      <NavbarBottom />
    </div>
  );
}
