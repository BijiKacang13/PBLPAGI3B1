"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

// Konfigurasi timeout (dalam milidetik)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 menit tidak aktif = logout
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // Tampilkan warning 5 menit sebelum logout

interface SessionContextType {
    showSessionExpired: () => void;
    resetSessionTimer: () => void;
    isSessionActive: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Halaman yang tidak memerlukan session tracking
const PUBLIC_PAGES = ["/login", "/offline", "/"];

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}

interface SessionProviderProps {
    children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
    const pathname = usePathname();
    const [showExpiredAlert, setShowExpiredAlert] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(WARNING_BEFORE_TIMEOUT);
    const [isSessionActive, setIsSessionActive] = useState(true);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    // Cek apakah halaman memerlukan session tracking
    const requiresSession = !PUBLIC_PAGES.includes(pathname);

    // Fungsi untuk handle session expired dari API 401
    const showSessionExpired = useCallback(() => {
        // Clear all auth data
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_unit_id");
            localStorage.removeItem("user_unit_name");
            localStorage.removeItem("last_activity");
        }

        setShowWarning(false);
        setShowExpiredAlert(true);
        setIsSessionActive(false);
    }, []);

    // Fungsi untuk logout
    const handleLogout = useCallback(() => {
        // Clear semua localStorage
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_unit_id");
            localStorage.removeItem("user_unit_name");
            localStorage.removeItem("last_activity");
        }

        setIsSessionActive(false);
        setShowWarning(false);
        setShowExpiredAlert(true);
    }, []);

    // Reset session timer - dipanggil setiap ada aktivitas user
    const resetSessionTimer = useCallback(() => {
        if (!requiresSession) return;

        // Cek apakah ada token
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token");
            if (!token) return;
        }

        // Update last activity time
        lastActivityRef.current = Date.now();
        if (typeof window !== "undefined") {
            localStorage.setItem("last_activity", String(Date.now()));
        }

        // Clear existing timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        // Hide warning if shown
        setShowWarning(false);
        setRemainingTime(WARNING_BEFORE_TIMEOUT);
        setIsSessionActive(true);

        // Set warning timeout (5 menit sebelum expired)
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(true);

            // Start countdown
            let timeLeft = WARNING_BEFORE_TIMEOUT;
            setRemainingTime(timeLeft);

            countdownRef.current = setInterval(() => {
                timeLeft -= 1000;
                setRemainingTime(Math.max(0, timeLeft));

                if (timeLeft <= 0) {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                }
            }, 1000);
        }, SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT);

        // Set logout timeout
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, SESSION_TIMEOUT);
    }, [requiresSession, handleLogout]);

    // Extend session (ketika user klik "Lanjutkan" di warning)
    const extendSession = useCallback(() => {
        resetSessionTimer();
    }, [resetSessionTimer]);

    // Track user activity
    useEffect(() => {
        if (!requiresSession) return;

        // Check if user is logged in
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        // Check last activity from localStorage (untuk sync antar tab)
        const lastActivity = localStorage.getItem("last_activity");
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > SESSION_TIMEOUT) {
                // Session sudah expired
                handleLogout();
                return;
            }
        }

        // Events yang dianggap sebagai aktivitas user
        const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];

        // Throttle untuk menghindari terlalu banyak reset
        let throttleTimer: NodeJS.Timeout | null = null;

        const handleActivity = () => {
            if (throttleTimer) return;

            throttleTimer = setTimeout(() => {
                resetSessionTimer();
                throttleTimer = null;
            }, 5000); // Throttle 5 detik
        };

        // Add event listeners
        activityEvents.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Initialize timer
        resetSessionTimer();

        // Cleanup
        return () => {
            activityEvents.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [requiresSession, resetSessionTimer, handleLogout]);

    // Listen for session-expired event from axiosClient
    useEffect(() => {
        const handleSessionExpiredEvent = () => {
            showSessionExpired();
        };

        if (typeof window !== "undefined") {
            window.addEventListener("session-expired", handleSessionExpiredEvent);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("session-expired", handleSessionExpiredEvent);
            }
        };
    }, [showSessionExpired]);

    // Format remaining time
    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Handle close expired alert
    const handleCloseExpiredAlert = useCallback(() => {
        setShowExpiredAlert(false);
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, []);

    return (
        <SessionContext.Provider value={{ showSessionExpired, resetSessionTimer, isSessionActive }}>
            {children}

            {/* Session Warning Modal - tampil 5 menit sebelum timeout */}
            <AnimatePresence>
                {showWarning && requiresSession && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Modal */}
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                                <div className="text-center">
                                    {/* Icon */}
                                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-amber-600" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Sesi Akan Berakhir
                                    </h3>

                                    {/* Message */}
                                    <p className="text-gray-600 mb-4">
                                        Anda akan otomatis keluar dalam
                                    </p>

                                    {/* Countdown */}
                                    <div className="text-4xl font-bold text-amber-600 mb-6">
                                        {formatTime(remainingTime)}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
                                        >
                                            Keluar
                                        </button>
                                        <button
                                            onClick={extendSession}
                                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                        >
                                            Lanjutkan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Session Expired Alert */}
            <AnimatePresence>
                {showExpiredAlert && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Modal */}
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                                <div className="text-center">
                                    {/* Icon */}
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Sesi Berakhir
                                    </h3>

                                    {/* Message */}
                                    <p className="text-gray-600 mb-6">
                                        Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.
                                    </p>

                                    {/* Button */}
                                    <button
                                        onClick={handleCloseExpiredAlert}
                                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                    >
                                        Login Kembali
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </SessionContext.Provider>
    );
}
