"use client";

import Navbar from "@/components/Navbar";
import { NotepadText, ChartLine, User } from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";

export default function ManajemenKeuangan() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

      <Navbar />

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4 md:px-6 lg:px-10">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm text-center">
          <h2 className="font-semibold text-lg mb-5">
            MANAJEMEN KEGIATAN
          </h2>

          {/* Tombol Manajemen */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/kegiatan/data-kegiatan")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <NotepadText size={20} />
              DATA KEGIATAN
            </button>


            <button
              onClick={() => router.push("/kegiatan/RapbsKegiatan")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <ChartLine size={20} />
              RAPBS PER-KEGIATAN
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
