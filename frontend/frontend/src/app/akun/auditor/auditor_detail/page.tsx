"use client";

import { useState, useEffect } from "react";
import { UserPlus, Eye, EyeOff, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NavbarBottom from "@/components/NavbarBottom";
import SuccessAlert from "@/components/SuccessAlert";

// Delete Confirmation Modal
const DeleteModal = ({
  show,
  onClose,
  onConfirm
}: {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4">
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md w-full pointer-events-auto shadow-2xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">Konfirmasi Hapus</h3>
              <p className="text-gray-700 mb-6">Apakah Anda yakin ingin menghapus pengguna ini?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function AuditorDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const [formData, setFormData] = useState({
    id_auditor: "",
    nama: "",
    email: "",
    telp: "",
    username: "",
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // Load data detail auditor
  const loadAuditorDetail = async () => {
    if (!id) {
      setError("ID auditor tidak ditemukan");
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      setError("");
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/auditor/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || `Failed to fetch data: ${response.status}`);
      }

      if (result.success && result.data) {
        const data = result.data;

        // Set form data
        setFormData({
          id_auditor: data.id_auditor || "",
          nama: data.user?.nama || "",
          email: data.email || "",
          telp: data.telp || "",
          username: data.user?.username || "",
          old_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Gagal memuat data auditor";
      setError(errorMessage);
      console.error("Error loading auditor detail:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAuditorDetail();
    } else {
      setError("ID auditor tidak ditemukan");
      setIsLoadingData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");

    if (!id) {
      setError("ID auditor tidak ditemukan");
      return;
    }

    // Validasi password jika diisi
    if (formData.new_password) {
      if (!formData.old_password) {
        setError("Password lama harus diisi!");
        return;
      }
      if (formData.new_password !== formData.new_password_confirmation) {
        setError("Password baru dan konfirmasi tidak cocok!");
        return;
      }
      if (formData.new_password.length < 8) {
        setError("Password minimal 8 karakter!");
        return;
      }
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      // Prepare data untuk update
      const updateData: any = {
        nama: formData.nama,
        username: formData.username,
        email: formData.email,
        telp: formData.telp,
      };

      // Tambahkan password jika diisi
      if (formData.new_password) {
        updateData.old_password = formData.old_password;
        updateData.new_password = formData.new_password;
        updateData.new_password_confirmation = formData.new_password_confirmation;
      }

      const response = await fetch(`${API_BASE_URL}/auditor/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors with details
        if (response.status === 422 && result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(", ");
          throw new Error(errorMessages || result.message || "Validasi gagal");
        }
        throw new Error(result.message || result.error || "Gagal mengupdate data");
      }

      if (result.success) {
        setSuccessMessage("BERHASIL MENGUBAH AKUN");
        setShowSuccess(true);

        // Reset password fields
        setFormData((prev) => ({
          ...prev,
          old_password: "",
          new_password: "",
          new_password_confirmation: "",
        }));

        // Hide success alert dan redirect setelah 2 detik
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/akun/auditor");
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Gagal mengupdate data auditor";
      setError(errorMessage);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
      console.error("Error updating auditor:", err);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) {
      setError("ID auditor tidak ditemukan");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/auditor/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Gagal menghapus data");
      }

      if (result.success) {
        setSuccessMessage("BERHASIL MENGHAPUS AKUN");
        setShowSuccess(true);
        // Redirect setelah 2 detik
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/akun/auditor");
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Gagal menghapus auditor";
      setError(errorMessage);
      console.error("Error deleting auditor:", err);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/akun/auditor");
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#004CDF] mx-auto mb-3" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">ID auditor tidak ditemukan</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#004CDF] text-white rounded-lg hover:bg-[#003BB8] transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 w-full pb-20 sm:pb-6">
        <div className="max-w-5xl mx-auto p-3 sm:p-6 lg:p-8">

          {/* Back Button - Desktop */}
          <button
            onClick={handleBack}
            className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
            disabled={isLoading}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="sm:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
                    disabled={isLoading}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    <h5 className="text-lg sm:text-xl font-semibold text-black">Detail Pengguna</h5>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-4 sm:mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-6 sm:space-y-8">

                {/* Profil Section */}
                <div>
                  <h6 className="font-semibold text-base sm:text-lg mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#004CDF] rounded"></div>
                    Profil
                  </h6>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="contoh@email.com"
                        className="w-full px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="telp"
                        value={formData.telp}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Akun Pengguna Section */}
                <div>
                  <h6 className="font-semibold text-base sm:text-lg mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#004CDF] rounded"></div>
                    Akun Pengguna
                  </h6>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Username untuk login"
                        className="w-full px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* GANTI PASSWORD */}
                <div>
                  <h6 className="font-semibold text-base sm:text-lg mb-2 text-gray-800 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#004CDF] rounded"></div>
                    Ganti Password
                  </h6>
                  <p className="text-sm text-gray-500 mb-4">(Kosongkan jika tidak ingin mengubah)</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? "text" : "password"}
                          name="old_password"
                          value={formData.old_password}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Masukkan password lama"
                          className="w-full px-4 py-3 pr-12 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          disabled={isLoading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 transition disabled:opacity-50"
                        >
                          {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Minimal 8 karakter"
                          className="w-full px-4 py-3 pr-12 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={isLoading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 transition disabled:opacity-50"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="new_password_confirmation"
                          value={formData.new_password_confirmation}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Ulangi password baru"
                          className="w-full px-4 py-3 pr-12 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 transition disabled:opacity-50"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* HAPUS PENGGUNA */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                    Hapus Pengguna
                  </button>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full sm:flex-1 bg-gradient-to-r from-[#004CDF] to-[#0066FF] text-white font-semibold py-3 rounded-lg hover:from-[#003BB8] hover:to-[#0052CC] active:from-[#002E99] active:to-[#0047B3] transition shadow-md hover:shadow-lg text-sm sm:text-base order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Update</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-gray-400 text-xs text-center mt-6 sm:mt-8">
            Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025
          </p>
        </div>
      </main>

      {/* Success Alert */}
      <SuccessAlert show={showSuccess} message={successMessage} />

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDelete();
        }}
      />

      <NavbarBottom />
    </div>
  );
}