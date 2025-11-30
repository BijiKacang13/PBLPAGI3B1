"use client";
import { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type SubKategori = {
  id_sub_kategori_akun: number;
  kode_sub_kategori_akun: string;
  sub_kategori_akun: string;
};

type EditAkunProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: {
    id_akun: number;
    id_sub_kategori_akun: number;
    kode_akun: string;
    akun: string;
    saldo_awal_debit: number;
    saldo_awal_kredit: number;
  } | null;
};

export default function EditAkun({ open, onClose, onSuccess, data }: EditAkunProps) {
  const API_URL = "http://127.0.0.1:8000/api";

  const [listSubKategori, setListSubKategori] = useState<SubKategori[]>([]);
  const [selectedSubKategori, setSelectedSubKategori] = useState<SubKategori | null>(null);

  const [kode, setKode] = useState("");
  const [akun, setAkun] = useState("");
  const [saldoDebit, setSaldoDebit] = useState(0);
  const [saldoKredit, setSaldoKredit] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSubKategori = async () => {
    try {
      const res = await axios.get(`${API_URL}/sub-kategori-akun`);
      const list: SubKategori[] = Array.isArray(res.data.data) ? res.data.data : [];
      setListSubKategori(list);
    } catch (err) {
      console.error("Gagal fetch subkategori:", err);
    }
  };

  useEffect(() => {
    if (open) fetchSubKategori();
  }, [open]);

  useEffect(() => {
    if (data && listSubKategori.length > 0) {
      setKode(data.kode_akun || "");
      setAkun(data.akun || "");
      setSaldoDebit(data.saldo_awal_debit ?? 0);
      setSaldoKredit(data.saldo_awal_kredit ?? 0);

      const selected = listSubKategori.find(
        (s) => s.id_sub_kategori_akun === data.id_sub_kategori_akun
      );
      setSelectedSubKategori(selected || null);
    }
  }, [data, listSubKategori]);

  if (!open || !data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubKategori) {
      alert("Sub kategori tidak tersedia!");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_URL}/akun/${data.id_akun}`, {
        id_sub_kategori_akun: selectedSubKategori.id_sub_kategori_akun,
        kode_akun: kode,
        akun,
        saldo_awal_debit: saldoDebit,
        saldo_awal_kredit: saldoKredit,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Gagal edit akun:", err);
      alert("Gagal edit akun!");
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
            EDIT AKUN
          </h3>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="relative">
              <label className="text-sm text-gray-700 mb-1">Sub Kategori Akun</label>
              <div className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed flex justify-between items-center">
                {selectedSubKategori
                  ? `${selectedSubKategori.kode_sub_kategori_akun} - ${selectedSubKategori.sub_kategori_akun}`
                  : "Tidak tersedia"}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Kode Akun</label>
              <input
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Akun</label>
              <input
                type="text"
                value={akun}
                onChange={(e) => setAkun(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Saldo Awal Debit</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-500 mr-2">Rp</span>
                <input
                  type="number"
                  value={saldoDebit ?? 0}
                  onChange={(e) => setSaldoDebit(e.target.valueAsNumber)}
                  className="w-full outline-none text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Saldo Awal Kredit</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-500 mr-2">Rp</span>
                <input
                  type="number"
                  value={saldoKredit ?? 0}
                  onChange={(e) => setSaldoKredit(e.target.valueAsNumber)}
                  className="w-full outline-none text-gray-800"
                />
              </div>
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
