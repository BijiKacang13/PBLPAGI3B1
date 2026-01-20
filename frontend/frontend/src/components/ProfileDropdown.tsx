"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "../../lib/api";
import SuccessAlert from "./SuccessAlert";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useUser } from "@/context/UserContext";

// Logout Confirmation Modal
const LogoutConfirmModal = ({
  show,
  onClose,
  onConfirm,
}: {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4">
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm w-full pointer-events-auto shadow-2xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-8 h-8 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Konfirmasi Keluar
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-6 text-center">
                Apa Anda yakin ingin keluar dari sistem?
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Tentukan role awal berdasarkan URL path untuk menghindari flash
  const getInitialRole = (): string => {
    if (pathname.startsWith("/auditor")) return "auditor";
    if (pathname.startsWith("/akuntan")) return "akuntan_unit";
    return "admin";
  };

  const [userRole, setUserRole] = useState<string>(getInitialRole);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Gunakan UserContext untuk mendapatkan nama pengguna
  const { displayName, clearUserData } = useUser();

  // Fungsi untuk handle logout
  const handleLogout = async () => {
    // Tutup modal konfirmasi
    setShowLogoutConfirm(false);

    try {
      await apiClient.logout();
    } catch (error) {
      // Tetap logout meskipun ada error
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
    }

    // Clear user data dari context
    clearUserData();

    // Tutup dropdown dan tampilkan alert sukses
    setOpen(false);
    setShowLogoutAlert(true);

    // Redirect ke login setelah 2 detik
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  // Sinkronisasi dengan localStorage (untuk halaman yang tidak memiliki prefix role di URL)
  useEffect(() => {
    const storedRole = localStorage.getItem("user_role");
    if (storedRole && storedRole !== userRole) {
      setUserRole(storedRole);
    }
  }, [pathname]);

  // Biar bisa klik di luar → tertutup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tentukan apakah Log Aktivitas harus ditampilkan (tidak untuk akuntan_unit)
  const showLogAktivitas = userRole !== "akuntan_unit";

  return (
    <>
      {/* Modal Konfirmasi Logout */}
      <LogoutConfirmModal
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      {/* Success Alert untuk Logout */}
      <SuccessAlert
        show={showLogoutAlert}
        message="BERHASIL KELUAR"
        subtitle="Anda berhasil keluar dari sistem"
      />

      <div className="relative" ref={dropdownRef}>
        {/* Profile Button dengan Nama dan Role */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-50 transition"
        >
          {/* Nama dan Role Pengguna */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-800 max-w-[140px] truncate">
              {displayName}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              {userRole === "admin" ? "Administrator" : userRole.replace("_", " ")}
            </span>
          </div>
          {/* Icon Profile - Design sama seperti sebelumnya */}
          <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center shadow-sm">
            <span className="text-xl">👤</span>
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-54 bg-white shadow-xl rounded-xl p-3 z-50 border border-gray-100">
            {/* Nama Pengguna di dalam dropdown untuk mobile */}
            <div className="sm:hidden mb-3 pb-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 truncate">{displayName}</p>
              <p className="text-xs text-gray-400 capitalize">{userRole.replace("_", " ")}</p>
            </div>

            {/* SOP */}
            <button
              className="w-full border border-blue-400 text-blue-600 rounded-full py-2 mb-2 hover:bg-blue-50 transition"
              onClick={() => router.push("/sop")}
            >
              SOP
            </button>

            {/* Log Aktivitas - hanya untuk admin dan auditor */}
            {showLogAktivitas && (
              <button
                className="w-full border border-blue-400 text-blue-600 rounded-full py-2 mb-2 hover:bg-blue-50 transition whitespace-nowrap"
                onClick={() => router.push("/logaktivitas")}
              >
                LOG AKTIVITAS
              </button>
            )}

            {/* Arsip Tahunan - hanya untuk admin */}
            {userRole === "admin" && (
              <button
                className="w-full border border-amber-400 text-amber-600 rounded-full py-2 mb-2 hover:bg-amber-50 transition whitespace-nowrap"
                onClick={() => router.push("/admin/arsip-tahunan")}
              >
                ARSIP TAHUNAN
              </button>
            )}

            {/* Logout - sekarang membuka modal konfirmasi */}
            <button
              className="w-full border border-red-400 text-red-500 rounded-full py-2 hover:bg-red-50 transition"
              onClick={() => {
                setOpen(false);
                setShowLogoutConfirm(true);
              }}
            >
              LOGOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
