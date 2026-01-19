"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  CircleDollarSign,
  BookOpen,
  FileText,
  ChevronRight,
  PenLine,
  Info,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import { motion } from "framer-motion";

export default function ManajemenPencatatan() {
  const router = useRouter();
  const [isAuditor, setIsAuditor] = useState(true);

  // Check user role
  useEffect(() => {
    const role = localStorage.getItem("user_role") || "admin";
    setIsAuditor(role === "auditor");
  }, []);

  // Menu items configuration (conditional based on role)
  const menuItems = [
    ...(!isAuditor
      ? [
        {
          id: "input-transaksi",
          title: "Input Transaksi",
          description: "Catat transaksi keuangan baru",
          icon: <CircleDollarSign className="w-6 h-6" />,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          path: "/pencatatan/transaksi",
        },
      ]
      : []),
    {
      id: "jurnal-umum",
      title: "Jurnal Umum",
      description: "Lihat dan kelola jurnal transaksi",
      icon: <FileText className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/pencatatan/jurnal",
    },
    {
      id: "buku-besar",
      title: "Buku Besar",
      description: "Lihat saldo dan mutasi akun",
      icon: <BookOpen className="w-6 h-6" />,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      path: "/pencatatan/buku-besar",
    },
  ];

  // Process flow info
  const processFlow = [
    {
      step: "1",
      title: "Input Transaksi",
      description: "Catat transaksi dengan debit dan kredit",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      step: "2",
      title: "Jurnal Umum",
      description: "Review dan posting transaksi",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      step: "3",
      title: "Buku Besar",
      description: "Data tersimpan di buku besar",
      color: "text-violet-600",
      bgColor: "bg-violet-100",
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
            <PenLine className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500 font-medium">
              Pencatatan
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Pencatatan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola transaksi dan pembukuan keuangan
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
          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-50 rounded-xl border border-amber-100 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-amber-800 text-sm">Catatan Penting</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">Pastikan jumlah debit dan kredit seimbang</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">Posting jurnal untuk memperbarui buku besar</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">Periksa kembali transaksi sebelum posting</p>
              </div>
            </div>
          </motion.div>

          {/* Panduan Transaksi */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-800 text-sm">Panduan Transaksi</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <p className="text-sm text-gray-700">Pilih tanggal dan akun transaksi</p>
                  <p className="text-xs text-gray-400">Tentukan debit dan kredit</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-sm text-gray-700">Simpan ke Jurnal Umum</p>
                  <p className="text-xs text-gray-400">Review sebelum posting</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div>
                  <p className="text-sm text-gray-700">Posting ke Buku Besar</p>
                  <p className="text-xs text-gray-400">Data siap untuk laporan</p>
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
          className="bg-blue-50 rounded-xl border border-blue-100 p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 text-sm mb-1">Panduan Pencatatan</h3>
              <p className="text-sm text-blue-700">
                {isAuditor
                  ? "Sebagai auditor, Anda dapat melihat Jurnal Umum dan Buku Besar untuk memeriksa transaksi keuangan. Fitur input transaksi tidak tersedia untuk role auditor."
                  : "Mulai dengan Input Transaksi untuk mencatat transaksi baru. Setelah transaksi tercatat di Jurnal Umum, lakukan posting untuk memperbarui saldo di Buku Besar. Data buku besar akan digunakan untuk menyusun laporan keuangan."}
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
