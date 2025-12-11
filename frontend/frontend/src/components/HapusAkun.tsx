"use client";
import { X, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/axiosClient";
import { useState } from "react";

type HapusAkunProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data:
    | {
        id_akun: number;
        akun: string;
        kode_akun: string;
      }
    | null;
};

export default function HapusAkun({ open, onClose, onSuccess, data }: HapusAkunProps) {
  const [loading, setLoading] = useState(false);

  if (!open || !data) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/akun/${data.id_akun}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus akun!");
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
          className="bg-white w-[85%] max-w-xs rounded-2xl p-6 shadow-lg relative"
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
              Hapus Akun?
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Yakin ingin menghapus akun <b>{data.kode_akun} - {data.akun}</b>?
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
