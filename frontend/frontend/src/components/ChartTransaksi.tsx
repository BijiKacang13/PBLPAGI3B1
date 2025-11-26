"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Generate data transaksi 30 hari terakhir
const generateData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      fullDate: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      jumlah: Math.floor(Math.random() * 40) + 20
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{payload[0].payload.fullDate}</p>
        <p className="text-sm text-blue-600 font-bold">
          {payload[0].value} Transaksi
        </p>
      </div>
    );
  }
  return null;
};

// Mengelompokkan data per minggu untuk label m1, m2, m3, m4
const getWeekLabel = (index: number) => {
  if (index < 7) return 'm1';
  if (index < 14) return 'm2';
  if (index < 21) return 'm3';
  return 'm4';
};

export default function ChartTransaksi() {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const transactionData = generateData();

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
            tickFormatter={(value, index) => getWeekLabel(index)}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 9, fill: '#666' }}
            domain={[0, 60]}
            ticks={[0, 20, 40, 60]}
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
            maxBarSize={8}
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