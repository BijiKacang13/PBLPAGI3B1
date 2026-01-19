"use client";

import Navbar from "@/components/Navbar";
import DashboardContent from "@/components/DashboardContent";
import { useUser } from "@/context/UserContext";

export default function BerandaAkuntan() {
  const { displayName, isLoading } = useUser();

  return (
    <>
      <Navbar />

      {/* Konten utama */}
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="w-full max-w-6xl mx-auto">
          <DashboardContent
            displayName={displayName}
            isLoading={isLoading}
            userRole="akuntan"
          />
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </div>
    </>
  );
}
