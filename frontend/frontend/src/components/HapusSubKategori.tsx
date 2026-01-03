"use client";
import { X, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/axiosClient";
import { useState } from "react";

type HapusSubKategoriProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: {
    id_sub_kategori_akun: number;
    sub_kategori_akun: string;
  } | null;
};

export default function HapusSubKategori({
  open,
  onClose,
  onSuccess,
  data,
}: HapusSubKategoriProps) {
  const [loading, setLoading] = useState(false);

  if (!open || !data) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      await api.delete(`/sub-kategori-akun/${data.id_sub_kategori_akun}`);

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus sub kategori akun!");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
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
          className="bg-white w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl p-5 sm:p-6 shadow-lg relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <Trash className="w-12 h-12 text-red-600 mx-auto mb-3" />

            <h3 className="text-lg font-semibold text-gray-800">
              Hapus Sub Kategori?
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Yakin ingin menghapus <b>{data.sub_kategori_akun}</b>?
            </p>
          </div>

          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={onClose}
              className="bg-gray-300 px-5 py-2 rounded-full text-sm"
            >
              BATAL
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-5 py-2 rounded-full text-sm"
            >
              {loading ? "MENGHAPUS..." : "HAPUS"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
