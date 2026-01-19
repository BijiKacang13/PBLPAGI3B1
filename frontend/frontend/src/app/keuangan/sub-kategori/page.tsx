"use client";

import Navbar from "@/components/Navbar";
import { api } from "@/lib/api/axiosClient";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import NavbarBottom from "@/components/NavbarBottom";
import TambahSubKategori from "@/components/TambahSubKategori";
import EditSubKategori from "@/components/EditSubKategori";
import HapusSubKategori from "@/components/HapusSubKategori";
import { useRouter } from "next/navigation";

export default function SubKategoriAkun() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [openTambah, setOpenTambah] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHapus, setOpenHapus] = useState(false);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ==========================
  // FETCH SUB KATEGORI 
  // ==========================
  const fetchSubKategori = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sub-kategori-akun");

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? [];

      setData(
        list.map((x: any) => ({
          id_sub_kategori_akun: Number(x.id_sub_kategori_akun),
          kode_sub_kategori_akun: x.kode_sub_kategori_akun,
          sub_kategori_akun: x.sub_kategori_akun,
          id_kategori_akun: x.id_kategori_akun,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch sub kategori:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSubKategori();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

      <Navbar />

      {/* Content */}
      <main className="w-full px-4 py-6 md:px-6 lg:px-10 mt-4">
        <div className="bg-white shadow-md rounded-xl px-6 py-5 md:px-8 w-full mb-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 className="flex-1 text-lg md:text-lg font-bold text-gray-800 text-center sm:text-start">
              SUB KATEGORI AKUN
            </h1>
            <div className="w-10 h-10" />
          </div>

          {/* Button tambah */}
          <button
            onClick={() => setOpenTambah(true)}
            className="w-full bg-blue-200 text-gray-800 py-2 rounded-xl font-semibold mb-4 shadow hover:bg-blue-400"
          >
            Tambah Sub-Kategori Akun
          </button>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 relative">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 w-1/3 text-left">Kode</th>
                  <th className="px-4 py-2 text-left">Sub Kategori Akun</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-gray-600">Memuat data...</p>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item) => (
                    <tr
                      key={item.id_sub_kategori_akun}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{item.kode_sub_kategori_akun}</td>

                      <td className="px-4 py-2 flex items-center justify-between">
                        {item.sub_kategori_akun}
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
                  ))
                ) : (
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
      </main>

      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>
      <NavbarBottom />

      {/* MODALS */}
      <TambahSubKategori
        open={openTambah}
        onClose={() => setOpenTambah(false)}
        onSuccess={fetchSubKategori}
      />
      <EditSubKategori
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchSubKategori}
        data={selected}
      />
      <HapusSubKategori
        open={openHapus}
        onClose={() => setOpenHapus(false)}
        onSuccess={fetchSubKategori}
        data={selected}
      />
    </div>
  );
}
