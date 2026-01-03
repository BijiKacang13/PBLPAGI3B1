"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/axiosClient";

type EditRapbsKegiatanProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: {
    id_budget_rapbs_kegiatan: number;
    id_kegiatan: string;
    id_unit: string;
    kode_kegiatan: string;
    kegiatan: string;
    budget_rapbs_kegiatan: number;
    items?: any[];
  } | null;
};

export default function EditRapbsKegiatan({
  open,
  onClose,
  onSuccess,
  data,
}: EditRapbsKegiatanProps) {
  const [kode, setKode] = useState("");
  const [kegiatan, setKegiatan] = useState("");
  const [budgetRapbs, setBudgetRapbs] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // set data saat modal dibuka
  useEffect(() => {
    if (open && data) {
      setKode(data.kode_kegiatan ?? "");
      setKegiatan(data.kegiatan ?? "");
      const initialBudget = Number(data.budget_rapbs_kegiatan);
      setBudgetRapbs(Number.isNaN(initialBudget) ? 0 : initialBudget);
    }
  }, [open, data]);

  if (!open || !data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeBudget = Number.isNaN(budgetRapbs) ? 0 : budgetRapbs;

    setLoading(true);
    try {
      // Get user's unit ID from localStorage
      const userRole = localStorage.getItem("user_role");
      let userUnitId = 1; // Default to 1 (Yayasan) for admin

      // For akuntan_unit, get their unit ID
      if (userRole === "akuntan_unit") {
        const storedUnitId = localStorage.getItem("user_unit_id");
        if (storedUnitId) {
          userUnitId = parseInt(storedUnitId, 10);
        }
      }

      const payload = {
        id_kegiatan: data.id_kegiatan,
        id_unit: userUnitId,
        budget_rapbs_kegiatan: safeBudget,
      };

      console.log("Kirim payload RAPBS:", payload);

      // Pakai wrapper api
      await api.post("/budget-rapbs-kegiatan", payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Gagal update RAPBS kegiatan:", err);
      alert(err.message || "Gagal mengubah budget RAPBS!");
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
              <label className="text-sm text-gray-700">Kode Kegiatan</label>
              <input
                type="text"
                readOnly
                value={kode}
                className="w-full border rounded-full px-4 py-2 text-sm bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Nama Kegiatan</label>
              <input
                type="text"
                readOnly
                value={kegiatan}
                className="w-full border rounded-full px-4 py-2 text-sm bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Budget RAPBS</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-500 mr-2">Rp</span>
                <input
                  type="number"
                  value={budgetRapbs}
                  onChange={(e) =>
                    setBudgetRapbs(e.target.valueAsNumber || 0)
                  }
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
