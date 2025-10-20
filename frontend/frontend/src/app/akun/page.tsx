"use client";

import { UserPlus, DollarSign, ClipboardCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";    

export default function ManajemenAkun() {
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
          <h2 className="font-semibold text-lg mb-5">
            MANAJEMEN AKUN PENGGUNA
          </h2>

          {/* Tombol Manajemen */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/akun/tambah")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <UserPlus size={20} />
              TAMBAH PENGGUNA
            </button>


            <button 
              onClick={() => router.push("/akun/akuntan")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <DollarSign size={20} />
              AKUNTAN UNIT
            </button>

            <button 
              onClick={() => router.push("/akun/auditor")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <ClipboardCheck size={20} />
              AUDITOR
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      {/* Navbar bawah */}
      {/* <NavbarBottom /> */}
    </div>
  );
}
