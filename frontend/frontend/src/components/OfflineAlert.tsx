"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineAlertProps {
    isOnline: boolean;
    wasOffline: boolean;
    onNavigateOffline?: () => void;
    onNavigateBack?: () => void;
}

export function OfflineAlert({
    isOnline,
    wasOffline,
    onNavigateOffline,
}: OfflineAlertProps) {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'offline' | 'online' | null>(null);
    const [mounted, setMounted] = useState(false);
    const hasShownOfflineAlert = useRef(false);
    const hasShownOnlineAlert = useRef(false);

    // Set mounted state for client-side portal
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOnline && !hasShownOfflineAlert.current) {
            // Going offline - show alert
            setAlertType('offline');
            setShowAlert(true);
            hasShownOfflineAlert.current = true;
            hasShownOnlineAlert.current = false;

            // Auto-hide after 5 seconds (but stay visible until redirection happens)
            const hideTimer = setTimeout(() => {
                // Don't hide automatically - will be hidden when navigating
            }, 5000);

            return () => clearTimeout(hideTimer);
        } else if (isOnline && wasOffline && !hasShownOnlineAlert.current) {
            // Coming back online - show success alert
            setAlertType('online');
            setShowAlert(true);
            hasShownOnlineAlert.current = true;
            hasShownOfflineAlert.current = false;

            // Auto-hide after redirect happens
            const hideTimer = setTimeout(() => {
                setShowAlert(false);
            }, 4000);

            return () => clearTimeout(hideTimer);
        } else if (isOnline && !wasOffline) {
            // Reset state when fully online
            hasShownOfflineAlert.current = false;
            setShowAlert(false);
        }
    }, [isOnline, wasOffline]);

    // Hide alert when navigating away
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleBeforeUnload = () => setShowAlert(false);
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, []);

    // Don't render on server
    if (!mounted) return null;

    // Alert content
    const alertContent = (
        <AnimatePresence>
            {showAlert && (
                <div
                    style={{
                        position: 'fixed',
                        top: '8px',
                        left: '0',
                        right: '0',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        pointerEvents: 'none'
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            marginLeft: '16px',
                            marginRight: '16px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                            overflow: 'hidden',
                            background: alertType === 'offline'
                                ? 'linear-gradient(to right, #f97316, #ef4444)'
                                : 'linear-gradient(to right, #22c55e, #10b981)',
                            pointerEvents: 'auto'
                        }}
                    >
                        <div
                            className="px-3 py-2.5 flex items-center gap-2.5"
                            style={{
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            {/* Icon - Smaller */}
                            <div className="flex-shrink-0" style={{ flexShrink: 0 }}>
                                {alertType === 'offline' ? (
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                                    >
                                        <svg
                                            style={{ width: '22px', height: '22px', color: 'white' }}
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
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 10, stiffness: 300 }}
                                    >
                                        <svg
                                            style={{ width: '22px', height: '22px', color: 'white' }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>

                            {/* Text Content - Compact */}
                            <div className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
                                <p
                                    style={{
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        lineHeight: '1.3',
                                        margin: 0
                                    }}
                                >
                                    {alertType === 'offline'
                                        ? 'Koneksi Terputus - Beberapa fitur tidak tersedia'
                                        : 'Koneksi Terhubung! Mengalihkan...'}
                                </p>
                            </div>

                            {/* Action Button - Compact */}
                            {alertType === 'offline' && (
                                <button
                                    onClick={onNavigateOffline}
                                    style={{
                                        flexShrink: 0,
                                        background: 'rgba(255, 255, 255, 0.25)',
                                        color: 'white',
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        border: 'none',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Mode Offline
                                </button>
                            )}
                        </div>

                        {/* Progress Bar - Thinner */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: alertType === 'offline' ? 2.5 : 3, ease: 'linear' }}
                            style={{
                                height: '3px',
                                background: 'rgba(255, 255, 255, 0.4)'
                            }}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    // Use portal to render directly to document.body
    // This ensures fixed positioning is relative to viewport, not affected by parent transforms
    return createPortal(alertContent, document.body);
}

export default OfflineAlert;
