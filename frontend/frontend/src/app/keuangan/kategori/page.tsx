"use client";

import axios from "axios";
import { ArrowLeft, User, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import TambahKategori from "@/components/TambahKategori";
import EditKategori from "@/components/EditKategori";
import HapusKategori from "@/components/HapusKategori";

export default function KategoriAkun() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [openTambah, setOpenTambah] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHapus, setOpenHapus] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/kategori-akun";

  // ======================
  // FETCH DATA
  // ======================
  const fetchKategori = async () => {
    try {
      const res = await axios.get(API_URL);

      const arr = Array.isArray(res.data)
        ? res.data
        : res.data.data ?? [];

      const mapped = arr.map((x: any) => ({
        id_kategori_akun: Number(x.id_kategori_akun),
        kode_kategori_akun: x.kode_kategori_akun,
        kategori_akun: x.kategori_akun
      }));

      setData(mapped);
    } catch (err) {
      console.error("Gagal fetch:", err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // ======================
  // RENDER
  // ======================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1">
          <img src="/logo.png" className="w-16 h-16 object-contain" />
          <div className="w-[2px] h-10 bg-[#1A3E85]" />
          <h1 className="text-3xl font-extrabold text-[#1A3E85]">SIA</h1>
        </div>
        <div className="p-2 rounded-full bg-blue-200 border border-blue-200">
          <User size={20} className="text-blue-900" />
        </div>
      </header>

      {/* Content */}
      <div className="mt-6 w-[90%] max-w-md mx-auto bg-white rounded-xl shadow-md p-4 z-[20] relative">
        <div className="flex items-center mb-4">
          <Link href="/keuangan">
            <ArrowLeft className="text-gray-600 w-5 h-5" />
          </Link>
          <h2 className="flex-1 text-center font-semibold text-gray-800">
            KATEGORI AKUN
          </h2>
        </div>

        {/* Tombol tambah */}
        <button
          onClick={() => setOpenTambah(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold mb-4 shadow hover:bg-blue-700"
        >
          Tambah Kategori Akun
        </button>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 relative z-[50]">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 w-1/3 text-left">Kode</th>
                <th className="px-4 py-2 text-left">Kategori Akun</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id_kategori_akun}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{item.kode_kategori_akun}</td>

                  <td className="px-4 py-2 flex items-center justify-between">
                    {item.kategori_akun}

                    <div className="flex gap-2">
                      <button
                        className="text-yellow-500 hover:text-yellow-600"
                        onClick={() => {
                          setSelected(item);
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelected(item);
                          setOpenHapus(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      {/* MODALS */}
      <TambahKategori
        open={openTambah}
        onClose={() => setOpenTambah(false)}
        onSuccess={fetchKategori}
      />

      <EditKategori
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchKategori}
        data={selected}
      />

      <HapusKategori
        open={openHapus}
        onClose={() => setOpenHapus(false)}
        onSuccess={fetchKategori}
        data={selected}
      />
    </div>
  );
}
