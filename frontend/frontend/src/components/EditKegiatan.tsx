"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function EditKegiatan({
  open,
  onClose,
  onSuccess,
  data,
}: Props) {
  const [kode, setKode] = useState("");
  const [kegiatan, setKegiatan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setKode(data.kode_kegiatan);
      setKegiatan(data.kegiatan);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setLoading(true);

    try {
      await api.put(`/kegiatan/${data.id_kegiatan}`, {
        kode_kegiatan: kode,
        kegiatan: kegiatan,
      });

      onSuccess();
      onClose();
    } catch (error) {
      alert("Terjadi kesalahan saat update data");
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
            <h3 className="text-center font-semibold text-lg mb-4">
              Edit Kegiatan
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Kode Kegiatan
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nama Kegiatan
                </label>
                <input
                  type="text"
                  value={kegiatan}
                  onChange={(e) => setKegiatan(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
