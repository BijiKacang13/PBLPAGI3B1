"use client";

import Navbar from "@/components/Navbar"; 
import { UserSearch, Users, User, IdCard} from "lucide-react";
import { useRouter } from "next/navigation";   
import NavbarBottom from "@/components/NavbarBottom"; 

export default function ManajemenKeuangan() {
    const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

      <Navbar />

      {/* Konten Utama */}
      <main className="flex flex-col items-center mt-6 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm text-center">
          <h2 className="font-semibold text-lg mb-5">
            MANAJEMEN AKUN KEUANGAN
          </h2>

          {/* Tombol Manajemen */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/keuangan/kategori")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <UserSearch size={20} />
                KATEGORI AKUN
            </button>


            <button 
              onClick={() => router.push("/keuangan/sub-kategori")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <Users size={20} />
              SUB-KATEGORI AKUN
            </button>

            <button 
              onClick={() => router.push("/keuangan/akun")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
              <User size={20} />
              AKUN
            </button>

             <button 
              onClick={() => router.push("/keuangan/RapbsAkun")}
              className="flex items-center justify-center gap-2 bg-[#0D5FFF] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#254da0] transition">
                <IdCard size={20} />
              RAPBS PER-AKUN
            </button>
          </div>
        </div>
   <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
        <NavbarBottom/>
      </main>
    </div>
  );
}
