"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { api } from "@/lib/api/axiosClient";

type TambahAkunProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function TambahAkun({ open, onClose, onSuccess }: TambahAkunProps) {
  const [subKategoriOptions, setSubKategoriOptions] = useState<any[]>([]);
  const [selectedSubKategori, setSelectedSubKategori] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [kodeAkun, setKodeAkun] = useState("");
  const [akun, setAkun] = useState("");
  const [saldoDebit, setSaldoDebit] = useState<number | "">("");
  const [saldoCredit, setSaldoCredit] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [loadingSubKategori, setLoadingSubKategori] = useState(false);

  // ======================
  // FETCH SUB KATEGORI
  // ======================
  const fetchSubKategori = async () => {
    setLoadingSubKategori(true);
    try {
      const res = await api.get("/sub-kategori-akun");

      const list = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      const mapped = list.map((item: any) => ({
        id: item.id_sub_kategori_akun,
        label: `${item.kode_sub_kategori_akun} - ${item.sub_kategori_akun}`,
      }));

      setSubKategoriOptions(mapped);
    } catch (err) {
      console.error("Gagal fetch sub kategori:", err);
    }
    setLoadingSubKategori(false);
  };

  useEffect(() => {
    if (open) fetchSubKategori();
  }, [open]);

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubKategori) {
      alert("Pilih Sub Kategori Akun terlebih dahulu.");
      return;
    }

    setLoading(true);

    const payload = {
      id_sub_kategori_akun: selectedSubKategori.id,
      kode_akun: kodeAkun.trim(),
      akun: akun.trim(),
      saldo_awal_debit: saldoDebit ? Number(saldoDebit) : 0,
      saldo_awal_kredit: saldoCredit ? Number(saldoCredit) : 0,
    };

    try {
      await api.post("/akun", payload);

      onSuccess();
      onClose();

      // RESET
      setKodeAkun("");
      setAkun("");
      setSaldoDebit("");
      setSaldoCredit("");
      setSelectedSubKategori(null);

    } catch (error: any) {
      console.error("Gagal tambah akun:", error?.response?.data || error);
      alert("Gagal menambah akun! Periksa input dan coba lagi.");
    }

    setLoading(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-lg p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-center font-semibold text-gray-800 mb-4">
              TAMBAH AKUN
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* DROPDOWN SUB KATEGORI */}
              <div className="relative">
                <label className="block text-sm text-gray-700 mb-1">Sub Kategori Akun</label>

                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white cursor-pointer flex justify-between items-center"
                >
                  <span className={selectedSubKategori ? "text-gray-800" : "text-gray-400"}>
                    {loadingSubKategori
                      ? "Memuat..."
                      : selectedSubKategori?.label || "Pilih Sub Kategori"}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>

                <AnimatePresence>
                  {dropdownOpen && !loadingSubKategori && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute w-full bg-white border rounded-xl shadow-lg mt-2 py-2 z-20 max-h-56 overflow-y-auto"
                    >
                      {subKategoriOptions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedSubKategori(item);
                            setDropdownOpen(false);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer ${selectedSubKategori?.id === item.id
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-blue-50 text-gray-700"
                            }`}
                        >
                          {item.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* INPUT KODE */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Kode Akun</label>
                <input
                  type="text"
                  value={kodeAkun}
                  onChange={(e) => setKodeAkun(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Masukkan kode akun"
                  required
                />
              </div>

              {/* INPUT AKUN */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Akun</label>
                <input
                  type="text"
                  value={akun}
                  onChange={(e) => setAkun(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Masukkan nama akun"
                  required
                />
              </div>

              {/* SALDO DEBIT */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Saldo Awal Debit</label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                  <span className="text-gray-500 mr-2">Rp</span>
                  <input
                    type="number"
                    value={saldoDebit}
                    onChange={(e) => setSaldoDebit(e.target.valueAsNumber)}
                    className="w-full outline-none text-gray-800"
                  />
                </div>
              </div>

              {/* SALDO KREDIT */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Saldo Awal Kredit</label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                  <span className="text-gray-500 mr-2">Rp</span>
                  <input
                    type="number"
                    value={saldoCredit}
                    onChange={(e) => setSaldoCredit(e.target.valueAsNumber)}
                    className="w-full outline-none text-gray-800"
                  />
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-red-600 transition"
                >
                  BATAL
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-blue-700 transition"
                >
                  {loading ? "MENYIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
