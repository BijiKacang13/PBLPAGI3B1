"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Calendar, Lock, Archive } from "lucide-react";
import { api } from "@/lib/api/axiosClient";

interface TahunOption {
    tahun: number;
    status: "aktif" | "ditutup" | "diarsipkan";
    jumlah_transaksi: number;
    is_current: boolean;
}

interface TahunSelectorProps {
    onTahunChange: (tahun: number) => void;
    className?: string;
    showStatus?: boolean;
}

export default function TahunSelector({
    onTahunChange,
    className = "",
    showStatus = true,
}: TahunSelectorProps) {
    const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
    const [selectedTahun, setSelectedTahun] = useState<number>(new Date().getFullYear());
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTahunTersedia();
    }, []);

    const fetchTahunTersedia = async () => {
        try {
            setLoading(true);
            const response = await api.get("/arsip-tahunan/tahun-tersedia");
            const data = response.data || response;

            if (data.success && data.data) {
                setTahunOptions(data.data);
                // Set default ke tahun aktif
                const tahunAktif = data.tahun_aktif || new Date().getFullYear();
                setSelectedTahun(tahunAktif);
                onTahunChange(tahunAktif);
            }
        } catch (error) {
            console.error("Error fetching tahun:", error);
            // Fallback ke tahun sekarang
            const currentYear = new Date().getFullYear();
            setTahunOptions([
                { tahun: currentYear, status: "aktif", jumlah_transaksi: 0, is_current: true },
                { tahun: currentYear - 1, status: "aktif", jumlah_transaksi: 0, is_current: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (tahun: number) => {
        setSelectedTahun(tahun);
        setShowDropdown(false);
        onTahunChange(tahun);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ditutup":
                return (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        Ditutup
                    </span>
                );
            case "diarsipkan":
                return (
                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <Archive className="w-3 h-3" />
                        Arsip
                    </span>
                );
            default:
                return (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Aktif
                    </span>
                );
        }
    };

    const selectedOption = tahunOptions.find((opt) => opt.tahun === selectedTahun);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={loading}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors min-w-[180px] disabled:opacity-50"
            >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="flex-1 text-left">
                    {loading ? (
                        <span className="text-gray-400">Memuat...</span>
                    ) : (
                        <span className="font-medium text-gray-800">
                            Tahun {selectedTahun}
                        </span>
                    )}
                </span>
                {showStatus && selectedOption && (
                    <span className="mx-1">{getStatusBadge(selectedOption.status)}</span>
                )}
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""
                        }`}
                />
            </button>

            {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                    {tahunOptions.map((option) => (
                        <button
                            key={option.tahun}
                            onClick={() => handleSelect(option.tahun)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors ${option.tahun === selectedTahun ? "bg-blue-50" : ""
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`font-medium ${option.tahun === selectedTahun
                                            ? "text-blue-700"
                                            : "text-gray-800"
                                        }`}
                                >
                                    {option.tahun}
                                </span>
                                {option.is_current && (
                                    <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                        Sekarang
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                    {option.jumlah_transaksi} transaksi
                                </span>
                                {showStatus && getStatusBadge(option.status)}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
