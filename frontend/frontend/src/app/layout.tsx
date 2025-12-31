"use client";

import { usePathname } from "next/navigation";
import NavbarBottom from "@/components/NavbarBottom";
import Sidebar from "@/components/Sidebar";
import OfflineProvider from "@/components/OfflineProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Daftar halaman yang TIDAK menampilkan Sidebar & Navbar
  // Tambahkan "/" untuk splash screen dan "/login" untuk halaman login
  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/offline" ||
    pathname.startsWith("/auth");

  // Tentukan halaman yang menampilkan NavbarBottom
  const showNavbarBottom =
    !isAuthPage &&
    ["/admin/beranda", "/admin/analisis-data", "/akuntan/beranda", "/akuntan/analisis-data", "/akuntan/rapbs", "/auditor/beranda", "/auditor/analisis-data", "/akun", "/keuangan", "/transaksi", "/kegiatan", "/pencatatan", "/laporan", "/logaktivitas"].some((path) =>
      pathname.startsWith(path)
    );

  return (
    <html lang="id">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HR Darussalam" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="description" content="Sistem Manajemen Sumber Daya Manusia untuk Yayasan Darussalam" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
        {/* Service Worker Registration */}
        <ServiceWorkerRegistration />

        {/* Offline Provider for handling connectivity */}
        <OfflineProvider>
          {/* Sidebar hanya di layar besar dan bukan halaman auth */}
          {!isAuthPage && (
            <aside className="hidden md:block w-64 bg-gray-50 border-lr shadow-sm">
              <Sidebar />
            </aside>
          )}

          {/* Konten utama */}
          <main className={`flex-1 relative ${!isAuthPage ? 'pb-20 md:pb-0 pt-[90px]' : ''}`}>{children}</main>

          {/* Navbar Bottom hanya muncul di mobile DAN hanya jika sudah login */}
          {showNavbarBottom && (
            <div className="block md:hidden fixed bottom-0 left-0 w-full z-50">
              <NavbarBottom />
            </div>
          )}
        </OfflineProvider>
      </body>
    </html>
  );
}
