"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/axiosClient"; 

type EditKategoriProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: {
    id_kategori_akun: number;
    kode_kategori_akun: string;
    kategori_akun: string;
  } | null;
};

export default function EditKategori({ open, onClose, onSuccess, data }: EditKategoriProps) {
  const [kode, setKode] = useState("");
  const [kategori, setKategori] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setKode(data.kode_kategori_akun);
      setKategori(data.kategori_akun);
    }
  }, [data]);

  if (!open || !data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/kategori-akun/${data.id_kategori_akun}`, {
        kode_kategori_akun: kode,
        kategori_akun: kategori,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Gagal mengedit kategori!");
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
          className="bg-white w-[85%] max-w-xs rounded-2xl shadow-lg p-5 relative"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-700">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
            EDIT KATEGORI AKUN
          </h3>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-700">Kode</label>
              <input
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Kategori Akun</label>
              <input
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
              />
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white px-5 py-2 rounded-full text-sm"
              >
                BATAL
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm"
              >
                {loading ? "MENYIMPAN..." : "SIMPAN"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
