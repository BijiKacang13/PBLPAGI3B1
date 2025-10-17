"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#E9F0FF] to-[#E9F0FF] text-gray-800 relative overflow-hidden">
      {/* Efek cahaya lembut di belakang */}
      <motion.div
        className="absolute w-72 h-72 bg-[#1A3E85] rounded-full blur-3xl opacity-30"
        initial={{ scale: 0 }}
        animate={{ scale: 1.4 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {/* Konten Utama */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center z-10"
      >
        {/* Logo atau Singkatan */}
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold tracking-widest text-[#1A3E85]"
          style={{ textShadow: "0 0 15px rgba(14, 165, 233, 0.3)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.2 }}
        >
          SIA
        </motion.h1>

        {/* Subjudul */}
        <motion.p
          className="text-gray-600 mt-3 text-lg tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Sistem Informasi Akuntansi
        </motion.p>

        {/* Tambahan teks baru */}
        <motion.p
          className="text-gray-600 text-sm mt-1 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          Yayasan Darussalam
        </motion.p>
      </motion.div>

      {/* Animasi teks loading */}
      <motion.div
        className="absolute bottom-10 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 2.3,
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        Memuat aplikasi...
      </motion.div>
    </div>
  );
}
