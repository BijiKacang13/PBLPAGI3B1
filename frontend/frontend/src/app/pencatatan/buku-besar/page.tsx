"use client";

import { useState } from "react";
import { Calendar, Search, RefreshCcw, Printer, FileSpreadsheet, User } from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";

export default function BukuBesar() {
  const [unit, setUnit] = useState("Akumulasi (Semua Unit)");
  const [divisi, setDivisi] = useState("Akumulasi (Semua Divisi)");
  const [akun, setAkun] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
           {/* HEADER */}
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


      {/* CARD */}
      <main className="bg-white rounded-3xl shadow-sm mx-4 p-5">
        <h2 className="text-center font-semibold text-lg mb-4">BUKU BESAR</h2>

        {/* Tombol Export dan Print */}
        <div className="flex gap-2 mb-5">
          <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-medium py-2 rounded-full hover:bg-blue-200">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* FILTER FORM */}
        <div className="space-y-3">
          {/* Unit */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Unit</label>
            <div className="relative">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white appearance-none"
              >
                <option>Akumulasi (Semua Unit)</option>
                <option>TK</option>
                <option>SD</option>
                <option>SMP</option>
              </select>
              <span className="absolute right-4 top-2.5 text-gray-400">▼</span>
            </div>
          </div>

          {/* Divisi */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Divisi</label>
            <div className="relative">
              <select
                value={divisi}
                onChange={(e) => setDivisi(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white appearance-none"
              >
                <option>Akumulasi (Semua Divisi)</option>
                <option>Keuangan</option>
                <option>Kesiswaan</option>
                <option>Umum</option>
              </select>
              <span className="absolute right-4 top-2.5 text-gray-400">▼</span>
            </div>
          </div>

          {/* Akun */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Akun</label>
            <div className="relative">
              <select
                value={akun}
                onChange={(e) => setAkun(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white appearance-none"
              >
                <option value="">Pilih Akun</option>
                <option>Kas</option>
                <option>Bank</option>
                <option>Piutang</option>
                <option>Pendapatan</option>
              </select>
              <span className="absolute right-4 top-2.5 text-gray-400">▼</span>
            </div>
          </div>

          {/* Dari Tanggal */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Dari Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700"
              />
              <Calendar className="absolute right-4 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sampai Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700"
              />
              <Calendar className="absolute right-4 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Pencarian */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Apa yang ingin anda cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700"
            />
            <button className="bg-blue-100 p-2 rounded-full">
              <Search className="w-4 h-4 text-blue-600" />
            </button>
            <button
              className="bg-blue-500 p-2 rounded-full hover:bg-blue-600"
              onClick={() => {
                setSearch("");
                setUnit("Akumulasi (Semua Unit)");
                setDivisi("Akumulasi (Semua Divisi)");
                setAkun("");
                setFromDate("");
                setToDate("");
              }}
            >
              <RefreshCcw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* TABEL */}
        <div className="mt-6">
          <div className="flex justify-between text-sm font-semibold border-b border-blue-300 pb-1 text-gray-700">
            <span>Tgl</span>
            <span>No. Bukti</span>
            <span>Keterangan</span>
          </div>

          <div className="text-sm text-gray-700 mt-2 space-y-2">
            <div className="flex justify-between">
              <span>04-001</span>
              <span>SUMBANGAN SPP</span>
            </div>
            <div className="flex justify-between">
              <span>04-002</span>
              <span>SUMBANGAN KOMITEE</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-gray-500 mt-6">
        Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025
      </footer>

      {/* NAVBAR */}
      <NavbarBottom />
    </div>
  );
}
