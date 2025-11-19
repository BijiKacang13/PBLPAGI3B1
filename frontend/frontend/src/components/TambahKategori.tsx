"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type TambahKategoriProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // <-- untuk refresh list kategori
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
      const res = await axios.post("http://127.0.0.1:8000/api/kategori-akun", {
        kode_kategori_akun: kode,
        kategori_akun: kategori,
      });

      console.log("BERHASIL:", res.data);

      onSuccess(); // refresh list
      onClose(); // tutup modal

      // reset form
      setKode("");
      setKategori("");
    } catch (error: any) {
      console.error("Gagal tambah kategori:", error);
      alert("Gagal menambah kategori!");
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
            className="bg-white w-[85%] max-w-xs rounded-2xl shadow-lg p-5 relative"
          >
            {/* Tombol close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Judul */}
            <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
              TAMBAH KATEGORI AKUN
            </h3>

            {/* Form */}
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

              {/* Tombol aksi */}
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
