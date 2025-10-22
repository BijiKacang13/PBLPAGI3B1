import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

type TambahSubKategoriProps = {
  open: boolean;
  onClose: () => void;
};


export default function TambahSubKategori({ open, onClose }: TambahSubKategoriProps) {
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
            {/* Tombol close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Judul */}
            <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
              TAMBAH SUB KATEGORI AKUN
            </h3>

            <form className="flex flex-col gap-3">
              {/* Dropdown versi baru */}
              <div className="relative">
                <label className="block text-sm text-gray-700 mb-1">
                  Kategori Akun
                </label>

                {/* Tombol dropdown */}
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full border border-gray-300 bg-white/60 backdrop-blur-md rounded-xl px-4 py-2 text-sm flex justify-between items-center cursor-pointer shadow-sm hover:border-blue-400 transition"
                >
                  <span
                    className={`${
                      kategori ? "text-gray-800" : "text-gray-400"
                    } truncate`}
                  >
                    {kategori || "Pilih Kategori Akun"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown list */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute w-full bg-white/80 backdrop-blur-lg border border-gray-200 shadow-xl rounded-2xl mt-2 py-2 max-h-56 overflow-y-auto z-10"
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

              {/* Input Kode */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Kode</label>
                <input
                  type="text"
                  placeholder="Masukkan kode"
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {/* Input Sub Kategori */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Sub Kategori Akun
                </label>
                <input
                  type="text"
                  placeholder="Masukkan sub kategori"
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-red-600 transition"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-blue-700 transition"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
