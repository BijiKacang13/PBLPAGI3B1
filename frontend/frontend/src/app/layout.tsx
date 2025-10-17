import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SIA - Yayasan",
  description: "Sistem Informasi Akuntansi Yayasan Darussalam",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
