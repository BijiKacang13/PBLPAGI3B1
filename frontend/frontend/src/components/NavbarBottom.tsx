"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Users,
  CreditCard,
  Activity,
  FolderPlus,
  ChartNoAxesColumn,
} from "lucide-react";

// Tambahkan prop isModalOpen
export default function NavbarBottom({ isModalOpen = false }) {
  const pathname = usePathname();

  const menus = [
    { name: "Beranda", href: "/beranda", icon: <House size={20} /> },
    { name: "Akun", href: "/akun", icon: <Users size={20} /> },
    { name: "Keuangan", href: "/keuangan", icon: <CreditCard size={20} /> },
    { name: "Kegiatan", href: "/kegiatan", icon: <Activity size={20} /> },
    { name: "Pencatatan", href: "/pencatatan", icon: <FolderPlus size={20} /> },
    { name: "Laporan", href: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 shadow-sm transition-all duration-300
        ${isModalOpen ? "backdrop-blur-lg bg-white/40" : "bg-white/90 backdrop-blur-sm"}
      `}
    >
      <ul className="flex justify-around items-center py-2">
        {menus.map((menu, index) => {
          const isActive = pathname === menu.href;
          return (
            <li key={index}>
              <Link
                href={menu.href}
                className={`flex flex-col items-center text-xs font-medium transition-all ${
                  isActive ? "text-blue-800" : "text-gray-400"
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-colors ${
                    isActive ? "bg-blue-100" : "bg-transparent"
                  }`}
                >
                  {menu.icon}
                </div>
                <span
                  className={`mt-1 ${
                    isActive ? "text-blue-800" : "text-gray-500"
                  }`}
                >
                  {menu.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
