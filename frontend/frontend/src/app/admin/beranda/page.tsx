import Navbar from "@/components/Navbar";
// import ChartTransaksi from "../components/ChartTransaksi";
import NavbarBottom from "@/components/NavbarBottom";

export default function Beranda() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">

      <Navbar />

      {/* Konten utama */}
      <main className="flex flex-col items-center mt-6 px-4">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm text-center">
          <p className="font-semibold mb-2">Selamat datang, Admin!</p>
          <p className="text-gray-500 text-sm mb-3">
            Transaksi dalam 30 hari terakhir
          </p>

          {/* Label */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-4 h-2 rounded bg-indigo-400"></div>
            <p className="text-sm text-gray-500">Jumlah Transaksi</p>
          </div>

          {/* Chart */}
          {/* <ChartTransaksi /> */}
        </div>

        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      {/* Navbar bawah */}
      {/* <NavbarBottom /> */}
    </div>
  );
}
