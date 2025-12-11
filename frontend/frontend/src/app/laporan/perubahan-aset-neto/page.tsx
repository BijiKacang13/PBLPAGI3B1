// pages/laporan-perubahan-aset-neto.tsx
"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Printer, RefreshCcw, ChevronDown, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";

interface Unit {
  id_unit: number;
  unit: string;
}

interface Divisi {
  id_divisi: number;
  divisi: string;
}

interface AsetNetoData {
  dengan_pembatasan: {
    saldo_awal: number;
    kenaikan_periode_lalu: number;
    kenaikan_periode_berjalan: number;
    saldo_akhir: number;
  };
  tanpa_pembatasan: {
    saldo_awal: number;
    kenaikan_periode_lalu: number;
    kenaikan_periode_berjalan: number;
    saldo_akhir: number;
  };
}

type Role = "admin" | "auditor" | "akuntan_unit";

export default function LaporanPerubahanAsetNeto() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [divisis, setDivisis] = useState<Divisi[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedDivisi, setSelectedDivisi] = useState<string>("");
  const [tanggalMulai, setTanggalMulai] = useState<string>("");
  const [tanggalSelesai, setTanggalSelesai] = useState<string>("");
  const [data, setData] = useState<AsetNetoData | null>(null);
  const [totalSaldoAkhir, setTotalSaldoAkhir] = useState<number>(0);
  const [user, setUser] = useState<{ role: Role; id_unit?: number }>({
    role: "admin",
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Mock fetch initial (ganti dengan API calls bila siap)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTanggalMulai(today);
    setTanggalSelesai(today);

    // contoh data dropdown
    setUnits([
      { id_unit: 1, unit: "Unit Pusat" },
      { id_unit: 2, unit: "Unit Cabang A" },
      { id_unit: 3, unit: "Unit Cabang B" },
    ]);
    setDivisis([
      { id_divisi: 1, divisi: "Divisi Pendidikan" },
      { id_divisi: 2, divisi: "Divisi Keuangan" },
      { id_divisi: 3, divisi: "Divisi Operasional" },
    ]);

    // contoh data laporan
    const mockData: AsetNetoData = {
      dengan_pembatasan: {
        saldo_awal: 150000000,
        kenaikan_periode_lalu: 25000000,
        kenaikan_periode_berjalan: 30000000,
        saldo_akhir: 205000000,
      },
      tanpa_pembatasan: {
        saldo_awal: -50000000,
        kenaikan_periode_lalu: 15000000,
        kenaikan_periode_berjalan: -20000000,
        saldo_akhir: -55000000,
      },
    };
    setData(mockData);
    setTotalSaldoAkhir(
      mockData.dengan_pembatasan.saldo_akhir +
        mockData.tanpa_pembatasan.saldo_akhir
    );
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExportExcel = () => {
    // TODO: ganti dengan pemanggilan API export
    const query = new URLSearchParams({
      unit: selectedUnit || "",
      divisi: selectedDivisi || "",
      tanggal_mulai: tanggalMulai || "",
      tanggal_selesai: tanggalSelesai || "",
    });
    window.open(`/api/perubahan-aset-neto/export?${query.toString()}`, "_blank");
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedUnit("");
    setSelectedDivisi("");
    setTanggalMulai(today);
    setTanggalSelesai(today);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300); // simulasi loading singkat
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      <main className="flex flex-col items-center mt-6 px-4 w-full max-w-4xl mx-auto">
        {/* Filter Section */}
        <div className="bg-white shadow-md rounded-xl p-5 w-full text-center">
          <h2 className="font-semibold text-lg mb-5">LAPORAN PERUBAHAN ASET NETO</h2>

          {/* Tombol Export dan Print */}
          <div className="flex justify-between mb-4 rounded-full overflow-hidden border border-gray-200">
            <button
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 font-semibold hover:bg-gray-200 transition-colors"
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 font-semibold hover:bg-[#a8d5f5] transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
          </div>

          {/* Form Filter */}
          <div className="text-left space-y-3">
            <div>
              <label className="text-sm font-medium">Unit</label>
              <div className="relative mt-1">
                {user.role === "admin" || user.role === "auditor" ? (
                  <>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                    >
                      <option value="">Akumulasi (Semua Unit)</option>
                      {units.map((unit) => (
                        <option key={unit.id_unit} value={unit.id_unit}>
                          {unit.unit}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                  </>
                ) : (
                  <>
                    <select
                      className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-100 appearance-none"
                      disabled
                    >
                      {units.map((unit) => (
                        <option
                          key={unit.id_unit}
                          value={unit.id_unit}
                          selected={unit.id_unit === user.id_unit}
                        >
                          {unit.unit}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                    <input type="hidden" name="unit" value={user.id_unit} />
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Divisi</label>
              <div className="relative mt-1">
                <select
                  value={selectedDivisi}
                  onChange={(e) => setSelectedDivisi(e.target.value)}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 appearance-none cursor-pointer"
                >
                  <option value="">Akumulasi (Semua Divisi)</option>
                  {divisis.map((divisi) => (
                    <option key={divisi.id_divisi} value={divisi.id_divisi}>
                      {divisi.divisi}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Dari Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Sampai Tanggal</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50"
                />
              </div>
            </div>

            {/* Tombol Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 rounded-full font-semibold mt-2 hover:bg-[#a8d5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Data Section */}
        {loading ? (
          <div className="w-full mt-6 text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : data ? (
          <div className="w-full mt-6" id="print-area">
            {/* Aset Neto Dengan Pembatasan */}
            <div className="mb-6">
              <div className="rounded-t-xl bg-[#7CA6FF] text-white text-center py-2 font-semibold">
                Aset Neto Dengan Pembatasan Sumber Daya
              </div>

              <div className="mt-3 border border-gray-300 rounded-md overflow-hidden text-sm mb-4">
                <div className="grid grid-cols-3 bg-gray-50 font-semibold text-gray-700 text-center py-2 border-b">
                  <span>Keterangan</span>
                  <span>Periode Lalu</span>
                  <span>Tahun Berjalan</span>
                </div>

                <div className="grid grid-cols-3 py-2 border-b hover:bg-gray-50">
                  <span className="px-2 text-left">Saldo Awal</span>
                  <span className="px-2 text-right">{formatCurrency(data.dengan_pembatasan.saldo_awal)}</span>
                  <span className="px-2 text-right">-</span>
                </div>

                <div className="grid grid-cols-3 py-2 border-b hover:bg-gray-50">
                  <span className="px-2 text-left">Kenaikan (Penurunan) Aset Neto Periode Lalu</span>
                  <span className="px-2 text-right">{formatCurrency(data.dengan_pembatasan.kenaikan_periode_lalu)}</span>
                  <span className="px-2 text-right">-</span>
                </div>

                <div className="grid grid-cols-3 py-2 border-b hover:bg-gray-50">
                  <span className="px-2 text-left">Kenaikan (Penurunan) Aset Neto Periode Berjalan</span>
                  <span className="px-2 text-right">-</span>
                  <span className="px-2 text-right">{formatCurrency(data.dengan_pembatasan.kenaikan_periode_berjalan)}</span>
                </div>

                <div className="grid grid-cols-3 py-2 bg-gray-100 font-semibold">
                  <span className="px-2 text-left">Saldo Akhir Aset Neto Dengan Pembatasan</span>
                  <span className="px-2 text-right">{formatCurrency(data.dengan_pembatasan.saldo_akhir)}</span>
                  <span className="px-2 text-right">{formatCurrency(data.dengan_pembatasan.saldo_akhir)}</span>
                </div>
              </div>
            </div>

            {/* Aset Neto Tanpa Pembatasan */}
            <div className="mb-6">
              <div className="rounded-t-xl bg-[#7CA6FF] text-white text-center py-2 font-semibold">
                Aset Neto Tanpa Pembatasan Dengan Sumber Daya
              </div>

              <div className="mt-3 border border-gray-300 rounded-md overflow-hidden text-sm mb-4">
                <div className="grid grid-cols-3 bg-gray-50 font-semibold text-gray-700 text-center py-2 border-b">
                  <span>Keterangan</span>
                  <span>Periode Lalu</span>
                  <span>Tahun Berjalan</span>
                </div>

                <div className="grid grid-cols-3 py-2 border-b hover:bg-gray-50">
                  <span className="px-2 text-left">Saldo Awal</span>
                  <span className="px-2 text-right">{formatCurrency(data.tanpa_pembatasan.saldo_awal)}</span>
                  <span className="px-2 text-right">-</span>
                </div>

                <div className="grid grid-cols-3 py-2 border-b hover:bg-gray-50">
                  <span className="px-2 text-left">Kenaikan (Penurunan) Aset Neto Periode Lalu</span>
                  <span className="px-2 text-right">{formatCurrency(data.tanpa_pembatasan.kenaikan_periode_lalu)}</span>
                  <span className="px-2 text-right">-</span>
                </div>

                <div className="grid grid-cols-3 py-2 border-b hover:bg-gray-50">
                  <span className="px-2 text-left">Kenaikan (Penurunan) Aset Neto Periode Berjalan</span>
                  <span className="px-2 text-right">-</span>
                  <span className="px-2 text-right">{formatCurrency(data.tanpa_pembatasan.kenaikan_periode_berjalan)}</span>
                </div>

                <div className="grid grid-cols-3 py-2 bg-gray-100 font-semibold">
                  <span className="px-2 text-left">Saldo Akhir Aset Neto Tanpa Pembatasan</span>
                  <span className="px-2 text-right">{formatCurrency(data.tanpa_pembatasan.saldo_akhir)}</span>
                  <span className="px-2 text-right">{formatCurrency(data.tanpa_pembatasan.saldo_akhir)}</span>
                </div>
              </div>
            </div>

            {/* Total Saldo Akhir */}
            <div className="bg-blue-100 rounded-md p-4 mt-4">
              <div className="grid grid-cols-3 font-bold text-gray-900 text-lg">
                <span>Total Saldo Akhir Aset Neto</span>
                <span className="text-right">{formatCurrency(totalSaldoAkhir)}</span>
                <span className="text-right">{formatCurrency(totalSaldoAkhir)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full mt-6 text-center py-8">
            <p className="text-gray-500">Tidak ada data. Klik Refresh untuk memuat data.</p>
          </div>
        )}

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      <NavbarBottom />
    </div>
  );
}