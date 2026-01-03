"use client";

import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import SuccessAlert from "@/components/SuccessAlert";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";

interface DetailJurnal {
    id_akun: string;
    akun_nama?: string;
    nominal: number;
    debit_kredit: "debit" | "kredit";
}

interface JurnalData {
    id_jurnal_umum: number;
    tanggal: string;
    keterangan: string;
    jenis_transaksi: string;
    id_unit: number;
    id_divisi: number;
    id_kegiatan: number | null;
    id_sumber_anggaran: number | null;
    is_posted: boolean;
    detail_jurnal_umum: DetailJurnal[];
}

export default function EditJurnal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form data
    const [tanggal, setTanggal] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [jenisTransaksi, setJenisTransaksi] = useState("");
    const [idUnit, setIdUnit] = useState("");
    const [idDivisi, setIdDivisi] = useState("");
    const [idKegiatan, setIdKegiatan] = useState("");
    const [idSumberAnggaran, setIdSumberAnggaran] = useState("");
    const [postToBukuBesar, setPostToBukuBesar] = useState(false);
    const [isPosted, setIsPosted] = useState(false);

    // Detail entries
    const [entries, setEntries] = useState<{ id_akun: string; debit: string; kredit: string }[]>([
        { id_akun: "", debit: "", kredit: "" },
    ]);

    // Dropdown options
    const [units, setUnits] = useState<any[]>([]);
    const [divisis, setDivisis] = useState<any[]>([]);
    const [kegiatans, setKegiatans] = useState<any[]>([]);
    const [sumberAnggarans, setSumberAnggarans] = useState<any[]>([]);
    const [akuns, setAkuns] = useState<any[]>([]);

    // Fetch form options
    const fetchFormData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/input-transaksi/form-data`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            const json = await res.json();

            if (json.data) {
                // API returns singular keys: unit, divisi, kegiatan, akun, sumber_anggaran
                setUnits(json.data.unit || json.data.units || []);
                setDivisis(json.data.divisi || json.data.divisis || []);
                setKegiatans(json.data.kegiatan || json.data.kegiatans || []);
                setSumberAnggarans(json.data.sumber_anggaran || json.data.sumber_anggarans || []);
                setAkuns(json.data.akun || json.data.akuns || []);

                console.log("Form options loaded:", {
                    units: json.data.unit || json.data.units,
                    divisis: json.data.divisi || json.data.divisis,
                    kegiatans: json.data.kegiatan || json.data.kegiatans,
                    akuns: json.data.akun || json.data.akuns,
                });
            }
        } catch (err) {
            console.error("Error fetching form data:", err);
        }
    };

    // Fetch jurnal data
    const fetchJurnal = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            const json = await res.json();

            if (json.success && json.data) {
                const data = json.data;
                setTanggal(data.tanggal || "");
                setKeterangan(data.keterangan || "");
                setJenisTransaksi(data.jenis_transaksi || "");
                setIdUnit(data.id_unit?.toString() || "");
                setIdDivisi(data.id_divisi?.toString() || "");
                setIdKegiatan(data.id_kegiatan?.toString() || "");
                setIdSumberAnggaran(data.id_sumber_anggaran?.toString() || "");
                setIsPosted(data.buku_besar !== null);
                setPostToBukuBesar(data.buku_besar !== null);

                // Convert detail_jurnal_umum to entries format
                // Each detail is a separate row (don't group by id_akun)
                const details = data.detail_jurnal_umum || [];
                console.log("Raw detail_jurnal_umum:", details);

                const entryList = details.map((d: DetailJurnal) => ({
                    id_akun: d.id_akun.toString(),
                    debit: d.debit_kredit === "debit" ? d.nominal.toString() : "",
                    kredit: d.debit_kredit === "kredit" ? d.nominal.toString() : "",
                }));

                console.log("Mapped entries:", entryList);

                if (entryList.length > 0) {
                    setEntries(entryList);
                }
            } else {
                alert("Data jurnal tidak ditemukan");
                router.back();
            }
        } catch (err) {
            console.error("Error fetching jurnal:", err);
            alert("Gagal mengambil data jurnal");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Load data sequentially
    useEffect(() => {
        const loadData = async () => {
            await fetchFormData();
            if (id) {
                await fetchJurnal();
            } else {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Entry handlers
    const addEntry = () => {
        setEntries([...entries, { id_akun: "", debit: "", kredit: "" }]);
    };

    const removeEntry = (index: number) => {
        if (entries.length > 1) {
            setEntries(entries.filter((_, i) => i !== index));
        }
    };

    const updateEntry = (index: number, field: string, value: string) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: value };
        setEntries(updated);
    };

    // Calculate totals
    const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit.replace(/\D/g, "")) || 0), 0);
    const totalKredit = entries.reduce((sum, e) => sum + (parseFloat(e.kredit.replace(/\D/g, "")) || 0), 0);
    const isBalanced = totalDebit === totalKredit && totalDebit > 0;

    // Save handler
    const handleSave = async () => {
        if (!tanggal || !keterangan || !jenisTransaksi || !idUnit || !idDivisi) {
            alert("Mohon lengkapi semua field yang wajib diisi");
            return;
        }

        if (!isBalanced) {
            alert("Total Debit dan Kredit harus seimbang");
            return;
        }

        const validEntries = entries.filter(e => e.id_akun && (e.debit || e.kredit));
        if (validEntries.length === 0) {
            alert("Mohon tambahkan minimal satu entri akun");
            return;
        }

        try {
            setSaving(true);

            // Update jurnal
            const payload = {
                tanggal,
                keterangan,
                jenis_transaksi: jenisTransaksi,
                id_unit: parseInt(idUnit),
                id_divisi: parseInt(idDivisi),
                id_kegiatan: idKegiatan ? parseInt(idKegiatan) : null,
                id_sumber_anggaran: idSumberAnggaran ? parseInt(idSumberAnggaran) : null,
                id_akun: validEntries.map(e => e.id_akun),
                debit: validEntries.map(e => e.debit || "0"),
                kredit: validEntries.map(e => e.kredit || "0"),
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || "Gagal menyimpan perubahan");
            }

            // Handle un-posting if checkbox was unchecked
            if (isPosted && !postToBukuBesar) {
                const unpostRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buku-besar/unpost`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    body: JSON.stringify({ id_jurnal_umum: parseInt(id!) }),
                });
                // Unpost may not exist yet, ignore errors
            }

            // Handle posting if checkbox was checked and not already posted
            if (!isPosted && postToBukuBesar) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buku-besar/posting`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    body: JSON.stringify({ id_jurnal_umum: parseInt(id!) }),
                });
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push("/pencatatan/jurnal");
            }, 2000);
        } catch (err: any) {
            console.error("Error saving:", err);
            alert(err.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setSaving(false);
        }
    };

    // Debug: Log state changes
    useEffect(() => {
        if (!loading) {
            console.log("Form data loaded:", { tanggal, keterangan, jenisTransaksi, idUnit, idDivisi, idKegiatan, idSumberAnggaran, entries });
        }
    }, [loading, tanggal, keterangan, jenisTransaksi, idUnit, idDivisi, idKegiatan, idSumberAnggaran, entries]);

    // No ID provided
    if (!id) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">ID jurnal tidak ditemukan</p>
                        <button
                            onClick={() => router.push("/pencatatan/jurnal")}
                            className="px-4 py-2 bg-[#004CDF] text-white rounded-lg hover:bg-[#003BB8] transition"
                        >
                            Kembali ke Jurnal
                        </button>
                    </div>
                </div>
                <NavbarBottom />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#004CDF] mx-auto mb-3" />
                        <p className="text-gray-600">Memuat data jurnal...</p>
                    </div>
                </div>
                <NavbarBottom />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            <Navbar />

            <main className="w-full px-4 py-6 md:px-6 lg:px-10 min-w-0">
                <div className="bg-white shadow-md rounded-xl p-6 w-full mb-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="flex-1 text-lg font-bold text-gray-800 uppercase tracking-tight">
                            EDIT JURNAL UMUM
                        </h1>
                        <div className="w-10 h-10" />
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Tanggal & Jenis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-blue-900 mb-1.5 ml-1">
                                    Tanggal <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-blue-900/20 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-900 mb-1.5 ml-1">
                                    Jenis Transaksi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={jenisTransaksi}
                                    onChange={(e) => setJenisTransaksi(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-blue-900/20 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Pilih Jenis</option>
                                    <option value="Terikat">Terikat</option>
                                    <option value="Tidak Terikat">Tidak Terikat</option>
                                </select>
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div>
                            <label className="block text-sm font-semibold text-blue-900 mb-1.5 ml-1">
                                Keterangan <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-white border border-blue-900/20 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Unit & Divisi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-blue-900 mb-1.5 ml-1">
                                    Unit <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={idUnit}
                                    onChange={(e) => setIdUnit(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-blue-900/20 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Pilih Unit</option>
                                    {units.map((u: any) => (
                                        <option key={u.id_unit} value={u.id_unit.toString()}>{u.unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-900 mb-1.5 ml-1">
                                    Divisi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={idDivisi}
                                    onChange={(e) => setIdDivisi(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-blue-900/20 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Pilih Divisi</option>
                                    {divisis.map((d: any) => (
                                        <option key={d.id_divisi} value={d.id_divisi.toString()}>{d.divisi}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Kegiatan & Sumber Anggaran */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-blue-900 mb-1.5 ml-1">Kegiatan</label>
                                <select
                                    value={idKegiatan}
                                    onChange={(e) => setIdKegiatan(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-blue-900/20 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Pilih Kegiatan</option>
                                    {kegiatans.map((k: any) => (
                                        <option key={k.id_kegiatan} value={k.id_kegiatan.toString()}>{k.kegiatan}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-900 mb-1.5 ml-1">Sumber Anggaran</label>
                                <select
                                    value={idSumberAnggaran}
                                    onChange={(e) => setIdSumberAnggaran(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-blue-900/20 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Pilih Sumber Anggaran</option>
                                    {sumberAnggarans.map((s: any) => (
                                        <option key={s.id_akun} value={s.id_akun.toString()}>{s.akun}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Detail Entries */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Detail Akun</h3>
                                <button
                                    type="button"
                                    onClick={addEntry}
                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> TAMBAH BARIS
                                </button>
                            </div>

                            <div className="space-y-3">
                                {entries.map((entry, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <div className="flex-1">
                                            <select
                                                value={entry.id_akun}
                                                onChange={(e) => updateEntry(index, "id_akun", e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-blue-900/10 rounded-lg text-sm text-blue-900 outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">Pilih Akun</option>
                                                {akuns.map((a: any) => (
                                                    <option key={a.id_akun} value={a.id_akun.toString()}>{a.kode_akun} - {a.akun}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <div className="relative w-full md:w-32">
                                                <input
                                                    type="number"
                                                    placeholder="Debit"
                                                    value={entry.debit}
                                                    onChange={(e) => updateEntry(index, "debit", e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-blue-900/10 rounded-lg text-sm text-blue-900 text-right outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="relative w-full md:w-32">
                                                <input
                                                    type="number"
                                                    placeholder="Kredit"
                                                    value={entry.kredit}
                                                    onChange={(e) => updateEntry(index, "kredit", e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-blue-900/10 rounded-lg text-sm text-blue-900 text-right outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeEntry(index)}
                                                disabled={entries.length === 1}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Section */}
                            <div className="flex flex-col md:flex-row justify-end items-center gap-6 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-sm font-medium">
                                    <span className="text-gray-500 mr-2 uppercase text-[10px] tracking-widest font-bold">Total Debit:</span>
                                    <span className="text-gray-900 font-bold">Rp {totalDebit.toLocaleString("id-ID")}</span>
                                </div>
                                <div className="text-sm font-medium">
                                    <span className="text-gray-500 mr-2 uppercase text-[10px] tracking-widest font-bold">Total Kredit:</span>
                                    <span className="text-gray-900 font-bold">Rp {totalKredit.toLocaleString("id-ID")}</span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${isBalanced ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isBalanced ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                                    {isBalanced ? "SEIMBANG" : "BELUM SEIMBANG"}
                                </div>
                            </div>
                        </div>

                        {/* Posting Options */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${postToBukuBesar ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-gray-50 hover:border-gray-100'}`}>
                                <input
                                    type="checkbox"
                                    checked={postToBukuBesar}
                                    onChange={(e) => setPostToBukuBesar(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-gray-800">Posting ke Buku Besar</span>
                                    {isPosted && !postToBukuBesar && (
                                        <p className="text-[10px] text-rose-600 font-bold uppercase mt-0.5 animate-pulse">Perhatian: Jurnal akan di-unpost!</p>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6">
                            <button
                                onClick={() => router.back()}
                                className="px-8 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                BATAL
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !isBalanced}
                                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:scale-100 active:scale-95 shadow-sm"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <NavbarBottom />

            <SuccessAlert
                show={showSuccess}
                message="BERHASIL MENGUBAH JURNAL"
                onClose={() => setShowSuccess(false)}
            />
        </div>
    );
}
