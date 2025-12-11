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

export default function SubKategoriAkun() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [openTambah, setOpenTambah] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHapus, setOpenHapus] = useState(false);

  // ==========================
  // FETCH SUB KATEGORI 
  // ==========================
  const fetchSubKategori = async () => {
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
    }
  };

  useEffect(() => {
    fetchSubKategori();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

      <Navbar />

      <div className="mt-6 w-[90%] max-w-md mx-auto bg-white rounded-xl shadow-md p-4 z-[20] relative">
        <div className="flex items-center mb-4">
          <Link href="/keuangan">
            <ArrowLeft className="text-gray-600 w-5 h-5" />
          </Link>
          <h2 className="flex-1 text-center font-semibold text-gray-800">
            SUB KATEGORI AKUN
          </h2>
        </div>

        {/* Button tambah */}
        <button
          onClick={() => setOpenTambah(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold mb-4 shadow hover:bg-blue-700"
        >
          Tambah Sub Kategori Akun
        </button>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 relative z-[50]">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 w-1/3 text-left">Kode</th>
                <th className="px-4 py-2 text-left">Sub Kategori Akun</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id_sub_kategori_akun} className="border-t hover:bg-gray-50">
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
      <NavbarBottom/>

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
