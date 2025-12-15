"use client";

import React, { useState, useEffect } from 'react';
import { Home, User, FileText, Activity, PlusSquare, BarChart3, ChevronLeft } from 'lucide-react';
import NavbarBottom from '@/components/NavbarBottom';
import Navbar from "@/components/Navbar";

const AnalisisDataAuditor = () => {
  // Data dummy
  const [summaryData] = useState({
    pengeluaran: 15750000,
    pemasukan: 25000000,
    labaRugi: 9250000
  });

  const [categoryData] = useState({
    aset: 5000000,
    gedung: 3500000,
    gaji: 4250000,
    lainnya: 3000000
  });

  const [bottomSummary] = useState({
    pemasukan: 25000000,
    pengeluaran: 15750000
  });

  // Animation state
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate bar height percentage
  const getBarHeight = (value: number) => {
    const maxValue = Math.max(...Object.values(categoryData));
    return (value / maxValue) * 100;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />
      

 {/* Main Content */}
      <div className="px-3 py-3 space-y-3 max-w-2xl mx-auto w-full">
        {/* Summary Cards */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          {/* Title */}
          <h1 className="text-sm font-bold text-gray-900 text-center mb-4 tracking-wide uppercase">ANALISIS DATA</h1>
          
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <div className="text-[9px] text-gray-500 mb-1.5 leading-tight font-medium">Jumlah Pengeluaran</div>
              <div className="text-[10px] font-bold text-blue-900 leading-tight break-words">Rp 15.750.000</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <div className="text-[9px] text-gray-500 mb-1.5 leading-tight font-medium">Jumlah Pemasukan</div>
              <div className="text-[10px] font-bold text-blue-900 leading-tight break-words">Rp 25.000.000</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <div className="text-[9px] text-gray-500 mb-1.5 leading-tight font-medium whitespace-nowrap overflow-hidden text-ellipsis">Jumlah Laba Rugi</div>
              <div className="text-[10px] font-bold text-blue-900 leading-tight break-words">Rp 9.250.000</div>
            </div>
          </div>
          {/* Bottom Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
              <div className="text-xs font-bold text-blue-900 break-words">Rp 25.000.000</div>
              <div className="text-[9px] text-gray-500 mt-0.5 font-medium">Pemasukan</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
              <div className="text-xs font-bold text-gray-900 break-words">Rp 15.750.000</div>
              <div className="text-[9px] text-gray-500 mt-0.5 font-medium">Pengeluaran</div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <h2 className="text-xs font-bold text-gray-900 mb-3 leading-tight">Pengeluaran<br/>Setiap Kategori</h2>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-1.5 sm:gap-2 mb-2.5" style={{ height: '180px' }}>
            {/* ASET */}
            <div className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              <div className="text-[9px] font-bold text-gray-700 mb-1 text-center leading-tight w-full px-0.5">Rp 5.0 jt</div>
              <div 
                className="w-full bg-gradient-to-t from-blue-300 via-blue-200 to-blue-100 rounded-t-md shadow-sm" 
                style={{ 
                  height: isAnimated ? `${getBarHeight(categoryData.aset)}%` : '0%',
                  minHeight: isAnimated ? '30px' : '0px',
                  transition: 'height 1s ease-out, min-height 1s ease-out'
                }}
              ></div>
            </div>

            {/* GEDUNG */}
            <div className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              <div className="text-[9px] font-bold text-gray-700 mb-1 text-center leading-tight w-full px-0.5">Rp 3.5 jt</div>
              <div 
                className="w-full bg-gradient-to-t from-blue-300 via-blue-200 to-blue-100 rounded-t-md shadow-sm" 
                style={{ 
                  height: isAnimated ? `${getBarHeight(categoryData.gedung)}%` : '0%',
                  minHeight: isAnimated ? '30px' : '0px',
                  transition: 'height 1.2s ease-out 0.1s, min-height 1.2s ease-out 0.1s'
                }}
              ></div>
            </div>

            {/* GAJI */}
            <div className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              <div className="text-[9px] font-bold text-gray-700 mb-1 text-center leading-tight w-full px-0.5">Rp 4.3 jt</div>
              <div 
                className="w-full bg-gradient-to-t from-blue-300 via-blue-200 to-blue-100 rounded-t-md shadow-sm" 
                style={{ 
                  height: isAnimated ? `${getBarHeight(categoryData.gaji)}%` : '0%',
                  minHeight: isAnimated ? '30px' : '0px',
                  transition: 'height 1.4s ease-out 0.2s, min-height 1.4s ease-out 0.2s'
                }}
              ></div>
            </div>

            {/* LAINNYA */}
            <div className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              <div className="text-[9px] font-bold text-blue-700 mb-1 text-center leading-tight w-full px-0.5">Rp 3.0 jt</div>
              <div 
                className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-md shadow-sm" 
                style={{ 
                  height: isAnimated ? `${getBarHeight(categoryData.lainnya)}%` : '0%',
                  minHeight: isAnimated ? '30px' : '0px',
                  transition: 'height 1.6s ease-out 0.3s, min-height 1.6s ease-out 0.3s'
                }}
              ></div>
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between gap-1.5 sm:gap-2 pt-1 border-t border-gray-100">
            <div className="flex-1 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-wide min-w-0">ASET</div>
            <div className="flex-1 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-wide min-w-0">GEDUNG</div>
            <div className="flex-1 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-wide min-w-0">GAJI</div>
            <div className="flex-1 text-center text-[9px] font-semibold text-blue-700 uppercase tracking-wide min-w-0">LAINNYA</div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center text-[9px] text-gray-400 italic pt-2 pb-1">
          Sistem Informasi Akuntansi Yayasan<br/>
          Darussalam Batam | 2025
        </div>
      </div>

        <NavbarBottom />
    </div>
  );
};

export default AnalisisDataAuditor;


