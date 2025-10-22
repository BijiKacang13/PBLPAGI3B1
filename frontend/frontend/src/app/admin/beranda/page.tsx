import Image from "next/image";
// import ChartTransaksi from "../components/ChartTransaksi";
import NavbarBottom from "@/components/NavbarBottom";
import { User } from "lucide-react";

export default function Beranda() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 ">
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
        <div className="p-2 rounded-full bg-blue-200 border border-blue-200">
          <User size={20} className="text-blue-900" />
        </div>
      </header>

      {/* Konten utama */}
      <main className="flex flex-col items-center mt-6 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm text-center">
          <p className="font-semibold mb-2">Selamat datang, Admin!</p>
          <p className="text-gray-500 text-sm mb-3">
            Transaksi dalam 30 hari terakhir
          </p>

          {/* Label */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-4 h-2 rounded bg-indigo-400"></div>
            <p className="text-sm text-gray-500">Jumlah Transaksi</p>
          </div>

          {/* Chart */}
          {/* <ChartTransaksi /> */}
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      {/* Navbar bawah */}
      {/* <NavbarBottom /> */}
      <NavbarBottom />
    </div>
  );
}
