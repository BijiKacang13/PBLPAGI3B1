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
  });

  const [accounts, setAccounts] = useState([
    { id: 1, akun: "", debit: "", kredit: "" }
  ]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAccountChange = (id: number, field: string, value: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  const addAccount = () => {
    const newId = Math.max(...accounts.map(a => a.id)) + 1;
    setAccounts([...accounts, { id: newId, akun: "", debit: "", kredit: "" }]);
  };

  const removeAccount = (id: number) => {
    if (accounts.length > 1) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", { ...form, accounts });
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-base md:text-lg font-bold text-gray-800 tracking-wide">
              TAMBAH TRANSAKSI
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/80 transition-colors duration-200"
              aria-label="Tutup"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Isi form scrollable */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
            {/* Tanggal */}
            <div className="space-y-1.5">
              <label className="block text-gray-700 font-medium text-sm">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-1.5">
              <label className="block text-gray-700 font-medium text-sm">
                Keterangan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="keterangan"
                placeholder="Masukkan keterangan transaksi"
                value={form.keterangan}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Grid untuk form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Jenis Transaksi */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-medium text-sm">
                  Jenis Transaksi
                </label>
                <select
                  name="jenis"
                  value={form.jenis}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Jenis</option>
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>

              {/* Unit */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-medium text-sm">
                  Unit
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Unit</option>
                  <option value="unit1">Unit 1</option>
                  <option value="unit2">Unit 2</option>
                </select>
              </div>

              {/* Divisi */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-medium text-sm">
                  Divisi
                </label>
                <select
                  name="divisi"
                  value={form.divisi}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Divisi</option>
                  <option value="divisi1">Divisi 1</option>
                  <option value="divisi2">Divisi 2</option>
                </select>
              </div>

              {/* Kegiatan */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-medium text-sm">
                  Kegiatan
                </label>
                <select
                  name="kegiatan"
                  value={form.kegiatan}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Kegiatan</option>
                  <option value="kegiatan1">Kegiatan 1</option>
                  <option value="kegiatan2">Kegiatan 2</option>
                </select>
              </div>
            </div>

            {/* Sumber Anggaran - Full width */}
            <div className="space-y-1.5">
              <label className="block text-gray-700 font-medium text-sm">
                Sumber Anggaran
              </label>
              <select
                name="sumber"
                value={form.sumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Pilih Sumber Anggaran</option>
                <option value="sumber1">Sumber 1</option>
                <option value="sumber2">Sumber 2</option>
              </select>
            </div>

            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Detail Akun
              </h3>

              {/* Render multiple accounts */}
              {accounts.map((account, index) => (
                <div key={account.id} className="space-y-4 mb-6 pb-6 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">
                      
                    </span>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAccount(account.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Akun */}
                  <div className="space-y-1.5">
                    <label className="block text-gray-700 font-medium text-sm">
                      Akun <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={account.akun}
                      onChange={(e) => handleAccountChange(account.id, 'akun', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Pilih Akun</option>
                      <option value="kas">Kas</option>
                      <option value="bank">Bank</option>
                      <option value="piutang">Piutang</option>
                      <option value="hutang">Hutang</option>
                      <option value="modal">Modal</option>
                      <option value="pendapatan">Pendapatan</option>
                      <option value="beban">Beban</option>
                    </select>
                  </div>

                  {/* Debit & Kredit Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Debit */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-700 font-medium text-sm">
                        Debit
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                        <span className="text-gray-600 mr-2 text-sm font-medium">Rp</span>
                        <input
                          type="number"
                          value={account.debit}
                          onChange={(e) => handleAccountChange(account.id, 'debit', e.target.value)}
                          placeholder="0"
                          className="flex-1 bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Kredit */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-700 font-medium text-sm">
                        Kredit
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all">
                        <span className="text-gray-600 mr-2 text-sm font-medium">Rp</span>
                        <input
                          type="number"
                          value={account.kredit}
                          onChange={(e) => handleAccountChange(account.id, 'kredit', e.target.value)}
                          placeholder="0"
                          className="flex-1 bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tambah akun */}
              <button 
                type="button"
                onClick={addAccount}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:gap-2"
              >
                <Plus size={16} />
                Tambah Akun Lainnya
              </button>
            </div>

            {/* Spacer agar scroll tidak mentok tombol */}
            <div className="h-4"></div>
          </div>

          {/* Tombol aksi sticky */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t px-4 md:px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              type="button"
              className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 hover:shadow-md"
            >
              BATAL
            </button>
            <button 
              onClick={handleSubmit}
              type="button"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
            >
              SIMPAN
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}