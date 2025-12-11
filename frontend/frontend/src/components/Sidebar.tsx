"use client";

import { useState } from "react";
import Link from "next/link";
import {
  House,
  Users,
  CreditCard,
  Activity,
  FolderPlus,
  ChartNoAxesColumn,
} from "lucide-react";

// == SAMA PERSIS KAYAK NAVBARBOTTOM ==
const menus = [
  { name: "Beranda", path: "/admin/beranda", icon: <House size={20} /> },
  { name: "Akun", path: "/akun", icon: <Users size={20} /> },
  { name: "Keuangan", path: "/keuangan", icon: <CreditCard size={20} /> },
  { name: "Kegiatan", path: "/kegiatan", icon: <Activity size={20} /> },
  { name: "Pencatatan", path: "/pencatatan", icon: <FolderPlus size={20} /> },
  { name: "Laporan", path: "/laporan", icon: <ChartNoAxesColumn size={20} /> },
];

export default function SidebarHover() {
  const [expanded, setExpanded] = useState(false);

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
          {menus.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <div className="text-gray-700">{item.icon}</div>

                {expanded && (
                  <span className="ml-3 text-gray-800">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
