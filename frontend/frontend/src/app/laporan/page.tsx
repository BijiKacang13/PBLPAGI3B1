"use client";

import { FileText, CircleDollarSign, NotebookTabs, ArrowDownWideNarrow, ClipboardPlus, ListTodo, User } from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";

export default function Laporan() {
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

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm text-center">
          <h2 className="font-semibold text-lg mb-5">MANAJEMEN LAPORAN</h2>

          {/* Tombol Laporan */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/laporan/komprehensif")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition"
            >
              <FileText size={20} />
              KOMPREHENSIF
            </button>

            <button
              onClick={() => router.push("/laporan/posisi-keuangan")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition"
            >
              <CircleDollarSign size={20} />
              POSISI KEUANGAN
            </button>

            <button
              onClick={() => router.push("/laporan/arus-kas")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition"
            >
              <NotebookTabs size={20} />
              ARUS KAS
            </button>

            <button
              onClick={() => router.push("/laporan/perubahan-aset-neto")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition"
            >
              <ArrowDownWideNarrow size={20} />
              PERUBAHAN ASET NETO
            </button>

            <button
              onClick={() => router.push("/laporan/calk")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition"
            >
              <ClipboardPlus size={20} />
              CALK
            </button>

            <button
              onClick={() => router.push("/laporan/prra")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition"
            >
              <ListTodo  size={20} />
              PRRA
            </button>
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
