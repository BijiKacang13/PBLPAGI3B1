"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, Printer, Calendar, RefreshCcw, ChevronDown, Loader2 } from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";
import Navbar from "@/components/Navbar";
import AlertMessage from "@/components/AlertMessage";

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

  // Role state
  const [userRole, setUserRole] = useState<string>("");
  const [userUnitName, setUserUnitName] = useState<string>("");

  // Alert state
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    unit: "",
    divisi: "",
    start_date: new Date().getFullYear() + "-01-01",
    end_date: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear()
  });

  // Initial filters (default values)
  const initialFilters = {
    unit: "",
    divisi: "",
    start_date: new Date().getFullYear() + "-01-01",
    end_date: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear()
  };

  // Track initial mount
  const isInitialMount = useRef(true);

  // Fetch dropdown options and User Role
  useEffect(() => {
    fetchOptions();

    // Get user role & unit name
    const role = localStorage.getItem("user_role") || "";
    setUserRole(role);
    const unitName = localStorage.getItem("user_unit_name") || "";
    setUserUnitName(unitName);

    // Set unit filter if akuntan_unit
    if (role === "akuntan_unit") {
      const unitId = localStorage.getItem("user_unit_id") || "";
      if (unitId && unitId !== "null" && unitId !== "undefined") {
        setFilters(prev => ({ ...prev, unit: unitId }));
      }
    }
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
        setErrorMessage(result.message || 'Gagal memuat data');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Terjadi kesalahan saat memuat data');
      setShowError(true);
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
      setErrorMessage('Gagal export Excel');
      setShowError(true);
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

  // Mapping label untuk aktivitas operasional
  const getOperasionalLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'persediaan_perlengkapan_kantor': 'Persediaan Perlengkapan Kantor',
      'persediaan_perlengkapan_asrama': 'Persediaan Perlengkapan Asrama',
      'persediaan_atk': 'Persediaan ATK',
      'persediaan_lainnya': 'Persediaan Lainnya',
      'piutang_rekanan': 'Piutang Rekanan',
      'piutang_kegiatan': 'Piutang Kegiatan',
      'piutang_karyawan': 'Piutang Karyawan',
      'piutang_sumbangan': 'Piutang Sumbangan',
      'piutang_lainnya': 'Piutang Lainnya',
      'sewa_dibayar_dimuka': 'Sewa Dibayar Dimuka',
      'tabungan_pensiun_karyawan': 'Tabungan Pensiun Karyawan',
      'pajak_dibayar_dimuka': 'Pajak Dibayar Dimuka',
      'hutang_jangka_pendek': 'Hutang Jangka Pendek',
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Urutan item aktivitas operasional sesuai backend
  const operasionalOrder = [
    'persediaan_perlengkapan_kantor',
    'persediaan_perlengkapan_asrama',
    'persediaan_atk',
    'persediaan_lainnya',
    'piutang_rekanan',
    'piutang_kegiatan',
    'piutang_karyawan',
    'piutang_sumbangan',
    'piutang_lainnya',
    'sewa_dibayar_dimuka',
    'tabungan_pensiun_karyawan',
    'pajak_dibayar_dimuka',
    'hutang_jangka_pendek',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }

          #print-area,
          #print-area * {
            visibility: visible;
          }

          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex flex-col items-center mt-6 px-4 md:px-6 lg:px-10 w-full">
        {/* Filter Card */}
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-7xl text-center print:hidden">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold text-lg flex-1 text-center">
              LAPORAN ARUS KAS
            </h2>
            <div className="w-10" />
          </div>

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
              {userRole === "akuntan_unit" && userUnitName ? (
                <div className="w-full border rounded-full px-4 py-2 text-sm text-gray-600 bg-gray-100 mt-1 cursor-not-allowed">
                  {userUnitName} (Unit Anda)
                </div>
              ) : (
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
              )}
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
          <div className="w-full max-w-7xl mt-6 bg-white shadow-md rounded-xl p-6" id="print-area">
            <h3 className="text-center font-bold text-lg mb-4">
              LAPORAN ARUS KAS
            </h3>
            <p className="text-center text-sm text-gray-600 mb-6">
              Periode {data.periode.start_date} s.d. {data.periode.end_date}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-center w-16">No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Komponen Laporan Arus Kas</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {/* AKTIVITAS OPERASIONAL */}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                    <td className="border border-gray-300 px-4 py-2" colSpan={2}>Aktivitas Operasional</td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Kenaikan/Penurunan Aset Bersih</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.laba_bersih)}
                    </td>
                  </tr>

                  <tr className="font-bold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2" colSpan={2}>Penurunan (Kenaikan) Aset Lancar :</td>
                  </tr>

                  {/* Item-item persediaan dan piutang (9 item pertama) */}
                  {operasionalOrder.slice(0, 9).map((key) => {
                    const item = data.aktivitas_operasional.items[key];
                    if (!item) return null;
                    const selisih = item.tahun_lalu - item.tahun_ini;
                    return (
                      <tr key={key}>
                        <td className="border border-gray-300 px-4 py-2"></td>
                        <td className="border border-gray-300 px-4 py-2">{getOperasionalLabel(key)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                          {formatRupiah(selisih)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Cadangan Kerugian Piutang tak tertagih */}
                  <tr>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Cadangan Kerugian Piutang tak tertagih</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                  </tr>

                  {/* Item-item lainnya (sebelum hutang jangka pendek) */}
                  {operasionalOrder.slice(9, 12).map((key) => {
                    const item = data.aktivitas_operasional.items[key];
                    if (!item) return null;
                    const selisih = item.tahun_lalu - item.tahun_ini;
                    return (
                      <tr key={key}>
                        <td className="border border-gray-300 px-4 py-2"></td>
                        <td className="border border-gray-300 px-4 py-2">{getOperasionalLabel(key)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                          {formatRupiah(selisih)}
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="font-bold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2" colSpan={2}>Kenaikan (Penurunan) Kewajiban Jangka Pendek :</td>
                  </tr>

                  {/* Hutang Jangka Pendek */}
                  {(() => {
                    const key = 'hutang_jangka_pendek';
                    const item = data.aktivitas_operasional.items[key];
                    if (!item) return null;
                    const selisih = item.tahun_lalu - item.tahun_ini;
                    return (
                      <tr key={key}>
                        <td className="border border-gray-300 px-4 py-2"></td>
                        <td className="border border-gray-300 px-4 py-2">{getOperasionalLabel(key)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                          {formatRupiah(selisih)}
                        </td>
                      </tr>
                    );
                  })()}

                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Kas Bersih yang diperoleh dari Aktivitas Operasional</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.aktivitas_operasional.total)}
                    </td>
                  </tr>

                  {/* AKTIVITAS INVESTASI */}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                    <td className="border border-gray-300 px-4 py-2" colSpan={2}>Aktivitas Investasi</td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">(Penambahan) Pengurangan Investasi</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">(Penambahan) Pengurangan Aset Tetap</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.aktivitas_investasi.selisih)}
                    </td>
                  </tr>

                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Kas Bersih yang diperoleh dari Aktivitas Investasi</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.aktivitas_investasi.total)}
                    </td>
                  </tr>

                  {/* AKTIVITAS PENDANAAN */}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2 text-center">3</td>
                    <td className="border border-gray-300 px-4 py-2" colSpan={2}>Aktivitas Pendanaan</td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Penambahan (Penurunan) Kewajiban Jangka Panjang</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.aktivitas_pendanaan.selisih_kewajiban)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Aset Neto</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.aktivitas_pendanaan.selisih_aset_neto)}
                    </td>
                  </tr>

                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Kas Bersih yang diperoleh dari Aktivitas Pendanaan</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.aktivitas_pendanaan.total)}
                    </td>
                  </tr>

                  {/* RINGKASAN */}
                  <tr className="bg-yellow-100 font-semibold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Kenaikan (Penurunan) Kas</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.ringkasan.kenaikan_kas)}
                    </td>
                  </tr>

                  <tr className="bg-yellow-100 font-semibold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Saldo Kas Awal</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.ringkasan.saldo_kas_awal)}
                    </td>
                  </tr>

                  <tr className="bg-yellow-100 font-semibold">
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">Saldo Kas Akhir</td>
                    <td className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">
                      {formatRupiah(data.ringkasan.saldo_kas_akhir)}
                    </td>
                  </tr>
                </tbody>
              </table>
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

        <p className="text-gray-400 text-xs italic mt-8 text-center print:hidden">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      <div className="print:hidden">
        <NavbarBottom />
      </div>

      <AlertMessage
        show={showError}
        type="error"
        message={errorMessage}
        onClose={() => setShowError(false)}
      />
    </div>
  );
}