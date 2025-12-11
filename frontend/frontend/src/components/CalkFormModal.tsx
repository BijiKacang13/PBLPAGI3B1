"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { FormEvent } from "react";

type FormState = {
  keterangan: string;
  file: File | null;
};

type Props = {
  open: boolean;
  mode: "add" | "edit";
  loading?: boolean;
  formData: FormState;
  onChange: (data: FormState) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
  onDelete?: () => void;
};

export default function CalkFormModal({
  open,
  mode,
  loading,
  formData,
  onChange,
  onSubmit,
  onClose,
  onDelete,
}: Props) {
  if (!open) return null;

  const title = mode === "add" ? "Tambah CALK" : "Edit CALK";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>

            <form onSubmit={onSubmit}>
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-center">{title}</h3>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Keterangan</label>
                  <input
                    type="text"
                    value={formData.keterangan}
                    onChange={(e) =>
                      onChange({
                        ...formData,
                        keterangan: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    {mode === "add" ? "File" : "Ganti File (Opsional)"}
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      onChange({
                        ...formData,
                        file: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                    required={mode === "add"}
                  />
                  {mode === "edit" && (
                    <small className="text-gray-500 text-xs">
                      Biarkan kosong jika tidak ingin mengganti file
                    </small>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-gray-200 flex justify-between items-center gap-3 flex-wrap">
                {mode === "edit" && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Hapus CALK
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#7CA6FF] text-white rounded-lg hover:bg-[#6a95ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

