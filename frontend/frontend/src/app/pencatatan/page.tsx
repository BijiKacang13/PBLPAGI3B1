"use client";

import Navbar from "@/components/Navbar"; 
import { CircleDollarSign, Files, Notebook  } from "lucide-react";
import { useRouter } from "next/navigation";   
import NavbarBottom from "@/components/NavbarBottom";
import { useEffect, useState } from "react";

export default function ManajemenKeuangan() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("admin");

  useEffect(() => {
    // Ambil role dari localStorage
    const role = localStorage.getItem("user_role") || "admin";
    setUserRole(role);
  }, []);

  // Tentukan apakah user adalah auditor (hanya bisa lihat jurnal dan buku besar)
  const isAuditor = userRole === "auditor";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

      <Navbar />

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm text-center">
          <h2 className="font-semibold text-lg mb-5">
            MANAJEMEN PENCATATAN
          </h2>

          {/* Tombol Manajemen */}
          <div className="flex flex-col gap-4">
            {/* Tombol Input Transaksi - hanya untuk non-auditor */}
            {!isAuditor && (
              <button
                onClick={() => router.push("/pencatatan/transaksi")}
                className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
                <CircleDollarSign size={20} /> 
                INPUT TRANSAKSI
              </button>
            )}

            {/* Jurnal Umum - untuk semua role */}
            <button 
              onClick={() => router.push("/pencatatan/jurnal")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <Files size={20} />  
              JURNAL UMUM
            </button>

            {/* Buku Besar - untuk semua role */}
            <button 
              onClick={() => router.push("/pencatatan/buku-besar")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <Notebook  size={20} /> 
              BUKU BESAR
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      <NavbarBottom />
    </div>
  );
}
