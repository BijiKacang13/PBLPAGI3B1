"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import {
  UserPlus,
  Users,
  ClipboardCheck,
  ChevronRight,
  Shield,
  Clock,
  Info,
  Lock,
  Key,
  UserCheck,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import { motion } from "framer-motion";

interface UserStats {
  totalAkuntan: number;
  totalAuditor: number;
}

interface RecentActivity {
  id: number;
  keterangan: string;
  createdAt: string;
  username: string;
}

export default function ManajemenAkun() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalAkuntan: 0,
    totalAuditor: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Fetch user statistics and recent activities
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token") || "";
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [akuntanRes, auditorRes, logRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/akuntan-unit`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auditor`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/log-aktivitas?limit=5`, { headers }),
      ]);

      let totalAkuntan = 0;
      let totalAuditor = 0;

      if (akuntanRes.ok) {
        const akuntanData = await akuntanRes.json();
        if (akuntanData.success && Array.isArray(akuntanData.data)) {
          totalAkuntan = akuntanData.data.length;
        }
      }

      if (auditorRes.ok) {
        const auditorData = await auditorRes.json();
        if (auditorData.success && Array.isArray(auditorData.data)) {
          totalAuditor = auditorData.data.length;
        }
      }

      // Parse recent activities
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

      setStats({ totalAkuntan, totalAuditor });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
      id: "tambah",
      title: "Tambah Pengguna",
      description: "Buat akun baru untuk akuntan unit atau auditor dengan hak akses sesuai role",
      icon: <UserPlus className="w-6 h-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      path: "/akun/tambah",
      count: null,
    },
    {
      id: "akuntan",
      title: "Akuntan Unit",
      description: "Pengguna yang dapat input transaksi, kelola jurnal, dan lihat laporan unit",
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/akun/akuntan",
      count: stats.totalAkuntan,
    },
    {
      id: "auditor",
      title: "Auditor",
      description: "Pengguna yang hanya dapat melihat dan memeriksa laporan keuangan",
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      path: "/akun/auditor",
      count: stats.totalAuditor,
    },
  ];

  // Security tips
  const securityTips = [
    {
      icon: <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />,
      text: "Gunakan password yang kuat minimal 8 karakter",
    },
    {
      icon: <Key className="w-4 h-4 text-amber-600 flex-shrink-0" />,
      text: "Jangan bagikan kredensial akun kepada pihak lain",
    },
    {
      icon: <UserCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />,
      text: "Periksa hak akses pengguna secara berkala",
    },
  ];

  // Quick tips for account management
  const quickTips = [
    {
      step: "1",
      title: "Tambah Pengguna Baru",
      description: "Pilih menu 'Tambah Pengguna' lalu isi formulir data",
    },
    {
      step: "2",
      title: "Kelola Akuntan/Auditor",
      description: "Pilih menu sesuai untuk edit atau hapus akun",
    },
    {
      step: "3",
      title: "Atur Hak Akses",
      description: "Pastikan setiap akun memiliki role yang tepat",
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
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500 font-medium">
              Administrator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Akun
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola pengguna sistem
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4"
        >
          <div className="flex items-center justify-around">
            <div className="text-center px-4">
              <p className="text-2xl md:text-3xl font-bold text-gray-800">
                {isLoading ? "-" : stats.totalAkuntan + stats.totalAuditor + 1}
              </p>
              <p className="text-xs text-gray-500">Total Pengguna</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center px-4">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {isLoading ? "-" : stats.totalAkuntan}
              </p>
              <p className="text-xs text-gray-500">Akuntan</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center px-4">
              <p className="text-2xl md:text-3xl font-bold text-violet-600">
                {isLoading ? "-" : stats.totalAuditor}
              </p>
              <p className="text-xs text-gray-500">Auditor</p>
            </div>
          </div>
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
              {item.count !== null ? (
                <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                  {isLoading ? "..." : item.count}
                </span>
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
          ))}
        </motion.div>


        {/* Security Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 rounded-xl border border-amber-100 p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-amber-800 text-sm">Tips Keamanan Akun</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {securityTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 bg-white/50 rounded-lg p-3">
                {tip.icon}
                <p className="text-sm text-amber-700">{tip.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 rounded-xl border border-blue-100 p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 text-sm mb-1">Panduan Manajemen Akun</h3>
              <p className="text-sm text-blue-700">
                Untuk menambah pengguna baru, klik tombol &quot;Tambah Pengguna&quot; dan isi formulir yang tersedia.
                Pastikan setiap pengguna memiliki hak akses yang sesuai dengan tanggung jawabnya.
                Untuk mengubah atau menghapus akun, pilih menu Akuntan Unit atau Auditor.
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
