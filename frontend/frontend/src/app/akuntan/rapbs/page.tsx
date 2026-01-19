"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import {
    FileSpreadsheet,
    ChevronRight,
    Wallet,
    Info,
    Target,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import { motion } from "framer-motion";

interface Stats {
    totalRapbsAkun: number;
    totalRapbsKegiatan: number;
}

export default function ManajemenRapbs() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats>({
        totalRapbsAkun: 0,
        totalRapbsKegiatan: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const currentYear = new Date().getFullYear();

    // Fetch statistics
    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("auth_token") || "";
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            // Try to fetch RAPBS data
            const [rapbsAkunRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/rapbs-akun`, { headers }).catch(() => null),
            ]);

            let totalRapbsAkun = 0;

            if (rapbsAkunRes?.ok) {
                const data = await rapbsAkunRes.json();
                if (data.success && Array.isArray(data.data)) {
                    totalRapbsAkun = data.data.length;
                }
            }

            setStats({ totalRapbsAkun, totalRapbsKegiatan: 0 });
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
            id: "rapbs-akun",
            title: "RAPBS Per-Akun",
            description: "Kelola anggaran tahunan berdasarkan akun keuangan",
            icon: <FileSpreadsheet className="w-6 h-6" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            path: "/keuangan/RapbsAkun",
        },
        {
            id: "rapbs-kegiatan",
            title: "RAPBS Per-Kegiatan",
            description: "Kelola anggaran tahunan berdasarkan kegiatan",
            icon: <Target className="w-6 h-6" />,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            path: "/kegiatan/RapbsKegiatan",
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
                            RAPBS
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Manajemen RAPBS
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Rencana Anggaran Pendapatan dan Belanja Sekolah
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
                                <p className="text-sm text-amber-700">Pastikan anggaran sesuai dengan kebutuhan</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700">RAPBS harus disetujui sebelum digunakan</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700">Periksa kembali nominal anggaran</p>
                            </div>
                        </div>
                    </div>

                    {/* Panduan RAPBS */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-gray-800 text-sm">Panduan RAPBS</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="bg-blue-100 text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Pilih jenis RAPBS</p>
                                    <p className="text-xs text-gray-500">Per-Akun atau Per-Kegiatan</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="bg-blue-100 text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Input anggaran tahunan</p>
                                    <p className="text-xs text-gray-500">Tentukan target pendapatan & belanja</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="bg-blue-100 text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Monitor realisasi</p>
                                    <p className="text-xs text-gray-500">Bandingkan anggaran vs aktual</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50 rounded-xl border border-blue-100 p-4"
                >
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-800 text-sm mb-1">Tentang RAPBS</h3>
                            <p className="text-sm text-blue-700">
                                RAPBS (Rencana Anggaran Pendapatan dan Belanja Sekolah) digunakan untuk merencanakan
                                dan mengelola anggaran tahunan. RAPBS Per-Akun untuk anggaran berdasarkan akun keuangan,
                                sedangkan RAPBS Per-Kegiatan untuk anggaran berdasarkan kegiatan operasional.
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
