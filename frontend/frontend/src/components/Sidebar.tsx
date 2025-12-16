"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Users,
  CreditCard,
  Activity,
  FolderPlus,
  ChartNoAxesColumn,
  FileText,
} from "lucide-react";

export default function SidebarHover() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("admin");

  useEffect(() => {
    // Ambil role dari localStorage
    const role = localStorage.getItem("user_role") || "admin";
    setUserRole(role);
  }, []);

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
        { name: "Beranda", path: getBerandaHref(), icon: <House size={20} /> },
        { name: "RAPBS", path: "/akuntan/rapbs", icon: <FileText size={20} /> },
        { name: "Pencatatan", path: "/pencatatan", icon: <FolderPlus size={20} /> },
        { name: "Laporan", path: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
      ];
    } else if (userRole === "auditor") {
      return [
        { name: "Beranda", path: getBerandaHref(), icon: <House size={20} /> },
        { name: "Pencatatan", path: "/pencatatan", icon: <FolderPlus size={20} /> },
        { name: "Laporan", path: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
      ];
    } else {
      // Admin - menu default
      return [
        { name: "Beranda", path: getBerandaHref(), icon: <House size={20} /> },
        { name: "Akun", path: "/akun", icon: <Users size={20} /> },
        { name: "Keuangan", path: "/keuangan", icon: <CreditCard size={20} /> },
        { name: "Kegiatan", path: "/kegiatan", icon: <Activity size={20} /> },
        { name: "Pencatatan", path: "/pencatatan", icon: <FolderPlus size={20} /> },
        { name: "Laporan", path: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
      ];
    }
  };

  const menus = getMenus();

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`fixed top-[90px] left-0 h-[calc(100vh-90px)] bg-white border-r transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4">
        <ul className="mt-6 space-y-2">
          {menus.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition ${
                    isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div>{item.icon}</div>

                  {expanded && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
