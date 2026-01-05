"use client";

import Navbar from "@/components/Navbar";
import TambahTransaksi from "@/components/TambahTransaksi";
import NavbarBottom from "@/components/NavbarBottom";
import SuccessAlert from "@/components/SuccessAlert";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * =========================
 * IMPORT EXCEL INTERFACE
 * =========================
 */

/** Response sukses import Excel */
interface ImportExcelSuccessResponse {
  success: true;
  message: string;
  data?: {
    success_count: number;
    failed_count: number;
    failed_rows: string[];
  };
}

/** Response validasi gagal (422) */
interface ImportExcelValidationError {
  success: false;
  message: string;
  errors: {
    file_excel?: string[];
  };
}

/** Response error umum (500) */
interface ImportExcelServerError {
  success: false;
  message: string;
  error?: string;
}

/** Union type response Import Excel */
type ImportExcelResponse =
  | ImportExcelSuccessResponse
  | ImportExcelValidationError
  | ImportExcelServerError;


export default function Akun() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("Tidak ada file");
  const [loadingImport, setLoadingImport] = useState(false);
  const router = useRouter();

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  // User role state
  const [userRole, setUserRole] = useState<string>("");

  // Get user role on mount
  useEffect(() => {
    const role = localStorage.getItem("user_role") || "";
    setUserRole(role);
  }, []);

  const handleImportExcel = async () => {
    if (!selectedFile) {
      alert("Silakan pilih file Excel terlebih dahulu");
      return;
    }

    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      alert("Error: API URL tidak dikonfigurasi");
      return;
    }

    try {
      setLoadingImport(true);

      const formData = new FormData();
      // HARUS sama dengan Laravel
      formData.append("file_excel", selectedFile);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/input-transaksi/import`;
      console.log("Uploading to:", apiUrl);
      console.log("File:", selectedFile.name, selectedFile.size, "bytes");

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          // JANGAN set Content-Type manual untuk FormData
        },
        body: formData,
      });

      const result: ImportExcelResponse = await response.json();

      // Handle 401 Unauthenticated
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_unit_id");
        localStorage.removeItem("user_unit_name");
        alert("Sesi sudah habis, silahkan login ulang");
        router.push("/login");
        return;
      }

      if (!response.ok || !result.success) {
        if ("errors" in result) {
          setErrorMessage(result.errors.file_excel?.[0] ?? "Validasi gagal");
        } else {
          setErrorMessage(result.message);
        }
        setShowErrorAlert(true);
        return;
      }

      // Check if there are failed rows
      const successCount = result.data?.success_count ?? 0;
      const failedCount = result.data?.failed_count ?? 0;
      const failedRows = result.data?.failed_rows ?? [];

      if (successCount > 0 && failedCount === 0) {
        // All success
        setSuccessMessage(`BERHASIL MENGIMPOR ${successCount} TRANSAKSI`);
        setShowSuccessAlert(true);
      } else if (successCount > 0 && failedCount > 0) {
        // Partial success
        setSuccessMessage(`${successCount} TRANSAKSI BERHASIL, ${failedCount} GAGAL`);
        setErrorDetails(failedRows);
        setShowSuccessAlert(true);
      } else {
        // All failed
        setErrorMessage(`Gagal mengimpor: ${failedCount} baris gagal`);
        setErrorDetails(failedRows);
        setShowErrorAlert(true);
      }

      // Reset setelah sukses
      setSelectedFile(null);
      setFileName("Tidak ada file");

    } catch (error: any) {
      console.error("Import Excel error:", error);

      // More specific error messages
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        setErrorMessage("Gagal terhubung ke server. Pastikan server backend berjalan.");
      } else if (error.name === "SyntaxError") {
        setErrorMessage("Server mengembalikan respons yang tidak valid");
      } else {
        setErrorMessage("Terjadi kesalahan: " + error.message);
      }
      setShowErrorAlert(true);
    } finally {
      setLoadingImport(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20 relative">

      <Navbar />

      {/* MAIN CARD RESPONSIVE */}
      <main className="w-full px-4 py-6 md:px-6 lg:px-10">
        <div className="bg-white shadow-md rounded-xl p-5 w-full mb-6">

          <div className="flex items-center gap-3">
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
            <h1 className="flex-1 text-lg md:text-lg font-bold text-gray-800 text-center sm:text-start">
              INPUT TRANSAKSI
            </h1>
            <div className="w-10 h-10" />
          </div>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/assets/templates/Template_Transaksi.xlsx`}
            download="Template_Transaksi.xlsx"
            className="text-blue-600 text-sm font-semibold underline block mb-4 text-center md:text-right"
          >
            Download Template Input Transaksi
          </a>

          {/* Import Excel & Tambah Transaksi - Hidden for auditor */}
          {userRole !== "auditor" && (
            <>
              {/* Pilih File + Input File */}
              <div className="w-full flex items-center gap-3 mb-4">

                {/* PILIH FILE BTN */}
                <label className="w-28 bg-gray-200 text-gray-700 px-1 py-2 rounded-xl 
                text-sm font-medium cursor-pointer hover:bg-gray-300 transition text-center whitespace-nowrap">
                  Pilih File
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setFileName(file.name);
                      }
                    }}
                  />
                </label>

                {/* FILE NAME */}
                <input
                  type="text"
                  value={fileName}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-xl px-3 py-2 
                  text-xs text-gray-500 outline-none bg-gray-50"
                />

                {/* IMPORT BUTTON */}
                <button
                  onClick={handleImportExcel}
                  disabled={loadingImport}
                  className="bg-blue-200 text-gray-800 px-4 py-2 rounded-xl 
                  text-xs md:text-sm font-medium hover:bg-blue-400 transition 
                  w-full md:w-auto disabled:opacity-50"
                >
                  {loadingImport ? "Mengimpor..." : "Import Excel"}
                </button>
              </div>

              {/* Tombol Tambah Transaksi */}
              <button
                onClick={() => setOpenModal(true)}
                className="w-full bg-blue-200 text-gray-800 py-2 rounded-xl font-semibold text-sm md:text-base shadow hover:bg-blue-400 transition"
              >
                Tambah Transaksi
              </button>
            </>
          )}

          {/* Message for auditor */}
          {userRole === "auditor" && (
            <div className="text-center py-4 text-gray-500 text-sm">
              <p>Anda login sebagai Auditor.</p>
              <p className="text-xs mt-1">Silahkan lihat data jurnal umum untuk melihat transaksi.</p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <p className="text-gray-400 text-xs italic mt-8 text-center leading-tight">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      {/* Modal Tambah Transaksi */}
      <TambahTransaksi open={openModal} onClose={() => setOpenModal(false)} />

      {/* Success Alert */}
      <SuccessAlert
        show={showSuccessAlert}
        message={successMessage}
        onClose={() => {
          setShowSuccessAlert(false);
          setErrorDetails([]);
        }}
      />

      {/* Error Alert */}
      {showErrorAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">GAGAL MENGIMPOR</h3>
              <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>

              {errorDetails.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto text-left">
                  <p className="text-xs font-semibold text-red-700 mb-2">Detail Error:</p>
                  {errorDetails.map((err, idx) => (
                    <p key={idx} className="text-xs text-red-600 mb-1">• {err}</p>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowErrorAlert(false);
                  setErrorDetails([]);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
