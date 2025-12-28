"use client";

import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import ChartTransaksi from "@/components/ChartTransaksi";
import { useRouter } from "next/navigation";

export default function BerandaAkuntan() {
  const router = useRouter();

  const handleAnalisisData = () => {
    router.push("/akuntan/analisis-data");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      {/* Konten utama */}
      <main className="flex flex-col items-center mt-6 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-6xl">
          <p className="font-semibold mb-2 text-center">Selamat datang, Akuntan Unit!</p>
          <p className="text-gray-500 text-sm mb-3 text-center">
            Transaksi dalam 30 hari terakhir
          </p>

          {/* Label */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-4 h-2 rounded bg-indigo-400"></div>
            <p className="text-sm text-gray-500">Jumlah Transaksi</p>
          </div>

          {/* Chart */}
          <ChartTransaksi />

          {/* Button Analisis Data */}
          <button 
            onClick={handleAnalisisData}
            className="w-full bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold py-3 px-4 rounded-xl transition-colors mt-6"
          >
            Tampilkan Analisis Data
          </button>
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      <NavbarBottom />
    </div>
  );
}


