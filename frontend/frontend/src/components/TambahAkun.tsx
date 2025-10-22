"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

type TambahAkunProps = {
  open: boolean;
  onClose: () => void;
};

export default function TambahAkun({ open, onClose }: TambahAkunProps) {
  const [kategori, setKategori] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const kategoriOptions = [
    "1-0000 - AKTIVA",
    "2-0000 - KEWAJIBAN",
    "3-0000 - ASET NETO",
    "4-0000 - PENERIMAAN DAN SUMBANGAN",
    "5-0000 - BEBAN",
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Card Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 w-11/12 max-w-md mx-auto shadow-2xl relative"
          >
            {/* Tombol Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">
              TAMBAH AKUN
            </h2>

            {/* Dropdown versi baru */}
            <div className="relative mb-4">
              <label className="block text-sm text-gray-700 mb-1">
                Sub Kategori Akun
              </label>

              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm flex justify-between items-center cursor-pointer shadow-sm hover:border-blue-400 transition"
              >
                <span className={kategori ? "text-gray-800" : "text-gray-400"}>
                  {kategori || "Pilih Kategori Akun"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute w-full bg-white border border-gray-200 shadow-xl rounded-2xl mt-2 py-2 max-h-56 overflow-y-auto z-10"
                  >
                    {kategoriOptions.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setKategori(item);
                          setDropdownOpen(false);
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer rounded-lg transition ${
                          kategori === item
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

      {/* Input fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Kode Akun</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Akun</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Saldo Awal Debit
          </label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
            <span className="text-gray-500 mr-2">Rp</span>
            <input
              type="number"
              className="w-full outline-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Saldo Awal Credit
          </label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm">
            <span className="text-gray-500 mr-2">Rp</span>
            <input
              type="number"
              className="w-full outline-none text-gray-800"
            />
          </div>
        </div>
      </div>

            {/* Tombol aksi */}
            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full text-white text-sm font-semibold bg-red-500 hover:bg-red-600 transition"
              >
                BATAL
              </button>
              <button className="px-5 py-2 rounded-full text-white text-sm font-semibold bg-blue-500 hover:bg-blue-600 transition">
                SIMPAN
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
