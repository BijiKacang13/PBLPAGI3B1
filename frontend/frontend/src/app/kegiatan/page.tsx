"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import {
  CalendarDays,
  FileBarChart,
  ChevronRight,
  Target,
  Clock,
  Info,
  CheckCircle,
  ListChecks,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import { motion } from "framer-motion";

interface RecentActivity {
  id: number;
  keterangan: string;
  createdAt: string;
  username: string;
}

export default function ManajemenKegiatan() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Fetch recent activities
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token") || "";
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const logRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/log-aktivitas?limit=5`,
        { headers }
      );

      if (logRes.ok) {
        const logData = await logRes.json();
        if (logData.success && logData.data?.data) {
          const logs = logData.data.data;
          const activities = Array.isArray(logs)
            ? logs.slice(0, 5).map((log: any) => ({
              id: log.id_log_activity,
              keterangan: log.keterangan || "Aktivitas",
              createdAt: log.created_at || "",
              username: log.user?.username || "",
            }))
            : [];
          setRecentActivities(activities);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format time for activities
  const formatActivityTime = (timeStr: string) => {
    if (!timeStr) return "";
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID");
    } catch {
      return timeStr;
    }
  };

  // Menu items configuration
  const menuItems = [
    {
      id: "data-kegiatan",
      title: "Data Kegiatan",
      description: "Kelola daftar kegiatan yayasan",
      icon: <CalendarDays className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/kegiatan/data-kegiatan",
    },
    {
      id: "rapbs-kegiatan",
      title: "RAPBS Per-Kegiatan",
      description: "Rencana anggaran per kegiatan",
      icon: <FileBarChart className="w-6 h-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      path: "/kegiatan/RapbsKegiatan",
    },
  ];

  // Feature descriptions
  const featureDescriptions = [
    {
      title: "Perencanaan Kegiatan",
      description: "Buat dan kelola daftar kegiatan tahunan yayasan",
      icon: <ListChecks className="w-4 h-4 text-blue-600" />,
    },
    {
      title: "Penganggaran",
      description: "Tetapkan anggaran untuk setiap kegiatan",
      icon: <Target className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Monitoring",
      description: "Pantau realisasi anggaran kegiatan",
      icon: <CheckCircle className="w-4 h-4 text-violet-600" />,
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
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500 font-medium">
              Kegiatan
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Kegiatan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola kegiatan dan anggaran yayasan
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

        {/* Catatan Penting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50 rounded-xl border border-amber-100 p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-amber-800 text-sm">Catatan Penting</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Buat data kegiatan sebelum menentukan anggaran</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Setiap kegiatan harus memiliki kode unik</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Budget RAPBS dapat diimport melalui Excel</p>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-emerald-50 rounded-xl border border-emerald-100 p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-800 text-sm mb-1">Panduan Manajemen Kegiatan</h3>
              <p className="text-sm text-emerald-700">
                Gunakan menu Data Kegiatan untuk menambah dan mengelola kegiatan yayasan.
                Setelah kegiatan dibuat, tetapkan anggaran melalui RAPBS Per-Kegiatan
                untuk memantau realisasi biaya setiap kegiatan.
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
    </div >
  );
}
