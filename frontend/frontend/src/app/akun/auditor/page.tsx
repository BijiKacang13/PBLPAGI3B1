"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Search, ArrowLeft } from "lucide-react";

export default function AuditorPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Data dummy sementara
  const units = [
    { name: "Auditor" },
    { name: "Aslitor" }
    ];

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

      <Navbar />

      {/* Konten utama */}
      <main className="flex flex-col items-center mt-4 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm relative">
          {/* Tombol back */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex items-center transition"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <h2 className="font-semibold text-center mb-4 mt-4">AUDITOR</h2>

          {/* Input cari */}
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari auditor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-700"
            />
          </div>

          {/* Filter button */}
          <div className="flex gap-2 mb-4">
            <button className="bg-blue-600 w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-white flex items-center justify-center">
              Filter
            </button>
          </div>

          {/* List Unit */}
          <div className="flex flex-col gap-2">
            {filteredUnits.map((unit) => (
              <div
                key={unit.name}
                className="flex justify-between items-center border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <p className="font-medium">{unit.name}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>
    </div>
  );
}
