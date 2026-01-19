"use client";

import Navbar from "@/components/Navbar";
import {
  FileText,
  CircleDollarSign,
  BookOpen,
  TrendingUp,
  ClipboardList,
  ListChecks,
  ChevronRight,
  BarChart3,
  Info,
  Lightbulb,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import { motion } from "framer-motion";

export default function ManajemenLaporan() {
  const router = useRouter();

  // Menu items configuration
  const menuItems = [
    {
      id: "komprehensif",
      title: "Laporan Komprehensif",
      description: "Laporan aktivitas komprehensif yayasan",
      icon: <FileText className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/laporan/komprehensif",
    },
    {
      id: "posisi-keuangan",
      title: "Posisi Keuangan",
      description: "Neraca aset, liabilitas, dan ekuitas",
      icon: <CircleDollarSign className="w-6 h-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      path: "/laporan/posisi-keuangan",
    },
    {
      id: "arus-kas",
      title: "Arus Kas",
      description: "Laporan aliran kas masuk dan keluar",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      path: "/laporan/arus-kas",
    },
    {
      id: "perubahan-aset-neto",
      title: "Perubahan Aset Neto",
      description: "Perubahan ekuitas periode berjalan",
      icon: <BookOpen className="w-6 h-6" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      path: "/laporan/perubahan-aset-neto",
    },
    {
      id: "calk",
      title: "CALK",
      description: "Catatan Atas Laporan Keuangan",
      icon: <ClipboardList className="w-6 h-6" />,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      path: "/laporan/calk",
    },
    {
      id: "prra",
      title: "PRRA",
      description: "Pengungkapan Risiko dan Audit",
      icon: <ListChecks className="w-6 h-6" />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      path: "/laporan/prra",
    },
  ];

  // Report types info
  const reportTypesInfo = [
    {
      category: "Laporan Utama",
      description: "Komprehensif, Posisi Keuangan, Arus Kas",
      icon: <BarChart3 className="w-4 h-4 text-blue-600" />,
    },
    {
      category: "Laporan Pendukung",
      description: "Perubahan Aset Neto, CALK, PRRA",
      icon: <FileText className="w-4 h-4 text-emerald-600" />,
    },
    {
      category: "Fitur Ekspor",
      description: "Cetak dan unduh dalam format PDF",
      icon: <Download className="w-4 h-4 text-violet-600" />,
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
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500 font-medium">
              Laporan
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Laporan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Akses semua laporan keuangan yayasan
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Report Types */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Jenis Laporan</h3>
            </div>

            <div className="space-y-3">
              {reportTypesInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {info.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{info.category}</p>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tips Penggunaan Laporan */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Tips Penggunaan Laporan</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <p className="text-sm text-gray-700">Pastikan semua transaksi sudah diposting</p>
                  <p className="text-xs text-gray-400">Data buku besar harus lengkap</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-sm text-gray-700">Pilih periode laporan yang sesuai</p>
                  <p className="text-xs text-gray-400">Filter berdasarkan bulan atau tahun</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div>
                  <p className="text-sm text-gray-700">Gunakan fitur cetak atau unduh</p>
                  <p className="text-xs text-gray-400">Ekspor laporan ke format PDF</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-indigo-50 rounded-xl border border-indigo-100 p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-800 text-sm mb-1">Tentang Laporan Keuangan</h3>
              <p className="text-sm text-indigo-700">
                Laporan keuangan disusun berdasarkan standar akuntansi untuk organisasi nirlaba.
                Setiap laporan dapat dicetak atau diunduh dalam format PDF.
                Pastikan data transaksi sudah diposting ke buku besar sebelum melihat laporan untuk hasil yang akurat.
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
