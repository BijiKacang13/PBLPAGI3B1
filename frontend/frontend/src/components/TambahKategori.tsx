"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/axiosClient";

type TambahKategoriProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function TambahKategori({ open, onClose, onSuccess }: TambahKategoriProps) {
  const [kode, setKode] = useState("");
  const [kategori, setKategori] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/kategori-akun", {
        kode_kategori_akun: kode,
        kategori_akun: kategori,
      });

      onSuccess();
      onClose();
      setKode("");
      setKategori("");
    } catch (error: any) {
      console.error("Gagal tambah kategori:", error);
      alert(error.message || "Gagal menambah kategori!");
    }

    setLoading(false);
  };

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
            className="bg-white w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-lg p-5 sm:p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
              TAMBAH KATEGORI AKUN
            </h3>

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Kode</label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="Masukkan kode"
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Kategori Akun</label>
                <input
                  type="text"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  placeholder="Masukkan kategori"
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>

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
