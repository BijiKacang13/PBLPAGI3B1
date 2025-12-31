"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function OfflinePage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    // If not client-side yet, show a simple loading state
    if (!isClient) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #fff7ed, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        borderRadius: '20px',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 'bold'
                    }}>HR</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>HR Darussalam</h1>
                    <p style={{ color: '#6b7280', marginTop: '8px' }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
            {/* Inline styles as fallback */}
            <style jsx global>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>

            {/* Header Alert Bar */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between shadow-lg"
                style={{
                    background: 'linear-gradient(to right, #f97316, #ea580c)',
                    color: 'white',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                        style={{
                            width: '32px',
                            height: '32px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <svg className="w-5 h-5" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-sm" style={{ fontWeight: '600', fontSize: '14px' }}>Koneksi Terputus</p>
                        <p className="text-xs text-white/80" style={{ fontSize: '12px', opacity: '0.8' }}>Anda sedang offline. Beberapa fitur mungkin tidak tersedia.</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Mode Offline
                </button>
            </motion.div>

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col items-center justify-start px-4 py-8 overflow-auto"
                style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '32px 16px',
                    overflow: 'auto'
                }}
            >
                {/* Logo and Title */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                    style={{ textAlign: 'center', marginBottom: '32px' }}
                >
                    {/* Using regular img tag instead of Next.js Image for offline compatibility */}
                    <div
                        className="w-20 h-20 mx-auto mb-4 relative"
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 16px',
                            position: 'relative'
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="HR Darussalam Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div style="width:100%;height:100%;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:20px;display:flex;align-items:center;justify-content:center;color:white;font-size:32px;font-weight:bold;">HR</div>';
                                }
                            }}
                        />
                    </div>
                    <h1
                        className="text-2xl font-bold text-gray-800"
                        style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}
                    >
                        HR Darussalam
                    </h1>
                    <div
                        className="flex items-center justify-center gap-2 mt-2"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                    >
                        <span
                            className="w-2 h-2 bg-red-500 rounded-full animate-pulse-dot"
                            style={{
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%'
                            }}
                        ></span>
                        <span
                            className="text-sm text-gray-500 font-medium"
                            style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}
                        >
                            Offline Mode
                        </span>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mb-6"
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '100%',
                        marginBottom: '24px'
                    }}
                >
                    <h2
                        className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <svg className="w-5 h-5 text-orange-500" style={{ width: '20px', height: '20px', color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tentang Aplikasi
                    </h2>

                    <h3
                        className="font-semibold text-gray-700 mb-2"
                        style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}
                    >
                        Sistem Manajemen HR Darussalam
                    </h3>
                    <p
                        className="text-sm text-gray-600 mb-4"
                        style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.6' }}
                    >
                        Aplikasi HR Darussalam adalah sistem manajemen sumber daya manusia yang dirancang khusus untuk Yayasan Darussalam. Aplikasi ini membantu mengelola berbagai aspek HR termasuk absensi, cuti, evaluasi kinerja, dan data pegawai.
                    </p>

                    <h3
                        className="font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <svg className="w-4 h-4 text-blue-500" style={{ width: '16px', height: '16px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Fitur Utama
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4" style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px', marginLeft: '16px' }}>
                        {[
                            'Absensi check-in/check-out',
                            'Pengajuan dan verifikasi cuti',
                            'Evaluasi kinerja pegawai',
                            'Manajemen data pegawai',
                            'Manajemen departemen dan jabatan',
                            'Laporan dan rekapitulasi'
                        ].map((item, index) => (
                            <li key={index} className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                <span
                                    className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                                    style={{ width: '6px', height: '6px', background: '#fb923c', borderRadius: '50%' }}
                                ></span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <h3
                        className="font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <svg className="w-4 h-4 text-red-500" style={{ width: '16px', height: '16px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                        Mode Offline
                    </h3>
                    <p
                        className="text-sm text-gray-600"
                        style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}
                    >
                        Saat offline, Anda masih dapat mengakses data yang telah disimpan secara lokal. Beberapa fitur mungkin terbatas hingga koneksi internet tersedia kembali.
                    </p>
                </motion.div>

                {/* Quick Access Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mb-6"
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '100%',
                        marginBottom: '24px'
                    }}
                >
                    <h2
                        className="text-lg font-bold text-gray-800 mb-4"
                        style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}
                    >
                        Akses Cepat
                    </h2>
                    <div
                        className="grid grid-cols-4 gap-4"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}
                    >
                        {/* Absensi */}
                        <div className="flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-2 shadow-sm"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '8px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <svg className="w-7 h-7 text-blue-600" style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600 font-medium text-center" style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500', textAlign: 'center' }}>Absensi</span>
                        </div>

                        {/* Cuti */}
                        <div className="flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-2 shadow-sm"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '8px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <svg className="w-7 h-7 text-green-600" style={{ width: '28px', height: '28px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600 font-medium text-center" style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500', textAlign: 'center' }}>Cuti</span>
                        </div>

                        {/* Dashboard */}
                        <div className="flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-2 shadow-sm"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '8px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <svg className="w-7 h-7 text-orange-600" style={{ width: '28px', height: '28px', color: '#ea580c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600 font-medium text-center" style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500', textAlign: 'center' }}>Dashboard</span>
                        </div>

                        {/* Profile */}
                        <div className="flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-2 shadow-sm"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '8px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <svg className="w-7 h-7 text-purple-600" style={{ width: '28px', height: '28px', color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600 font-medium text-center" style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500', textAlign: 'center' }}>Profile</span>
                        </div>
                    </div>
                </motion.div>

                {/* Refresh Button */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleRefresh}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-orange-200 flex items-center gap-3 mb-8"
                    style={{
                        background: 'linear-gradient(to right, #f97316, #ea580c)',
                        color: 'white',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '32px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    <svg
                        className="w-5 h-5 animate-spin-slow"
                        style={{ width: '20px', height: '20px' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Halaman
                </motion.button>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-gray-400 text-xs"
                    style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}
                >
                    <p>© 2025 Yayasan Darussalam - Sistem HR Management</p>
                    <p>Versi 1.0.0</p>
                </motion.div>
            </div>
        </div>
    );
}
