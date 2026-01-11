"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

interface DailyTransactionData {
  date: string;
  formatted_date: string;
  full_date: string;
  day_name: string;
  count: number;
}

interface ApiResponse {
  success: boolean;
  data: DailyTransactionData[];
  summary: {
    total: number;
    max: number;
    average: number;
    period: {
      start: string;
      end: string;
    };
  };
}

interface TransactionChartData {
  date: string;
  fullDate: string;
  dayName: string;
  jumlah: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{payload[0].payload.fullDate}</p>
        <p className="text-xs text-gray-500 mb-1">{payload[0].payload.dayName}</p>
        <p className="text-sm text-blue-600 font-bold">
          {payload[0].value} Transaksi
        </p>
      </div>
    );
  }
  return null;
};



export default function ChartTransaksi() {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barSize, setBarSize] = useState(8);
  const [maxValue, setMaxValue] = useState(60);

  // Fetch data from API
  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token') || '';
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jurnal-umum/daily-stats`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Gagal mengambil data transaksi');
        }

        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
          // Transform API data to chart format
          const chartData: TransactionChartData[] = result.data.map((item) => ({
            date: item.formatted_date,
            fullDate: item.full_date,
            dayName: item.day_name,
            jumlah: item.count,
          }));

          setTransactionData(chartData);

          // Calculate dynamic max value for Y-axis
          const max = result.summary?.max || Math.max(...chartData.map(d => d.jumlah));
          // Round up to nearest 10 for cleaner axis
          const roundedMax = Math.ceil((max + 10) / 10) * 10;
          setMaxValue(roundedMax > 0 ? roundedMax : 10);
        }
      } catch (err) {
        console.error('Error fetching daily stats:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyStats();
  }, []);

  // Handle responsive bar size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setBarSize(25); // desktop
      } else if (window.innerWidth >= 640) {
        setBarSize(10); // tablet
      } else {
        setBarSize(6); // mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs text-gray-500">Memuat data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-blue-600 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  // Empty data state
  if (transactionData.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <p className="text-sm text-gray-500">Tidak ada data transaksi</p>
      </div>
    );
  }

  // Generate Y-axis ticks dynamically
  const yAxisTicks = [];
  const tickInterval = Math.ceil(maxValue / 4);
  for (let i = 0; i <= maxValue; i += tickInterval) {
    yAxisTicks.push(i);
  }

  return (
    <div className="w-full h-48 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transactionData}
          margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              const index = state.activeTooltipIndex;
              setActiveBar(typeof index === 'number' ? index : null);
            } else {
              setActiveBar(null);
            }
          }}
          onMouseLeave={() => setActiveBar(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#666' }}
            interval={6}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#666' }}
            domain={[0, maxValue]}
            ticks={yAxisTicks}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar
            dataKey="jumlah"
            radius={[2, 2, 0, 0]}
            maxBarSize={barSize}
          >
            {transactionData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={activeBar === index ? '#2563eb' : '#60a5fa'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}