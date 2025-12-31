"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuccessAlert from "@/components/SuccessAlert";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function LoginScreen() {
  const router = useRouter();
  const { isOnline, wasOffline } = useOnlineStatus();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Cek apakah sudah login saat component mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Verifikasi token dengan API
      verifyToken(token);
    }
  }, []);

  // Verifikasi token
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Simpan role ke localStorage
        if (data.data?.role) {
          localStorage.setItem("user_role", data.data.role);
        }
        // Token valid, arahkan ke dashboard sesuai role
        redirectToDashboard(data.data.role);
      } else {
        // Token tidak valid, hapus dari storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
    }
  };

  // Redirect berdasarkan role
  const redirectToDashboard = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/admin/beranda");
        break;
      case "akuntan_unit":
        router.push("/akuntan/beranda");
        break;
      case "auditor":
        router.push("/auditor/beranda");
        break;
      default:
        router.push("/admin/beranda");
    }
  };

  // app/login/page.tsx - Update handleLogin function

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Username dan password harus diisi");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login to:", `${process.env.NEXT_PUBLIC_API_URL}/login`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          remember: rememberMe,
        }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        localStorage.setItem("auth_token", data.data.token);
        localStorage.setItem("user_data", JSON.stringify(data.data.user));
        localStorage.setItem("user_role", data.data.user.role);

        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          redirectToDashboard(data.data.user.role);
        }, 2000);
      } else {
        setError(data.message || "Login gagal. Silakan coba lagi.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan koneksi. Periksa koneksi internet Anda atau URL API.");
      setIsLoading(false);
    }
  };
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#E9F0FF] overflow-y-auto relative"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div
        className={`bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-lg text-center transition-all duration-300 ease-in-out
        ${isKeyboardVisible ? "translate-y-[-40px]" : "translate-y-0"}`}
      >
        {/* Header - RESPONSIF */}
        <div className="flex items-center justify-center mb-6 gap-2 sm:gap-2 md:gap-3">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Logo Yayasan"
            className="w-16 h-16 sm:w-18 sm:h-18 md:w-[85px] md:h-[85px] object-contain"
          />

          {/* Divider */}
          <div className="w-[3px] h-8 sm:h-10 bg-[#1A3E85]"></div>

          {/* Text SIA + Yayasan Darussalam */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-[#1A3E85] leading-none">
              SIA
            </h1>
            <div className="flex flex-col justify-center text-left">
              <p className="text-[10px] sm:text-[14px] md:text-[14px] font-bold text-[#1A3E85] leading-tight uppercase">
                YAYASAN
              </p>
              <p className="text-[10px] sm:text-[14px] md:text-[14px] font-bold text-[#1A3E85] leading-tight uppercase">
                DARUSSALAM
              </p>
            </div>
          </div>
        </div>

        {/* Subjudul */}
        <p className="text-gray-400 text-sm mb-8 -mt-6">
          Sistem Informasi Akuntansi <br /> Yayasan Darussalam
        </p>

        {/* Error Alert */}
        {error && isOnline && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 text-left" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Nama Pengguna"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || !isOnline}
            className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 placeholder-gray-500 text-gray-700 disabled:cursor-not-allowed transition-colors
              ${!isOnline
                ? 'border-gray-200 bg-gray-100 text-gray-400'
                : 'border-gray-300 focus:ring-[#1A3E85] disabled:bg-gray-100'
              }`}
          />
          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || !isOnline}
            className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 placeholder-gray-500 text-gray-700 disabled:cursor-not-allowed transition-colors
              ${!isOnline
                ? 'border-gray-200 bg-gray-100 text-gray-400'
                : 'border-gray-300 focus:ring-[#1A3E85] disabled:bg-gray-100'
              }`}
          />
          <label className={`flex items-center gap-2 text-sm ${!isOnline ? 'text-gray-400' : 'text-gray-600'}`}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              disabled={isLoading || !isOnline}
              className="accent-[#1A3E85] disabled:cursor-not-allowed"
            />
            Ingat saya
          </label>
          <button
            type="submit"
            disabled={isLoading || !isOnline}
            className={`w-full py-2 rounded-full font-semibold shadow-md transition flex items-center justify-center
              ${!isOnline
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#004CDF] text-white hover:bg-[#1A3E85] disabled:bg-gray-400 disabled:cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </button>

          {/* Pesan Offline di bawah tombol Masuk */}
          {!isOnline && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                  />
                </svg>
                <span className="text-sm font-medium text-red-600">
                  Koneksi anda terputus, hubungkan ulang
                </span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Alert sukses */}
      <SuccessAlert show={showSuccess} />
    </div>
  );
}