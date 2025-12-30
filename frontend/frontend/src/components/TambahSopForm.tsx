"use client";

import { useState, useRef } from "react";

interface TambahSOPFormProps {
  onClose: () => void;
  onSubmit: (data: SOPData) => void;
}

export interface SOPData {
  id: string;
  keterangan: string;
  file: string | null;
  fileName: string;
  createdAt: string;
}

export default function TambahSOPForm({ onClose, onSubmit }: TambahSOPFormProps) {
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler untuk membuka file manager
  const handlePilihFile = () => {
    fileInputRef.current?.click();
  };

  // Handler ketika file dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // Handler untuk hapus file yang sudah dipilih
  const handleHapusFile = () => {
    setFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handler untuk tombol Batal
  const handleBatal = () => {
    setKeterangan("");
    setFile(null);
    setFileName("");
    onClose();
  };

  // Handler untuk tombol Simpan    
  const handleSimpan = async () => {
      if (!keterangan.trim()) {
        alert("Keterangan tidak boleh kosong!");
        return;
      }

      if (!file) {
        alert("File wajib diunggah!");
        return;
      }

      const formData = new FormData();
      formData.append("keterangan", keterangan.trim());
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert("Gagal menyimpan SOP");
        return;
      }

      onSubmit({
        id: result.data.id_sop,
        keterangan: result.data.keterangan,
        file: result.data.file,
        fileName: result.data.file.split("/").pop(),
        createdAt: result.data.created_at,
      });

      handleBatal();
    };

  return (
    <div className="p-6 space-y-6">
      {/* Input Keterangan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keterangan
        </label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Masukkan keterangan SOP..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Upload File Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File
        </label>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tombol Pilih File */}
          <button
            type="button"
            onClick={handlePilihFile}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Pilih File
          </button>

          {/* Input untuk menampilkan nama file (read-only) */}
          <input
            type="text"
            value={fileName}
            readOnly
            placeholder="Tidak ada file yang dipilih"
            className="flex-[2] px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-default"
          />

          {/* Tombol hapus file (muncul jika ada file) */}
          {file && (
            <button
              type="button"
              onClick={handleHapusFile}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Info file yang dipilih */}
        {file && (
          <div className="mt-2 text-sm text-gray-500">
            Ukuran: {(file.size / 1024).toFixed(2)} KB
          </div>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleBatal}
          className="px-6 py-2 bg-cyan-400 text-white rounded-full hover:bg-cyan-500 transition-colors font-medium"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSimpan}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}