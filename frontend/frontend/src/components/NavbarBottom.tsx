"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Users, CreditCard, Activity, FolderPlus, ChartNoAxesColumn } from "lucide-react";

export default function NavbarBottom() {
  const pathname = usePathname();

  const menus = [
    { name: "Beranda", href: "/beranda", icon: <House color="#000000" size={20} strokeWidth={2} /> },
    { name: "Akun", href: "/akun", icon: <Users color="#000000" size={20} strokeWidth={2} absoluteStrokeWidth /> },
    { name: "Keuangan", href: "/keuangan", icon: <CreditCard color="#000000" size={20} strokeWidth={2} /> },
    { name: "Kegiatan", href: "/kegiatan", icon: <Activity color="#000000" size={20} strokeWidth={2} /> },
    { name: "Pencatatan", href: "/pencatatan", icon: <FolderPlus color="#000000" size={20} strokeWidth={2} /> },
    { name: "Profil", href: "/akun", icon: <ChartNoAxesColumn color="#000000" size={20} strokeWidth={2} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-sm">
      <ul className="flex justify-around items-center py-2">
        {menus.map((menu, index) => {
          const isActive = pathname === menu.href;
          return (
            <li key={index}>
              <Link
                href={menu.href}
                className={`flex flex-col items-center text-xs font-medium ${
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
                <span className={`mt-1 ${isActive ? "text-blue-800" : "text-gray-500"}`}>
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
