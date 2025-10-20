"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserPlus } from "lucide-react";
import SuccessAlert from "@/components/SuccessAdd";

export default function TambahPengguna() {
  const router = useRouter();

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    tipe: "",
    unit: "",
    nama: "",
    email: "",
    telp: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Deteksi keyboard di mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const isKeyboard = window.innerHeight < window.screen.height * 0.75;
      setIsKeyboardVisible(isKeyboard);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    router.push("/akun");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      router.push("/akun");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1">
          <img
            src="/logo.png"
            alt="Logo Yayasan"
            width={55}
            height={55}
            className="w-16 h-16 object-contain"
          />
          <div className="w-[2px] h-10 bg-[#1A3E85]"></div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <h1 className="text-3xl font-extrabold text-[#1A3E85] tracking-wide">
                SIA
              </h1>
              <p className="text-xs font-semibold text-[#1A3E85] tracking-wide leading-tight">
                <span className="inline-block w-[70px] text-left">YAYASAN</span>
                <br />
                <span className="inline-block w-[70px] text-left">DARUSSALAM</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-full bg-blue-200 border border-blue-200">
          <User size={20} className="text-blue-900 cursor-pointer" />
        </div>
      </header>

      {/* Konten utama */}
      <main
        className={`flex flex-col items-center mt-4 px-4 transition-all duration-300 ease-in-out ${
          isKeyboardVisible ? "translate-y-[-20px]" : "translate-y-0"
        }`}
      >
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <h2 className="font-semibold text-center mb-4">TAMBAH PENGGUNA</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipe Pengguna */}
            <select
              name="tipe"
              value={formData.tipe}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700"
            >
              <option value="">Tipe Pengguna</option>
              <option value="akuntan">Akuntan Unit</option>
              <option value="auditor">Auditor</option>
            </select>

            <h2 className="font-semibold text-gray-700 mt-6">Profil</h2>

            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700"
            >
              <option value="">Pilih Unit</option>
              <option value="tk">TK</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
            </select>

            <input
              type="text"
              name="nama"
              placeholder="Nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400"
            />

            <input
              type="tel"
              name="telp"
              placeholder="Telp"
              value={formData.telp}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400"
            />

            <h2 className="font-semibold text-gray-700 mt-6">Akun Pengguna</h2>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400"
            />

            {/* Tombol aksi */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#004CDF] text-white font-semibold shadow-md hover:bg-[#1A3E85] transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      <SuccessAlert show={showSuccess} />
    </div>
  );
}
