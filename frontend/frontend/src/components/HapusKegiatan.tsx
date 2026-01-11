"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { api } from "@/lib/api/axiosClient";

type Kegiatan = {
  id_kegiatan: number;
  kode_kegiatan: string;
  kegiatan: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: Kegiatan | null;
}

export default function HapusKegiatan({
  open,
  onClose,
  onSuccess,
  data,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!data) return;

    setLoading(true);

    try {
      await api.delete(`/kegiatan/${data.id_kegiatan}`);

      onSuccess();
      onClose();
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h3 className="text-center font-semibold text-lg mb-3 text-red-600">
              Hapus Kegiatan
            </h3>

            <p className="text-sm text-gray-600 text-center mb-6">
              Apakah kamu yakin ingin menghapus kegiatan:
              <br />
              <span className="font-semibold text-gray-800">
                {data?.kegiatan}
              </span>?
            </p>

            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
