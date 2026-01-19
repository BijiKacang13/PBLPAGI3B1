"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Calendar,
    ChevronRight,
    FileText,
    BookOpen,
    BarChart3,
    PieChart,
    Receipt,
    TrendingUp,
} from "lucide-react";
import ChartTransaksi from "@/components/ChartTransaksi";

interface DashboardStats {
    totalTransaksi: number;
    transaksiHariIni: number;
    transaksiMingguIni: number;
    rataRataHarian: number;
}

interface DashboardContentProps {
    displayName: string;
    isLoading: boolean;
    userRole: "admin" | "akuntan" | "auditor";
}

export default function DashboardContent({
    displayName,
    isLoading: userLoading,
    userRole,
}: DashboardContentProps) {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 11) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    // Format date
    const formatDate = () => {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        const day = days[currentTime.getDay()];
        const date = currentTime.getDate();
        const month = months[currentTime.getMonth()];
        const year = currentTime.getFullYear();

        return `${day}, ${date} ${month} ${year}`;
    };

    // Fetch dashboard statistics
    const fetchStats = useCallback(async () => {
        try {
            setLoadingStats(true);
            const token = localStorage.getItem("auth_token") || "";
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const dailyStatsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum/daily-stats`,
                { headers }
            );

            let totalTransaksi = 0;
            let transaksiHariIni = 0;
            let transaksiMingguIni = 0;
            let rataRataHarian = 0;

            if (dailyStatsRes.ok) {
                const dailyData = await dailyStatsRes.json();
                if (dailyData.success) {
                    totalTransaksi = dailyData.summary?.total || 0;
                    rataRataHarian = dailyData.summary?.average || 0;

                    // Find today's transaction count
                    const today = new Date().toISOString().split("T")[0];
                    const todayData = dailyData.data?.find((d: any) => d.date === today);
                    transaksiHariIni = todayData?.count || 0;

                    // Calculate this week's transactions
                    const now = new Date();
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);

                    transaksiMingguIni = dailyData.data?.reduce((sum: number, d: any) => {
                        const dateObj = new Date(d.date);
                        if (dateObj >= startOfWeek) {
                            return sum + (d.count || 0);
                        }
                        return sum;
                    }, 0) || 0;
                }
            }

            setStats({
                totalTransaksi,
                transaksiHariIni,
                transaksiMingguIni,
                rataRataHarian,
            });
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
            setStats({
                totalTransaksi: 0,
                transaksiHariIni: 0,
                transaksiMingguIni: 0,
                rataRataHarian: 0,
            });
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Quick access items - matching right image colors
    const quickAccessItems = [
        {
            title: "Jurnal Umum",
            description: "Lihat & kelola transaksi",
            icon: <FileText className="w-5 h-5 text-blue-500" />,
            iconBg: "bg-blue-50",
            path: "/pencatatan/jurnal",
        },
        {
            title: "Buku Besar",
            description: "Detail akun & saldo",
            icon: <BookOpen className="w-5 h-5 text-blue-500" />,
            iconBg: "bg-blue-50",
            path: "/pencatatan/buku-besar",
        },
        {
            title: "Laporan Keuangan",
            description: "Laporan komprehensif",
            icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
            iconBg: "bg-indigo-50",
            path: "/laporan",
        },
        {
            title: "Analisis Data",
            description: "Statistik & grafik",
            icon: <PieChart className="w-5 h-5 text-rose-500" />,
            iconBg: "bg-rose-50",
            path: `/${userRole}/analisis-data`,
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-400 rounded-2xl p-5 text-white shadow-lg"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-blue-100 text-sm mb-1">{getGreeting()},</p>
                        <h1 className="text-2xl font-bold mb-2">
                            {userLoading ? "..." : displayName}
                        </h1>
                        <div className="flex items-center gap-2 text-blue-100 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                            <p className="text-xs text-blue-100 mb-1">Periode</p>
                            <p className="font-bold text-lg">{currentTime.getFullYear()}</p>
                            <p className="text-xs text-blue-100">Tahun Anggaran</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Transaksi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Receipt className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Total Transaksi</p>
                    {loadingStats ? (
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold text-gray-800">
                            {stats?.totalTransaksi || 0}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">30 hari terakhir</p>
                </motion.div>

                {/* Transaksi Hari Ini */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Transaksi Hari Ini</p>
                    {loadingStats ? (
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold text-gray-800">
                            {stats?.transaksiHariIni || 0}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Hari ini</p>
                </motion.div>

                {/* Transaksi Minggu Ini */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Transaksi Minggu Ini</p>
                    {loadingStats ? (
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold text-gray-800">
                            {stats?.transaksiMingguIni || 0}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">7 hari terakhir</p>
                </motion.div>

                {/* Rata-rata Harian */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-rose-500" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Rata-rata Harian</p>
                    {loadingStats ? (
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold text-gray-800">
                            {(stats?.rataRataHarian || 0).toFixed(1)}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Transaksi per hari</p>
                </motion.div>
            </div>

            {/* Main Content - Chart and Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-800">Aktivitas Transaksi</h3>
                            <p className="text-xs text-gray-500">30 hari terakhir</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-gray-500">Jumlah Transaksi</span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-52">
                        <ChartTransaksi />
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => router.push(`/${userRole}/analisis-data`)}
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <PieChart className="w-4 h-4" />
                        Lihat Analisis Lengkap
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* Quick Access Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                >
                    <h3 className="font-bold text-gray-800 mb-4">Akses Cepat</h3>

                    <div className="space-y-2">
                        {quickAccessItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => router.push(item.path)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                            >
                                <div className={`p-2 ${item.iconBg} rounded-lg group-hover:bg-white transition-colors`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
