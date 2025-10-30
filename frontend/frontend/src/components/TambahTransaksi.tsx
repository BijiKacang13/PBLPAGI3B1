"use client";

import { X, Calendar, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function TambahTransaksi({ open, onClose }: any) {
  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    jenis: "",
    unit: "",
    divisi: "",
    kegiatan: "",
    sumber: "",
    akun: "",
    debit: "",
    kredit: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-800">
              TAMBAH TRANSAKSI
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Isi form scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {/* Tanggal */}
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Tanggal</label>
              <div className="flex items-center border rounded-full px-3 py-2">
                <input
                  type="text"
                  name="tanggal"
                  placeholder="hh/bb/tttt"
                  value={form.tanggal}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <Calendar size={18} className="text-gray-500" />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Keterangan
              </label>
              <input
                type="text"
                name="keterangan"
                placeholder="Masukkan keterangan"
                value={form.keterangan}
                onChange={handleChange}
                className="w-full border rounded-full px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Dropdown umum */}
            {[
              { label: "Jenis Transaksi", name: "jenis" },
              { label: "Unit", name: "unit" },
              { label: "Divisi", name: "divisi" },
              { label: "Kegiatan", name: "kegiatan" },
              { label: "Sumber Anggaran", name: "sumber" },
            ].map((item) => (
              <div key={item.name}>
                <label className="block text-gray-700 mb-1 text-sm">
                  {item.label}
                </label>
                <select
                  name={item.name}
                  value={(form as any)[item.name]}
                  onChange={handleChange}
                  className="w-full border rounded-full px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Pilih {item.label}</option>
                  <option value="contoh1">Contoh 1</option>
                  <option value="contoh2">Contoh 2</option>
                </select>
              </div>
            ))}

            <hr className="my-2" />

            {/* Akun */}
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Akun</label>
              <select
                name="akun"
                value={form.akun}
                onChange={handleChange}
                className="w-full border rounded-full px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Pilih Akun</option>
                <option value="kas">Kas</option>
                <option value="bank">Bank</option>
              </select>
            </div>

            {/* Debit */}
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Debit</label>
              <div className="flex items-center border rounded-full px-3 py-2 bg-gray-50">
                <span className="text-gray-500 mr-2 text-sm">Rp</span>
                <input
                  type="number"
                  name="debit"
                  value={form.debit}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Kredit */}
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Kredit</label>
              <div className="flex items-center border rounded-full px-3 py-2 bg-gray-50">
                <span className="text-gray-500 mr-2 text-sm">Rp</span>
                <input
                  type="number"
                  name="kredit"
                  value={form.kredit}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Tambah akun */}
            <button className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-1">
              <Plus size={14} />
              Tambah Akun
            </button>

            {/* Spacer agar scroll tidak mentok tombol */}
            <div className="h-16"></div>
          </div>

          {/* Tombol aksi sticky */}
          <div className="flex justify-end gap-3 border-t px-5 py-3 bg-white sticky bottom-0">
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-full text-sm"
            >
              BATAL
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-full text-sm">
              SIMPAN
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
