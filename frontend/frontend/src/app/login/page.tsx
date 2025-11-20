"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuccessAlert from "@/components/SuccessAlert";

export default function LoginScreen() {
  const router = useRouter();

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
        // Token valid, arahkan ke dashboard sesuai role
        redirectToDashboard(data.data.role);
      } else {
        // Token tidak valid, hapus dari storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
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

        {/* Error Alert */}
        {error && (
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
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A3E85] placeholder-gray-500 text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A3E85] placeholder-gray-500 text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              disabled={isLoading}
              className="accent-[#1A3E85] disabled:cursor-not-allowed"
            />
            Ingat saya
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#004CDF] text-white py-2 rounded-full font-semibold shadow-md hover:bg-[#1A3E85] transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
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
        </form>
      </div>

      {/* Alert sukses */}
      <SuccessAlert show={showSuccess} />
    </div>
  );
}