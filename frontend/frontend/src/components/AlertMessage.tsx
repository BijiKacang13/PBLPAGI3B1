"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { useEffect } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertMessageProps {
    show: boolean;
    type?: AlertType;
    message: string;
    subtitle?: string;
    onClose?: () => void;
    autoCloseMs?: number;
}

const alertConfig = {
    success: {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-400",
        textColor: "text-blue-600",
        iconColor: "text-blue-500",
        Icon: Check,
    },
    error: {
        bgColor: "bg-red-50",
        borderColor: "border-red-400",
        textColor: "text-red-600",
        iconColor: "text-red-500",
        Icon: X,
    },
    warning: {
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-400",
        textColor: "text-yellow-600",
        iconColor: "text-yellow-500",
        Icon: AlertTriangle,
    },
    info: {
        bgColor: "bg-gray-50",
        borderColor: "border-gray-400",
        textColor: "text-gray-600",
        iconColor: "text-gray-500",
        Icon: Info,
    },
};

export default function AlertMessage({
    show,
    type = "success",
    message,
    subtitle,
    onClose,
    autoCloseMs = 3000,
}: AlertMessageProps) {
    const config = alertConfig[type];
    const IconComponent = config.Icon;

    // Auto-close after specified time
    useEffect(() => {
        if (show && onClose && autoCloseMs > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseMs);
            return () => clearTimeout(timer);
        }
    }, [show, onClose, autoCloseMs]);

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
                        className="relative flex flex-col items-center justify-center px-8 py-8 rounded-2xl bg-white shadow-xl border border-gray-200 max-w-sm mx-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 160,
                            damping: 18,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon with animation */}
                        <motion.div
                            className={`relative mb-3 flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 180,
                                damping: 15,
                            }}
                        >
                            {/* Spinning circle */}
                            <motion.div
                                className={`absolute w-14 h-14 border-[3px] ${config.borderColor} border-t-transparent rounded-full`}
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 0.6,
                                    ease: "linear",
                                }}
                                style={{ willChange: "transform" }}
                            />

                            {/* Icon appears */}
                            <motion.div
                                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{
                                    delay: 0.6,
                                    duration: 0.4,
                                    type: "spring",
                                    stiffness: 140,
                                }}
                            >
                                <IconComponent className={`w-12 h-12 ${config.iconColor}`} />
                            </motion.div>
                        </motion.div>

                        {/* Main text */}
                        <motion.h1
                            className={`${config.textColor} text-lg font-bold mb-1 text-center`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                        >
                            {message}
                        </motion.h1>

                        {/* Subtitle */}
                        {subtitle && (
                            <motion.p
                                className="text-gray-500 text-sm text-center"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.3 }}
                            >
                                {subtitle}
                            </motion.p>
                        )}

                        {/* Close button for error/warning */}
                        {(type === "error" || type === "warning") && onClose && (
                            <motion.button
                                className={`mt-4 px-6 py-2 rounded-full text-white text-sm font-medium ${type === "error" ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"
                                    } transition-colors`}
                                onClick={onClose}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.3 }}
                            >
                                Tutup
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
