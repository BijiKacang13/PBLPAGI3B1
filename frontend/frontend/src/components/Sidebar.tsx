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
} from "lucide-react";

interface SidebarProps {
  expanded?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ expanded: controlledExpanded, onToggle }: SidebarProps = {}) {
  const pathname = usePathname();

  // Internal state for uncontrolled mode
  const [internalExpanded, setInternalExpanded] = useState(true);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  // Load from localStorage on mount (for uncontrolled mode)
  useEffect(() => {
    if (!isControlled) {
      const saved = localStorage.getItem("sidebar_expanded");
      if (saved !== null) {
        setInternalExpanded(saved === "true");
      }
    }
  }, [isControlled]);

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      const newValue = !internalExpanded;
      setInternalExpanded(newValue);
      localStorage.setItem("sidebar_expanded", String(newValue));
      // Dispatch custom event for layout to detect
      window.dispatchEvent(new Event("sidebarChange"));
    }
  };

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
  }, [pathname, userRole]);

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

  // Mapping child routes ke parent menu
  const childRouteMapping: Record<string, string[]> = {
    "/akuntan/rapbs": [
      "/keuangan/RapbsAkun",
      "/kegiatan/RapbsKegiatan",
      "/keuangan",
    ],
    "/pencatatan": [
      "/pencatatan/jurnal",
      "/pencatatan/buku-besar",
      "/pencatatan/transaksi",
    ],
    "/laporan": [
      "/laporan/komprehensif",
      "/laporan/posisi-keuangan",
      "/laporan/arus-kas",
      "/laporan/perubahan-aset-neto",
      "/laporan/calk",
      "/laporan/prra",
    ],
    "/keuangan": [
      "/keuangan/RapbsAkun",
      "/keuangan/kategori",
      "/keuangan/sub-kategori",
      "/keuangan/akun",
    ],
    "/akun": [
      "/akun/akuntan",
      "/akun/auditor",
      "/akun/tambah",
    ],
    "/kegiatan": [
      "/kegiatan/RapbsKegiatan",
      "/kegiatan/data-kegiatan",
    ],
  };

  // Fungsi untuk mengecek apakah menu aktif
  const isMenuActive = (menuPath: string): boolean => {
    const currentPath = pathname.toLowerCase();
    const targetPath = menuPath.toLowerCase();

    if (currentPath === targetPath) return true;
    if (currentPath.startsWith(targetPath + "/")) return true;

    const childRoutes = childRouteMapping[menuPath];
    if (childRoutes) {
      for (const childRoute of childRoutes) {
        const childRouteLower = childRoute.toLowerCase();
        if (currentPath === childRouteLower ||
          currentPath.startsWith(childRouteLower + "/") ||
          currentPath.startsWith(childRouteLower)) {
          return true;
        }
      }
    }

    return false;
  };

  const menus = getMenus();

  return (
    <aside
      className={`fixed top-[90px] left-0 h-[calc(100vh-90px)] bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-sm transition-all duration-300 ease-out z-40 ${expanded ? "w-64" : "w-20"
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
            const isActive = isMenuActive(item.path);
            return (
              <li key={item.name} className="relative">
                <Link
                  href={item.path}
                  className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ${isActive
                    ? "bg-blue-100 text-blue-800 shadow-lg shadow-blue-500/30"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-md"
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white opacity-10" />
                  )}

                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all ${isActive
                      ? "bg-white/60 text-blue-800"
                      : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}
                  >
                    {item.icon}
                  </div>

                  {expanded && (
                    <span className="whitespace-nowrap relative z-10">{item.name}</span>
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
            onClick={handleToggle}
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