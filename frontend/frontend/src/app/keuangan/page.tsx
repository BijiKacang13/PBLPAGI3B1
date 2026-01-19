"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import {
  Layers,
  FolderTree,
  CreditCard,
  FileSpreadsheet,
  ChevronRight,
  Wallet,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import { motion } from "framer-motion";

interface Stats {
  totalKategori: number;
  totalSubKategori: number;
  totalAkun: number;
  totalRapbs: number;
}

export default function ManajemenKeuangan() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalKategori: 0,
    totalSubKategori: 0,
    totalAkun: 0,
    totalRapbs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token") || "";
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [kategoriRes, subKategoriRes, akunRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/kategori-akun`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-kategori-akun`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/akun`, { headers }),
      ]);

      let totalKategori = 0;
      let totalSubKategori = 0;
      let totalAkun = 0;

      if (kategoriRes.ok) {
        const data = await kategoriRes.json();
        if (data.success && Array.isArray(data.data)) {
          totalKategori = data.data.length;
        }
      }

      if (subKategoriRes.ok) {
        const data = await subKategoriRes.json();
        if (data.success && Array.isArray(data.data)) {
          totalSubKategori = data.data.length;
        }
      }

      if (akunRes.ok) {
        const data = await akunRes.json();
        if (data.success && Array.isArray(data.data)) {
          totalAkun = data.data.length;
        }
      }

      setStats({ totalKategori, totalSubKategori, totalAkun, totalRapbs: 0 });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Menu items configuration
  const menuItems = [
    {
      id: "kategori",
      title: "Kategori Akun",
      description: "Pengelompokan tertinggi: Aset, Kewajiban, Ekuitas, Pendapatan, Beban",
      icon: <Layers className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/keuangan/kategori",
    },
    {
      id: "sub-kategori",
      title: "Sub-Kategori Akun",
      description: "Pembagian kategori: Aset Lancar, Aset Tetap, Kewajiban Jangka Pendek",
      icon: <FolderTree className="w-6 h-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      path: "/keuangan/sub-kategori",
    },
    {
      id: "akun",
      title: "Akun",
      description: "Daftar akun untuk pencatatan: Kas, Bank, Piutang, Hutang, dll",
      icon: <CreditCard className="w-6 h-6" />,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      path: "/keuangan/akun",
    },
    {
      id: "rapbs",
      title: "RAPBS Per-Akun",
      description: "Input anggaran tahunan setiap akun untuk monitoring realisasi",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      path: "/keuangan/RapbsAkun",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      <main className="flex flex-col mt-6 px-4 md:px-6 lg:px-10 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500 font-medium">
              Keuangan
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Akun Keuangan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola struktur akun dan anggaran keuangan
          </p>
        </motion.div>


        {/* Menu List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4"
        >
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
            >
              <div className={`${item.bgColor} ${item.color} p-3 rounded-xl`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </motion.div>

        {/* Two Column Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
        >
          {/* Catatan Penting */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-amber-800 text-sm">Catatan Penting</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">Buat Kategori sebelum Sub-Kategori</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">Pastikan kode akun unik dan tidak duplikat</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">RAPBS digunakan untuk monitoring realisasi</p>
              </div>
            </div>
          </div>

          {/* Panduan Struktur Akun */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-800 text-sm">Panduan Struktur Akun</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Buat Kategori Akun</p>
                  <p className="text-xs text-gray-500">Aset, Kewajiban, Ekuitas, dll</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Buat Sub-Kategori</p>
                  <p className="text-xs text-gray-500">Aset Lancar, Aset Tetap, dll</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Buat Akun Keuangan</p>
                  <p className="text-xs text-gray-500">Kas, Bank, Piutang, dll</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 rounded-xl border border-blue-100 p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 text-sm mb-1">Panduan Struktur Akun</h3>
              <p className="text-sm text-blue-700">
                Struktur akun keuangan terdiri dari Kategori → Sub-Kategori → Akun.
                Pastikan setiap akun memiliki kode unik dan terhubung dengan sub-kategori yang tepat.
                RAPBS digunakan untuk merencanakan anggaran tahunan per akun.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-gray-400 text-xs italic mt-6 text-center">
          Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025
        </p>
      </main>

      <NavbarBottom />
    </div>
  );
}
