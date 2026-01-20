"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import { api } from "@/lib/api/axiosClient";
import { motion } from "framer-motion";
import {
    Archive,
    Calendar,
    Lock,
    Unlock,
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";

interface ArsipData {
    tahun: number;
    status: "aktif" | "ditutup" | "diarsipkan";
    jumlah_transaksi: number;
    is_current: boolean;
    total_pendapatan?: number;
    total_beban?: number;
    laba_rugi?: number;
    total_aset?: number;
    tanggal_tutup_buku?: string;
}

export default function ArsipTahunanPage() {
    const router = useRouter();
    const [arsipList, setArsipList] = useState<ArsipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTahun, setSelectedTahun] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionType, setActionType] = useState<"tutup" | "arsipkan">("tutup");
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchArsipList();
    }, []);

    const fetchArsipList = async () => {
        try {
            setLoading(true);
            const response = await api.get("/arsip-tahunan/tahun-tersedia");
            const data = response.data || response;

            if (data.success) {
                setArsipList(data.data);
            }
        } catch (error) {
            console.error("Error fetching arsip:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (tahun: number) => {
        try {
            setLoadingDetail(true);
            setSelectedTahun(tahun);
            const response = await api.get(`/arsip-tahunan/${tahun}`);
            const data = response.data || response;

            if (data.success) {
                setDetailData(data.data);
            }
        } catch (error) {
            console.error("Error fetching detail:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleTutupBuku = async () => {
        if (!selectedTahun) return;

        try {
            setProcessing(true);
            const response = await api.post("/arsip-tahunan/tutup-buku", {
                tahun: selectedTahun,
                catatan: `Penutupan buku tahun ${selectedTahun}`,
            });
            const data = response.data || response;

            if (data.success) {
                setMessage({ type: "success", text: data.message });
                fetchArsipList();
                fetchDetail(selectedTahun);
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Gagal menutup buku" });
        } finally {
            setProcessing(false);
            setShowConfirmModal(false);
        }
    };

    const handleArsipkan = async () => {
        if (!selectedTahun) return;

        try {
            setProcessing(true);
            const response = await api.post("/arsip-tahunan/arsipkan", {
                tahun: selectedTahun,
            });
            const data = response.data || response;

            if (data.success) {
                setMessage({ type: "success", text: data.message });
                fetchArsipList();
                fetchDetail(selectedTahun);
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Gagal mengarsipkan" });
        } finally {
            setProcessing(false);
            setShowConfirmModal(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ditutup":
                return (
                    <span className="flex items-center gap-1 text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                        <Lock className="w-4 h-4" />
                        Ditutup
                    </span>
                );
            case "diarsipkan":
                return (
                    <span className="flex items-center gap-1 text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        <Archive className="w-4 h-4" />
                        Diarsipkan
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <Unlock className="w-4 h-4" />
                        Aktif
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
            <Navbar />

            <main className="flex flex-col mt-6 px-4 md:px-6 lg:px-10 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Arsip Tahunan</h1>
                        <p className="text-sm text-gray-500">Kelola arsip laporan keuangan per tahun</p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${message.type === "success"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-red-50 border border-red-200 text-red-700"
                            }`}
                    >
                        {message.type === "success" ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5" />
                        )}
                        <p className="text-sm">{message.text}</p>
                        <button
                            onClick={() => setMessage(null)}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daftar Tahun */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Daftar Tahun
                            </h2>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                                    <p className="text-sm text-gray-500 mt-2">Memuat data...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {arsipList.map((item) => (
                                        <button
                                            key={item.tahun}
                                            onClick={() => fetchDetail(item.tahun)}
                                            className={`w-full p-3 rounded-lg border transition-colors text-left ${selectedTahun === item.tahun
                                                    ? "bg-blue-50 border-blue-200"
                                                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-800">
                                                    {item.tahun}
                                                    {item.is_current && (
                                                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                                            Sekarang
                                                        </span>
                                                    )}
                                                </span>
                                                {getStatusBadge(item.status)}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.jumlah_transaksi} transaksi
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Tahun */}
                    <div className="lg:col-span-2">
                        {selectedTahun ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                            >
                                {loadingDetail ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                                        <p className="text-gray-500 mt-3">Memuat detail...</p>
                                    </div>
                                ) : detailData ? (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-800">
                                                Tahun Anggaran {selectedTahun}
                                            </h2>
                                            {getStatusBadge(detailData.status)}
                                        </div>

                                        {/* Ringkasan Keuangan */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-green-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                    <span className="text-xs text-green-600">Pendapatan</span>
                                                </div>
                                                <p className="text-lg font-bold text-green-700">
                                                    {formatCurrency(detailData.total_pendapatan || 0)}
                                                </p>
                                            </div>

                                            <div className="bg-red-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                                    <span className="text-xs text-red-600">Beban</span>
                                                </div>
                                                <p className="text-lg font-bold text-red-700">
                                                    {formatCurrency(detailData.total_beban || 0)}
                                                </p>
                                            </div>

                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <DollarSign className="w-4 h-4 text-blue-600" />
                                                    <span className="text-xs text-blue-600">Laba/Rugi</span>
                                                </div>
                                                <p className={`text-lg font-bold ${(detailData.laba_rugi || 0) >= 0 ? "text-blue-700" : "text-red-700"
                                                    }`}>
                                                    {formatCurrency(detailData.laba_rugi || 0)}
                                                </p>
                                            </div>

                                            <div className="bg-purple-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="w-4 h-4 text-purple-600" />
                                                    <span className="text-xs text-purple-600">Transaksi</span>
                                                </div>
                                                <p className="text-lg font-bold text-purple-700">
                                                    {detailData.jumlah_transaksi || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Aksi */}
                                        <div className="border-t border-gray-100 pt-4">
                                            <h3 className="font-semibold text-gray-800 mb-3">Aksi</h3>
                                            <div className="flex flex-wrap gap-3">
                                                {detailData.status === "aktif" && (
                                                    <button
                                                        onClick={() => {
                                                            setActionType("tutup");
                                                            setShowConfirmModal(true);
                                                        }}
                                                        className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                                                    >
                                                        <Lock className="w-4 h-4" />
                                                        Tutup Buku {selectedTahun}
                                                    </button>
                                                )}

                                                {detailData.status === "ditutup" && (
                                                    <button
                                                        onClick={() => {
                                                            setActionType("arsipkan");
                                                            setShowConfirmModal(true);
                                                        }}
                                                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                        Arsipkan {selectedTahun}
                                                    </button>
                                                )}

                                                {detailData.status === "diarsipkan" && (
                                                    <p className="text-sm text-gray-500 italic">
                                                        Tahun ini sudah diarsipkan. Data hanya dapat dilihat.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {detailData.tanggal_tutup_buku && (
                                            <p className="text-xs text-gray-400 mt-4">
                                                Ditutup pada: {new Date(detailData.tanggal_tutup_buku).toLocaleDateString("id-ID")}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        Gagal memuat data
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Pilih tahun untuk melihat detail</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <NavbarBottom />

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                    >
                        <div className="text-center">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${actionType === "tutup" ? "bg-amber-100" : "bg-gray-100"
                                }`}>
                                {actionType === "tutup" ? (
                                    <Lock className="w-8 h-8 text-amber-600" />
                                ) : (
                                    <Archive className="w-8 h-8 text-gray-600" />
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                {actionType === "tutup"
                                    ? `Tutup Buku Tahun ${selectedTahun}?`
                                    : `Arsipkan Tahun ${selectedTahun}?`}
                            </h3>

                            <p className="text-sm text-gray-600 mb-6">
                                {actionType === "tutup"
                                    ? "Setelah ditutup, data tahun ini tidak dapat diubah lagi. Pastikan semua transaksi sudah lengkap."
                                    : "Data yang diarsipkan akan tetap dapat dilihat tetapi tidak dapat digunakan untuk laporan aktif."}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={actionType === "tutup" ? handleTutupBuku : handleArsipkan}
                                    disabled={processing}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${actionType === "tutup"
                                            ? "bg-amber-500 hover:bg-amber-600"
                                            : "bg-gray-600 hover:bg-gray-700"
                                        }`}
                                >
                                    {processing ? "Memproses..." : "Ya, Lanjutkan"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
