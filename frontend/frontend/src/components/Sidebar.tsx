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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function SidebarHover() {
  const [expanded, setExpanded] = useState(true);
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

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "akuntan_unit":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 ring-1 ring-purple-200";
      case "auditor":
        return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 ring-1 ring-amber-200";
      default:
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200";
    }
  };

  const getRoleName = () => {
    switch (userRole) {
      case "akuntan_unit":
        return "Akuntan";
      case "auditor":
        return "Auditor";
      default:
        return "Admin";
    }
  };

  return (
    <aside
      className={`fixed top-[90px] left-0 h-[calc(100vh-90px)] bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-sm transition-all duration-300 ease-out ${
        expanded ? "w-64" : "w-20"
      } flex flex-col`}
    >


      {/* Navigation */}
      <div className="px-3 py-5 flex-1 overflow-y-auto">
        {expanded && (
          <div className="px-3 mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Menu
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </div>
        )}
        <ul className="space-y-2">
          {menus.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <li key={item.name} className="relative">
                <Link
                  href={item.path}
                  className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-800 shadow-lg shadow-blue-500/30"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-md"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white opacity-10" />
                  )}
                  
                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                      isActive
                        ? "bg-white/20 text-blue-700"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {expanded && (
                    <span className="whitespace-nowrap relative z-10">{item.name}</span>
                  )}

                  {isActive && expanded && (
                    <div className="absolute right-3 h-2 w-2 " />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-3 border-t border-slate-200/60 bg-white/50">
        <div className="flex items-center justify-between gap-2">
          {expanded && (
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">
                SIA Yayasan<br />Darussalam Batam
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">© 2025</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            aria-label={expanded ? "Kecilkan sidebar" : "Besarkan sidebar"}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}