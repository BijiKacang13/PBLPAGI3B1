"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Printer, Calendar, RefreshCcw, ChevronDown, Loader2 } from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";
import Navbar from "@/components/Navbar";

interface Unit {
  id_unit: string;
  nama_unit: string;
}

interface Divisi {
  id_divisi: string;
  nama_divisi: string;
}

interface ArusKasData {
  periode: {
    start_date: string;
    end_date: string;
  };
  laba_bersih: number;
  aktivitas_operasional: {
    items: Record<string, { tahun_lalu: number; tahun_ini: number }>;
    total: number;
  };
  aktivitas_investasi: {
    selisih: number;
    total: number;
  };
  aktivitas_pendanaan: {
    selisih_kewajiban: number;
    selisih_aset_neto: number;
    total: number;
  };
  ringkasan: {
    kenaikan_kas: number;
    saldo_kas_awal: number;
    saldo_kas_akhir: number;
  };
}

export default function ArusKas() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ArusKasData | null>(null);
  const [options, setOptions] = useState<{ units: Unit[]; divisis: Divisi[] }>({ units: [], divisis: [] });
  
  // Filter states
  const [filters, setFilters] = useState({
    unit: "",
    divisi: "",
    start_date: "",
    end_date: "",
    tahun: new Date().getFullYear()
  });

  // Initial filters (default values)
  const initialFilters = {
    unit: "",
    divisi: "",
    start_date: "",
    end_date: "",
    tahun: new Date().getFullYear()
  };

  // Track initial mount
  const isInitialMount = useRef(true);

  // Fetch dropdown options
  useEffect(() => {
    fetchOptions();
  }, []);

  // Auto-fetch data when component mounts or filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchData();
    } else {
      const timer = setTimeout(() => {
        fetchData();
      }, 300); // Debounce untuk menghindari terlalu banyak request

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.unit, filters.divisi, filters.start_date, filters.end_date, filters.tahun]);

  const fetchOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/arus-kas/options`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        }
      });
      const result = await response.json();
      if (result.success) {
        setOptions(result.data);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  // Fetch data arus kas
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.unit) params.append('unit', filters.unit);
      if (filters.divisi) params.append('divisi', filters.divisi);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.tahun) params.append('tahun', filters.tahun.toString());

      const response = await fetch(
        `${API_BASE_URL}/arus-kas?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Accept': 'application/json',
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        alert(result.message || 'Gagal memuat data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.unit) params.append('unit', filters.unit);
      if (filters.divisi) params.append('divisi', filters.divisi);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.tahun) params.append('tahun', filters.tahun.toString());

      const response = await fetch(
        `${API_BASE_URL}/arus-kas/export?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Arus_Kas_${filters.tahun}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Gagal export Excel');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const formatRupiah = (value: number) => {
    if (!value || value === 0) return '-';
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('id-ID').format(absValue);
    return isNegative ? `(${formatted})` : formatted;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      <main className="flex flex-col items-center mt-6 px-4 w-full">
         {/* Filter Card */}
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-4xl text-center">
          <h2 className="font-semibold text-lg mb-5">ARUS KAS</h2>

          {/* Export & Print Buttons */}
          <div className="flex justify-between mb-4 rounded-full overflow-hidden border border-gray-200">
            <button 
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 font-semibold hover:bg-gray-200 transition"
            >
              <FileSpreadsheet size={18} /> Export Excel
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 font-semibold hover:bg-[#9CCFFF] transition"
            >
              <Printer size={18} /> Print
            </button>
          </div>

         {/* Filter Form */}
          <div className="text-left space-y-3">
            <div>
              <label className="text-sm font-medium">Unit</label>
              <select
                value={filters.unit}
                onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
                className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 mt-1"
              >
                <option value="">Akumulasi (Semua Unit)</option>
                {options.units.map((unit) => (
                  <option key={unit.id_unit} value={unit.id_unit}>
                    {unit.nama_unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Divisi</label>
              <select
                value={filters.divisi}
                onChange={(e) => setFilters({ ...filters, divisi: e.target.value })}
                className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 mt-1"
              >
                <option value="">Akumulasi (Semua Divisi)</option>
                {options.divisis.map((divisi) => (
                  <option key={divisi.id_divisi} value={divisi.id_divisi}>
                    {divisi.nama_divisi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Dari Tanggal</label>
                <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Sampai Tanggal</label>
            <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-50 mt-1"
              />
            </div>

            <button 
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-2 bg-[#BDE1FF] text-gray-800 py-2 rounded-full font-semibold mt-2 hover:bg-[#9CCFFF] transition"
            >
              <RefreshCcw size={18} />
              Reset Filter
            </button>
          </div>
        </div>

                {/* Data Display */}
        {data && (
          <div className="w-full max-w-4xl mt-6 bg-white shadow-md rounded-xl p-6">
            <h3 className="text-center font-bold text-lg mb-4">
              LAPORAN ARUS KAS
            </h3>
            <p className="text-center text-sm text-gray-600 mb-6">
              Periode {data.periode.start_date} s.d. {data.periode.end_date}
            </p>

            {/* Aktivitas Operasional */}
            <div className="mb-6">
              <h4 className="font-bold text-md mb-3 bg-blue-100 p-2 rounded">
                1. Aktivitas Operasional
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[300px]">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pl-4 pr-2">Kenaikan/Penurunan Aset Bersih</td>
                      <td className="py-2 pr-4 text-right font-semibold whitespace-nowrap">
                        {formatRupiah(data.laba_bersih)}
                      </td>
                    </tr>
                    
                    {Object.entries(data.aktivitas_operasional.items).map(([key, value]) => {
                      const selisih = value.tahun_lalu - value.tahun_ini;
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      return (
                        <tr key={key} className="border-b">
                          <td className="py-2 pl-4 pr-2">{label}</td>
                          <td className="py-2 pr-4 text-right whitespace-nowrap">{formatRupiah(selisih)}</td>
                        </tr>
                      );
                    })}
                    
                    <tr className="font-bold bg-gray-50">
                      <td className="py-2 pl-4 pr-2">Kas Bersih dari Aktivitas Operasional</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.aktivitas_operasional.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aktivitas Investasi */}
            <div className="mb-6">
              <h4 className="font-bold text-md mb-3 bg-blue-100 p-2 rounded">
                2. Aktivitas Investasi
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[300px]">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pl-4 pr-2">Penambahan/Pengurangan Aset Tetap</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.aktivitas_investasi.selisih)}
                      </td>
                    </tr>
                    <tr className="font-bold bg-gray-50">
                      <td className="py-2 pl-4 pr-2">Kas Bersih dari Aktivitas Investasi</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.aktivitas_investasi.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aktivitas Pendanaan */}
            <div className="mb-6">
              <h4 className="font-bold text-md mb-3 bg-blue-100 p-2 rounded">
                3. Aktivitas Pendanaan
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[300px]">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pl-4 pr-2">Kewajiban Jangka Panjang</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.aktivitas_pendanaan.selisih_kewajiban)}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pl-4 pr-2">Aset Neto</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.aktivitas_pendanaan.selisih_aset_neto)}
                      </td>
                    </tr>
                    <tr className="font-bold bg-gray-50">
                      <td className="py-2 pl-4 pr-2">Kas Bersih dari Aktivitas Pendanaan</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.aktivitas_pendanaan.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ringkasan */}
            <div className="border-t-2 pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[300px]">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pl-4 pr-2 font-semibold">Kenaikan (Penurunan) Kas</td>
                      <td className="py-2 pr-4 text-right font-semibold whitespace-nowrap">
                        {formatRupiah(data.ringkasan.kenaikan_kas)}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pl-4 pr-2">Saldo Kas Awal</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.ringkasan.saldo_kas_awal)}
                      </td>
                    </tr>
                    <tr className="font-bold bg-blue-50">
                      <td className="py-2 pl-4 pr-2">Saldo Kas Akhir</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">
                        {formatRupiah(data.ringkasan.saldo_kas_akhir)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!data && loading && (
          <div className="w-full max-w-4xl mt-6 bg-white shadow-md rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#BDE1FF]" />
              <p className="text-gray-500">Memuat data...</p>
            </div>
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