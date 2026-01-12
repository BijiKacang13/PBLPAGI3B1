"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  House,
  Users,
  CreditCard,
  Activity,
  FolderPlus,
  ChartNoAxesColumn,
  FileText,
} from "lucide-react";

export default function NavbarBottom({ isModalOpen = false }) {
  const pathname = usePathname();

  // Tentukan role awal berdasarkan URL path untuk menghindari flash/loading
  const getInitialRole = (): string => {
    if (pathname.startsWith("/auditor")) return "auditor";
    if (pathname.startsWith("/akuntan")) return "akuntan_unit";
    return "admin";
  };

  const [userRole, setUserRole] = useState<string>(getInitialRole);

  useEffect(() => {
    // Sinkronisasi dengan localStorage (untuk halaman yang tidak memiliki prefix role di URL)
    const storedRole = localStorage.getItem("user_role");
    if (storedRole && storedRole !== userRole) {
      setUserRole(storedRole);
    }
  }, [pathname]);

  // Tentukan href beranda berdasarkan role
  const getBerandaHref = () => {
    switch (userRole) {
      case "akuntan_unit":
        return "/akuntan/beranda";
      case "auditor":
        return "/auditor/beranda";
      default:
        return "/admin/beranda";
    }
  };

  // Tentukan menu berdasarkan role
  const getMenus = () => {
    if (userRole === "akuntan_unit") {
      return [
        { name: "Beranda", href: getBerandaHref(), icon: <House size={20} /> },
        { name: "RAPBS", href: "/akuntan/rapbs", icon: <FileText size={20} /> },
        { name: "Pencatatan", href: "/pencatatan", icon: <FolderPlus size={20} /> },
        { name: "Laporan", href: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
      ];
    } else if (userRole === "auditor") {
      return [
        { name: "Beranda", href: getBerandaHref(), icon: <House size={20} /> },
        { name: "Pencatatan", href: "/pencatatan", icon: <FolderPlus size={20} /> },
        { name: "Laporan", href: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
      ];
    } else {
      // Admin - menu default
      return [
        { name: "Beranda", href: getBerandaHref(), icon: <House size={20} /> },
        { name: "Akun", href: "/akun", icon: <Users size={20} /> },
        { name: "Keuangan", href: "/keuangan", icon: <CreditCard size={20} /> },
        { name: "Kegiatan", href: "/kegiatan", icon: <Activity size={20} /> },
        { name: "Pencatatan", href: "/pencatatan", icon: <FolderPlus size={20} /> },
        { name: "Laporan", href: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
      ];
    }
  };

  const menus = getMenus();

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50 md:hidden no-print
        border-t border-gray-200 shadow-sm transition-all duration-300
        ${isModalOpen ? "backdrop-blur-lg bg-white/40" : "bg-white/90 backdrop-blur-sm"}
      `}
    >
      <ul className="flex justify-around items-center py-2">
        {menus.map((menu, index) => {
          const isActive = pathname === menu.href || pathname.startsWith(menu.href + "/");
          return (
            <li key={index}>
              <Link
                href={menu.href}
                className={`flex flex-col items-center text-xs font-medium transition-all ${isActive ? "text-blue-800" : "text-gray-400"
                  }`}
              >
                <div
                  className={`p-2 rounded-full transition-colors ${isActive ? "bg-blue-100" : "bg-transparent"
                    }`}
                >
                  {menu.icon}
                </div>
                <span
                  className={`mt-1 ${isActive ? "text-blue-800" : "text-gray-500"
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
