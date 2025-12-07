"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type EditRapbsAkunProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: {
    id_akun: number;
    kode_akun: string;
    akun: string;
    budget: number;
  } | null;
};

export default function EditRapbsAkun({
  open,
  onClose,
  onSuccess,
  data,
}: EditRapbsAkunProps) {
  const API_URL = "http://127.0.0.1:8000/api";

  const [kode, setKode] = useState("");
  const [akun, setAkun] = useState("");
  const [budget, setBudget] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // SET DATA SAAT MODAL DIBUKA
  useEffect(() => {
    if (open && data) {
      setKode(data.kode_akun || "");
      setAkun(data.akun || "");

      const initialBudget = Number(data.budget);
      setBudget(Number.isNaN(initialBudget) ? 0 : initialBudget);
    }
  }, [open, data]);

  if (!open || !data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const safeBudget = Number.isNaN(budget) ? 0 : budget;

    setLoading(true);
    try {
      const payload = {
        id_akun: data.id_akun,
        id_unit: 1,
        budget_rapbs_akun: safeBudget,
      };

      console.log("Kirim payload RAPBS:", payload);

      await axios.post(`${API_URL}/budget-rapbs-akun`, payload);

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Gagal update RAPBS akun:", err);
      alert("Gagal mengubah budget RAPBS!");
    } finally {
      setLoading(false);
    }
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
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
            EDIT BUDGET RAPBS
          </h3>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-700">Kode Akun</label>
              <input
                type="text"
                readOnly
                value={kode}
                className="w-full border rounded-full px-4 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Nama Akun</label>
              <input
                type="text"
                readOnly
                value={akun}
                className="w-full border rounded-full px-4 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Budget RAPBS</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-500 mr-2">Rp</span>
                <input
                  type="number"
                  value={Number.isNaN(budget) ? 0 : budget}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber;
                    setBudget(Number.isNaN(val) ? 0 : val);
                  }}
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
