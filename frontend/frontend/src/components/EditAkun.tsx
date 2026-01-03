"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/axiosClient";
import { ChevronDown } from "lucide-react";

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
  const [listSubKategori, setListSubKategori] = useState<SubKategori[]>([]);
  const [selectedSubKategori, setSelectedSubKategori] = useState<SubKategori | null>(null);

  const [kode, setKode] = useState("");
  const [akun, setAkun] = useState("");
  const [saldoDebit, setSaldoDebit] = useState(0);
  const [saldoKredit, setSaldoKredit] = useState(0);

  const [loading, setLoading] = useState(false);

  // ==========================
  // FETCH SUBKATEGORI (FIXED)
  // ==========================
  const fetchSubKategori = async () => {
    try {
      const res = await api.get("/sub-kategori-akun");

      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      setListSubKategori(list);
    } catch (err) {
      console.error("Gagal fetch subkategori:", err);
      setListSubKategori([]);
    }
  };

  useEffect(() => {
    if (open) fetchSubKategori();
  }, [open]);

  // ==========================
  // INIT FORM (FIXED)
  // ==========================
  useEffect(() => {
    if (!data) return;

    setKode(data.kode_akun || "");
    setAkun(data.akun || "");
    setSaldoDebit(data.saldo_awal_debit ?? 0);
    setSaldoKredit(data.saldo_awal_kredit ?? 0);

    const selected = listSubKategori.find(
      (x) => x.id_sub_kategori_akun === data.id_sub_kategori_akun
    );

    setSelectedSubKategori(selected || null);
  }, [data, listSubKategori]);

  if (!open || !data) return null;

  // ==========================
  // SUBMIT (FIXED)
  // ==========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubKategori) {
      alert("Sub kategori tidak tersedia!");
      return;
    }

    setLoading(true);

    try {
      await api.put(`/akun/${data.id_akun}`, {
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

  // ==========================
  // UI
  // ==========================
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
          className="bg-white w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-lg p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-700">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
            EDIT AKUN
          </h3>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {/* SUB KATEGORI (READONLY) */}
            <div>
              <label className="text-sm text-gray-700">Sub Kategori Akun</label>
              <div className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed flex justify-between items-center">
                {selectedSubKategori
                  ? `${selectedSubKategori.kode_sub_kategori_akun} - ${selectedSubKategori.sub_kategori_akun}`
                  : "Tidak tersedia"}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* KODE */}
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

            {/* AKUN */}
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

            {/* SALDO DEBIT */}
            <div>
              <label className="text-sm text-gray-700">Saldo Awal Debit</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-500 mr-2">Rp</span>
                <input
                  type="number"
                  value={saldoDebit}
                  onChange={(e) => setSaldoDebit(e.target.valueAsNumber)}
                  className="w-full outline-none text-gray-800"
                />
              </div>
            </div>

            {/* SALDO KREDIT */}
            <div>
              <label className="text-sm text-gray-700">Saldo Awal Kredit</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-500 mr-2">Rp</span>
                <input
                  type="number"
                  value={saldoKredit}
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
