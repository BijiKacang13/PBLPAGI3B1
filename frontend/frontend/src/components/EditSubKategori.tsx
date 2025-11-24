"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type EditSubKategoriProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: {
    id_sub_kategori_akun: number;
    kode_sub_kategori_akun: string;
    sub_kategori_akun: string;
    id_kategori_akun: number;
  } | null;
};

export default function EditSubKategori({
  open,
  onClose,
  onSuccess,
  data,
}: EditSubKategoriProps) {
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [loading, setLoading] = useState(false);

  const [listKategori, setListKategori] = useState<
    { id_kategori_akun: number; kode_kategori_akun: string; kategori_akun: string }[]
  >([]);

  // Ambil daftar kategori
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/kategori-akun");
        setListKategori(res.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil kategori", err);
      }
    };
    fetchKategori();
  }, []);

  // Set nilai awal form
  useEffect(() => {
    if (data) {
      setKode(data.kode_sub_kategori_akun);
      setNama(data.sub_kategori_akun);
      setKategori(String(data.id_kategori_akun));
    }
  }, [data]);

  if (!open || !data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/sub-kategori-akun/${data.id_sub_kategori_akun}`,
        {
          kode_sub_kategori_akun: kode,
          sub_kategori_akun: nama,
          id_kategori_akun: Number(kategori), // tetap kirim meski dropdown disabled
        }
      );

      onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal mengedit sub kategori akun!");
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
          className="bg-white w-[85%] max-w-xs rounded-2xl shadow-lg p-5 relative"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-700">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
            EDIT SUB KATEGORI AKUN
          </h3>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>

            {/* Kategori Akun (DISABLED) */}
            <div>
              <label className="text-sm text-gray-700">Kategori Akun</label>
              <select
                value={kategori}
                disabled
                className="w-full border rounded-full px-4 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              >
                {listKategori.map((item) => (
                  <option
                    key={item.id_kategori_akun}
                    value={item.id_kategori_akun}
                  >
                    {item.kode_kategori_akun} - {item.kategori_akun}
                  </option>
                ))}
              </select>
            </div>

            {/* Kode Sub Kategori */}
            <div>
              <label className="text-sm text-gray-700">Kode Sub Kategori</label>
              <input
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
              />
            </div>

            {/* Nama Sub Kategori */}
            <div>
              <label className="text-sm text-gray-700">Nama Sub Kategori</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
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
