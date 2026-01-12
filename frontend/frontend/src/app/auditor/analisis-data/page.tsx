"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * =========================
 * TYPE SCRIPT INTERFACE
 * =========================
 */
interface AnalisisDataResponse {
  tahun: number;
  laporan_komprehensif: {
    pendapatan_dan_sumbangan: number;
    beban: number;
    laba_bersih: number;
  };
  neraca: {
    aktiva: number;
    kewajiban: number;
    aset_neto: number;
  };
}

const AnalisisData = () => {
  const router = useRouter();

  const [data, setData] = useState<AnalisisDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== HELPER: Get Auth Token =====
  const getAuthToken = () => {
    // Sesuaikan dengan cara kamu menyimpan token (localStorage, cookies, etc)
    return localStorage.getItem("auth_token") || "";
  };

  /**
   * =========================
   * FETCH DATA DARI API
   * =========================
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/analisis-data?tahun=2025`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAuthToken()}`, // <-- token harus valid
            },
          }
        );

        if (!response.ok) {
          console.error("Fetch error:", response.status, await response.text());
          setLoading(false);
          return;
        }

        const result: AnalisisDataResponse = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * =========================
   * HELPER FORMAT RUPIAH
   * =========================
   */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatPercentage = (value: number) => {
    if (!isFinite(value)) return "0%";
    return `${(value * 100).toFixed(2)}%`;
  };

  type Interpretasi = {
    label: string;
    warna: string;
  };

  const interpretasiROI = (value: number): Interpretasi => {
    if (value >= 0.1) return { label: "Baik", warna: "text-green-700" };
    if (value >= 0) return { label: "Cukup", warna: "text-yellow-700" };
    return { label: "Kurang", warna: "text-red-700" };
  };

  const interpretasiROA = (value: number): Interpretasi => {
    if (value >= 0.05) return { label: "Efektif", warna: "text-green-700" };
    if (value >= 0) return { label: "Kurang Efektif", warna: "text-yellow-700" };
    return { label: "Tidak Efektif", warna: "text-red-700" };
  };

  const interpretasiDAR = (value: number): Interpretasi => {
    if (value <= 0.5) return { label: "Sehat", warna: "text-green-700" };
    if (value <= 0.7) return { label: "Cukup Sehat", warna: "text-yellow-700" };
    return { label: "Berisiko", warna: "text-red-700" };
  };

  const interpretasiDER = (value: number): Interpretasi => {
    if (value <= 1) return { label: "Aman", warna: "text-green-700" };
    if (value <= 2) return { label: "Perlu Perhatian", warna: "text-yellow-700" };
    return { label: "Berisiko Tinggi", warna: "text-red-700" };
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Navbar />
        <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#004CDF] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat data analisis...</p>
        </div>
        <NavbarBottom />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-500">
        Data analisis tidak tersedia
      </div>
    );
  }

  const roi =
    data.laporan_komprehensif.laba_bersih /
    data.laporan_komprehensif.pendapatan_dan_sumbangan;

  const roa =
    data.laporan_komprehensif.laba_bersih /
    data.neraca.aktiva;

  const dar =
    data.neraca.kewajiban /
    data.neraca.aktiva;

  const der =
    data.neraca.kewajiban /
    data.neraca.aset_neto;

  const roiResult = interpretasiROI(roi);
  const roaResult = interpretasiROA(roa);
  const darResult = interpretasiDAR(dar);
  const derResult = interpretasiDER(der);

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />

      <main className="w-full px-4 py-6 md:px-6 lg:px-10">
        <div className="px-3 py-3 space-y-4 w-full">
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>

            <h1 className="flex-1 text-lg font-bold text-gray-800 text-center sm:text-start">
              ANALISIS DATA
            </h1>

            <div className="w-10 h-10" />
          </div>

          {/* RINGKASAN LAPORAN */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                <div className="text-[12px] text-gray-500 font-medium mb-1">
                  Total Beban
                </div>
                <div className="text-xs font-bold text-blue-900">
                  {formatCurrency(data.laporan_komprehensif.beban)}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                <div className="text-[12px] text-gray-500 font-medium mb-1">
                  Total Pendapatan
                </div>
                <div className="text-xs font-bold text-blue-900">
                  {formatCurrency(
                    data.laporan_komprehensif.pendapatan_dan_sumbangan
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                <div className="text-[12px] text-gray-500 font-medium mb-1">
                  Laba Bersih
                </div>
                <div className="text-xs font-bold text-blue-900">
                  {formatCurrency(data.laporan_komprehensif.laba_bersih)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <div className="text-xs font-bold text-gray-900">
                  {formatCurrency(data.neraca.aktiva)}
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5">
                  Total Aktiva
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <div className="text-xs font-bold text-gray-900">
                  {formatCurrency(data.neraca.kewajiban)}
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5">
                  Total Kewajiban
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <div className="text-xs font-bold text-gray-900">
                  {formatCurrency(data.neraca.aset_neto)}
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5">
                  Aset Neto
                </div>
              </div>
            </div>
          </div>

          {/* RASIO KEUANGAN */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">
              Rasio Keuangan & Interpretasi
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <div className="text-[12px] text-gray-600 font-medium">
                  ROI (Return on Investment)
                </div>
                <div className="text-sm font-bold text-green-800">
                  {formatPercentage(roi)}
                </div>
                <div className={`text-[12px] font-semibold ${roiResult.warna}`}>
                  {roiResult.label}
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <div className="text-[12px] text-gray-600 font-medium">
                  ROA (Return on Asset)
                </div>
                <div className="text-sm font-bold text-green-800">
                  {formatPercentage(roa)}
                </div>
                <div className={`text-[12px] font-semibold ${roaResult.warna}`}>
                  {roaResult.label}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <div className="text-[12px] text-gray-600 font-medium">
                  DAR (Debt to Asset Ratio)
                </div>
                <div className="text-sm font-bold text-yellow-800">
                  {formatPercentage(dar)}
                </div>
                <div className={`text-[12px] font-semibold ${darResult.warna}`}>
                  {darResult.label}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <div className="text-[12px] text-gray-600 font-medium">
                  DER (Debt to Equity Ratio)
                </div>
                <div className="text-sm font-bold text-yellow-800">
                  {formatPercentage(der)}
                </div>
                <div className={`text-[12px] font-semibold ${derResult.warna}`}>
                  {derResult.label}
                </div>
              </div>
            </div>
          </div>


          {/* FOOTER */}
          <div className="text-center text-[12px] text-gray-400 italic pt-2">
            Sistem Informasi Akuntansi Yayasan
            <br />
            Darussalam Batam | {data.tahun}
          </div>
        </div>
      </main>

      <NavbarBottom />
    </div>
  );
};

export default AnalisisData;
