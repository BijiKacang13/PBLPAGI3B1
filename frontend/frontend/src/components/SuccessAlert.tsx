"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessAlertProps {
  show: boolean;
  onClose?: () => void;
}

export default function SuccessAlert({ show, onClose }: SuccessAlertProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative flex flex-col items-center justify-center px-8 py-6 rounded-2xl bg-white/95 border border-gray-200"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 160,
              damping: 18,
            }}
          >
            {/* Ceklis animasi ringan */}
            <motion.div
              className="relative mb-3 flex items-center justify-center w-20 h-20 rounded-full bg-blue-50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 15,
              }}
            >
              {/* Lingkaran berputar */}
              <motion.div
                className="absolute w-14 h-14 border-[3px] border-blue-400 border-t-transparent rounded-full"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.9,
                  ease: "linear",
                }}
                style={{ willChange: "transform" }}
              />

              {/* Ceklis muncul */}
              <motion.div
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  delay: 0.9,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 140,
                }}
              >
                <Check className="w-12 h-12 text-blue-500" />
              </motion.div>
            </motion.div>

            {/* Teks utama */}
            <motion.h1
              className="text-blue-600 text-lg font-bold mb-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              BERHASIL MASUK
            </motion.h1>

            {/* Subteks */}
            {/* <motion.p
              className="text-gray-500 text-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              Selamat datang di SIA Yayasan Darussalam!
            </motion.p> */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
