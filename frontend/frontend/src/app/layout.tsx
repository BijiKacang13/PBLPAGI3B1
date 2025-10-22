"use client";

import { usePathname } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Tentukan halaman yang menampilkan NavbarBottom
const showNavbarBottom =
  ["/beranda", "/akun", "/keuangan", "/transaksi", "/kegiatan", "/pencatatan"].some((path) =>
    pathname.startsWith(path)
  );

  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
        {/* Sidebar hanya di layar besar */}
        <aside className="hidden md:block w-64 bg-white border-r shadow-sm">
          <Sidebar />
        </aside>

        {/* Konten utama */}
        <main className="flex-1 relative pb-20 md:pb-0">{children}</main>

        {/* Navbar Bottom hanya muncul di mobile DAN hanya jika sudah login */}
        {showNavbarBottom && (
          <div className="block md:hidden fixed bottom-0 left-0 w-full z-50">
            <NavbarBottom />
          </div>
        )}
      </body>
    </html>
  );
}
