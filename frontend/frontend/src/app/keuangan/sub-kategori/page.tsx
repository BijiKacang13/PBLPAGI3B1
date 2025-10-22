"use client";

import { ArrowLeft, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TambahSubKategori from "@/components/TambahSubKategori";
import { motion, AnimatePresence } from "framer-motion";

export default function SubKategoriAkun() {
  const [openModal, setOpenModal] = useState(false);

  const data = [
    { kode: "1-1100", nama: "Kas" },
    { kode: "1-1200", nama: "Bank" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1">
          <img
            src="/logo.png"
            alt="Logo Yayasan"
            width={55}
            height={55}
            className="w-16 h-16 object-contain"
          />
          <div className="w-[2px] h-10 bg-[#1A3E85]"></div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <h1 className="text-3xl font-extrabold text-[#1A3E85] tracking-wide">
                SIA
              </h1>
              <p className="text-xs font-semibold text-[#1A3E85] tracking-wide leading-tight">
                <span className="inline-block w-[70px] text-left">YAYASAN</span>
                <br />
                <span className="inline-block w-[70px] text-left">
                  DARUSSALAM
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="p-2 rounded-full bg-blue-200 border border-blue-200">
          <User size={20} className="text-blue-900" />
        </div>
      </header>

      {/* Konten utama */}
      <div className="mt-6 w-[90%] max-w-md mx-auto bg-white rounded-xl shadow-md p-4">
        {/* Tombol kembali dan judul */}
        <div className="flex items-center mb-4">
          <Link href="/keuangan/kategori-akun">
            <ArrowLeft className="text-gray-600 w-5 h-5" />
          </Link>
          <h2 className="flex-1 text-center font-semibold text-gray-800">
            SUB KATEGORI AKUN
          </h2>
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={() => setOpenModal(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold text-sm mb-4 shadow-md hover:bg-blue-700 transition"
        >
          Tambah Sub Kategori Akun
        </button>

        {/* Tabel data */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 w-1/3">Kode</th>
                <th className="text-left px-4 py-2">Sub Kategori Akun</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-2 text-gray-500 font-mono">
                    {item.kode}
                  </td>
                  <td className="px-4 py-2">{item.nama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      {/* Modal Tambah Kategori */}
           <TambahSubKategori
             open={openModal}
             onClose={() => setOpenModal(false)}
           />
         </div>
       );
     }

/* Modal Component */
// function TambahSubKategori({ open, onClose }: { open: boolean; onClose: () => void }) {
//   if (!open) return null;

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             className="bg-white w-[85%] max-w-xs rounded-2xl shadow-lg p-5 relative"
//           >
//             {/* Tombol close */}
//             <button
//               onClick={onClose}
//               className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             {/* Judul */}
//             <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
//               TAMBAH SUB KATEGORI AKUN
//             </h3>

//             {/* Form */}
//             <form className="flex flex-col gap-3">
//               <div>
//                 <label className="block text-sm text-gray-700 mb-1">Kode</label>
//                 <input
//                   type="text"
//                   placeholder="Masukkan kode"
//                   className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-700 mb-1">
//                   Sub Kategori Akun
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Masukkan sub kategori"
//                   className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
//                 />
//               </div>

//               {/* Tombol aksi */}
//               <div className="flex justify-center gap-3 mt-4">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-red-600 transition"
//                 >
//                   BATAL
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-blue-700 transition"
//                 >
//                   SIMPAN
//                 </button>
//               </div>
//             </form>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
