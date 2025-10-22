"use client";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TambahKategoriProps = {
  open: boolean;
  onClose: () => void;
};

export default function TambahKategori({ open, onClose }: TambahKategoriProps) {
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
              TAMBAH KEGIATAN
            </h3>

            {/* Form */}
            <form className="flex flex-col gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Kode Kegiatan</label>
                <input
                  type="text"
                  placeholder="Masukkan kode kegiatan"
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Kegiatan
                </label>
                <input
                  type="text"
                  placeholder="Masukkan kegiatan"
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
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
                  className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-blue-700 transition"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
