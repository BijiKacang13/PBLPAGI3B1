"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import { useRouter } from "next/navigation";
import TambahSOPForm, { SOPData } from "@/components/TambahSopForm";

export default function SOPPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sopList, setSopList] = useState<SOPData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handler untuk menyimpan SOP baru
  const handleSubmitSOP = (data: SOPData) => {
    setSopList([data, ...sopList]); // Tambahkan di awal array
    setIsModalOpen(false);
  };

  // Handler untuk hapus SOP
  const handleDeleteSOP = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus SOP ini?")) {
      setSopList(sopList.filter((sop) => sop.id !== id));
    }
  };

  // Handler untuk download file
  const handleDownloadFile = (file: File | null, fileName: string) => {
    if (!file) {
      alert("Tidak ada file untuk diunduh");
      return;
    }

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter SOP berdasarkan search query
  const filteredSOPs = sopList.filter((sop) =>
    sop.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sop.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format tanggal
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm md:max-w-7xl mx-auto mb-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              SOP
            </h1>
          </div>

          {/* Button Tambah SOP */}
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-large py-2 px-6 rounded-full transition-colors duration-200 mb-6"
          >
            Tambah SOP
          </button>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Daftar SOP */}
          <div className="space-y-4">
            {filteredSOPs.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada SOP"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Coba kata kunci lain"
                    : "Mulai dengan menambahkan SOP baru"}
                </p>
              </div>
            ) : (
              filteredSOPs.map((sop) => (
                <div
                  key={sop.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {sop.keterangan}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(sop.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSOP(sop.id)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-4"
                      title="Hapus SOP"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* File Info */}
                  {sop.file && (
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-8 h-8 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {sop.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(sop.file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(sop.file, sop.fileName)}
                        className="ml-3 flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Download file"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-sm text-gray-400 text-center mt-12">
          Sistem Informasi Akuntansi Yayasan Daruussalam Batam | 2025
        </p>
      </main>

      {/* Modal Overlay untuk Tambah SOP */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Tambah SOP
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Content Modal - Komponen Form */}
            <TambahSOPForm onClose={handleCloseModal} onSubmit={handleSubmitSOP} />
          </div>
        </div>
      )}

      {/* <NavbarBottom /> */}
    </div>
  );
}