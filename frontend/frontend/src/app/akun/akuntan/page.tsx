"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Search, ArrowLeft } from "lucide-react";

export default function AkuntanUnitPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("Semua Unit");

  // Data dummy sementara (belum ke backend)
  const units = [
    { id: "U1", name: "Unit Yayasan" },
    { id: "U2", name: "Unit TPA" },
    { id: "U3", name: "Unit PGRA" },
    { id: "U4", name: "Unit SDIT 1" },
    { id: "U5", name: "Unit SDIT 2" },
    { id: "U6", name: "Unit SMPIT" },
    { id: "U7", name: "Unit SMKIT" },
    { id: "U8", name: "Unit ASMA" },
    { id: "U9", name: "Unit SMAIT" },
  ];

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(search.toLowerCase())
  );

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

        <div className="p-2 rounded-full bg-blue-200 border border-blue-200">
          <User size={20} className="text-blue-900 cursor-pointer"/>
        </div>
      </header>

      {/* Konten utama */}
      <main className="flex flex-col items-center mt-4 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm relative">
            <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex items-center transition"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <h2 className="font-semibold text-center mb-4 mt-4">AKUNTAN UNIT</h2>

          {/* Input cari */}
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama akuntan"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-700"
            />
          </div>

          {/* Dropdown + Filter button */}
          <div className="flex gap-2 mb-4">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            >
              <option>Semua Unit</option>
              <option>Yayasan</option>
              <option>TPA</option>
              <option>PGRA</option>
              <option>SDIT 1</option>
              <option>SDIT 2</option>
              <option>SMPIT</option>
              <option>SMKIT</option>
              <option>ASMA</option>
              <option>SMAIT</option>
            </select>
            <button className="bg-blue-600 text-white px-4 rounded-full hover:bg-blue-700 transition text-sm">
              Filter
            </button>
          </div>

          {/* List Unit */}
          <div className="flex flex-col gap-2">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex justify-between items-center border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <p className="font-medium">{unit.name}</p>
                <span className="text-gray-500 text-sm">{unit.id}</span>
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
