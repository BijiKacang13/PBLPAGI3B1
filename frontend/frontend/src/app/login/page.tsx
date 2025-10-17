"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuccessAlert from "@/components/SuccessAlert";

export default function LoginScreen() {
  const router = useRouter();

  const [rememberMe, setRememberMe] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Deteksi keyboard muncul di mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const isKeyboard = window.innerHeight < window.screen.height * 0.75;
      setIsKeyboardVisible(isKeyboard);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Simulasi login sukses
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      router.push("/beranda"); // arahkan ke halaman dashboard
    }, 2000);
  };

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#E9F0FF] overflow-y-auto relative"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div
        className={`bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-md text-center transition-all duration-300 ease-in-out
        ${isKeyboardVisible ? "translate-y-[-40px]" : "translate-y-0"}`}
      >
        {/* Header */}
        <div className="flex items-center text-justify-center mb-4 gap-2">
          <img
            src="/logo.png"
            alt="Logo Yayasan"
            width={55}
            height={55}
            className="w-22 h-22 object-contain"
          />
          <div className="w-[3px] h-12 bg-[#1A3E85]"></div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <h1 className="text-5xl font-extrabold text-[#1A3E85] tracking-wide">
                SIA
              </h1>
              <p className="text-sm font-semibold text-[#1A3E85] tracking-wide leading-tight">
                <span className="inline-block w-[80px] text-left">YAYASAN</span>
                <br />
                <span className="inline-block w-[80px] text-left">DARUSSALAM</span>
              </p>
            </div>
          </div>
        </div>

        {/* Subjudul */}
        <p className="text-gray-400 text-sm mb-8 -mt-6">
          Sistem Informasi Akuntansi <br /> Yayasan Darussalam
        </p>

        {/* Form */}
        <form className="space-y-4 text-left" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Nama Pengguna"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A3E85] placeholder-gray-500 text-gray-700"
          />
          <input
            type="password"
            placeholder="Kata Sandi"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A3E85] placeholder-gray-500 text-gray-700"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="accent-[#1A3E85]"
            />
            Ingat saya
          </label>
          <button
            type="submit"
            className="w-full bg-[#004CDF] text-white py-2 rounded-full font-semibold shadow-md hover:bg-[#1A3E85] transition"
          >
            Masuk
          </button>
        </form>
      </div>

      {/* Alert sukses */}
      <SuccessAlert show={showSuccess} />
    </div>
  );
}
