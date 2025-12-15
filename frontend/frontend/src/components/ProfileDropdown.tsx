"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("admin");

  // Ambil role dari localStorage
  useEffect(() => {
    const role = localStorage.getItem("user_role") || "admin";
    setUserRole(role);
  }, []);

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
    <div className="relative" ref={dropdownRef}>
      {/* Icon Profile */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center hover:bg-blue-300 transition"
      >
        <span className="text-xl">👤</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white shadow-xl rounded-xl p-3 z-50">

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
              className="w-full border border-blue-400 text-blue-600 rounded-full py-2 mb-2 hover:bg-blue-50 transition"
              onClick={() => router.push("/logaktivitas")}
            >
              LOG AKTIVITAS
            </button>
          )}

          {/* Logout */}
          <button
            className="w-full border border-red-400 text-red-500 rounded-full py-2 hover:bg-red-50 transition"
            onClick={() => router.push("/login")}
          >
            LOGOUT
          </button>
        </div>
      )}
    </div>
  );
}
