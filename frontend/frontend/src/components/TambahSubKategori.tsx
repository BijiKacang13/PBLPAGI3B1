"use client";

import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type TambahSubKategoriProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function TambahSubKategori({
  open,
  onClose,
  onSuccess,
}: TambahSubKategoriProps) {
  const API_URL = "http://127.0.0.1:8000/api";

  const [kategoriOptions, setKategoriOptions] = useState<any[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<any>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [kode, setKode] = useState("");
  const [subKategori, setSubKategori] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingKategori, setLoadingKategori] = useState(false);

  // ======================================
  // FETCH KATEGORI
  // ======================================
  const fetchKategori = async () => {
    setLoadingKategori(true);

    try {
      const res = await axios.get(`${API_URL}/kategori-akun`);

      const list = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const mapped = list.map((item: any) => ({
        id: item.id_kategori_akun,
        label: `${item.kode_kategori_akun} - ${item.kategori_akun}`,
      }));

      setKategoriOptions(mapped);
    } catch (err) {
      console.error("Gagal mengambil kategori akun:", err);
    } finally {
      setLoadingKategori(false);
    }
  };

  useEffect(() => {
    if (open) fetchKategori();
  }, [open]);

  // ======================================
  // SUBMIT
  // ======================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKategori) {
      alert("Pilih kategori akun dahulu!");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/sub-kategori-akun`, {
        id_kategori_akun: selectedKategori.id,
        kode_sub_kategori_akun: kode,
        sub_kategori_akun: subKategori,
      });

      onSuccess();
      onClose();

      // reset form
      setKode("");
      setSubKategori("");
      setSelectedKategori(null);
    } catch (error: any) {
      console.error("Gagal tambah sub kategori:", error);
      alert("Gagal menambah sub kategori!");
    }

    setLoading(false);
  };

  if (!open) return null;

  // ======================================
  // UI
  // ======================================
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
            className="bg-white w-[85%] max-w-xs rounded-2xl shadow-lg p-5 relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
              TAMBAH SUB KATEGORI AKUN
            </h3>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              {/* DROPDOWN */}
              <div className="relative">
                <label className="block text-sm text-gray-700 mb-1">
                  Kategori Akun
                </label>

                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white cursor-pointer flex justify-between items-center"
                >
                  <span
                    className={
                      selectedKategori ? "text-gray-800" : "text-gray-400"
                    }
                  >
                    {loadingKategori
                      ? "Memuat..."
                      : selectedKategori?.label || "Pilih kategori"}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* LIST */}
                <AnimatePresence>
                  {dropdownOpen && !loadingKategori && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute w-full bg-white border rounded-xl shadow-lg mt-2 py-2 z-20 max-h-56 overflow-y-auto"
                    >
                      {kategoriOptions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedKategori(item);
                            setDropdownOpen(false);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer ${
                            selectedKategori?.id === item.id
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
                <label className="block text-sm text-gray-700 mb-1">Kode</label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Masukkan kode"
                  required
                />
              </div>

              {/* INPUT SUB KATEGORI */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Sub Kategori Akun
                </label>
                <input
                  type="text"
                  value={subKategori}
                  onChange={(e) => setSubKategori(e.target.value)}
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Masukkan sub kategori"
                  required
                />
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
