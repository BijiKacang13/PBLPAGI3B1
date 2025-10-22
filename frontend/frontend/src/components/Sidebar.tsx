"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, Folder, Users, FileText } from "lucide-react";

const menus = [
  { name: "Beranda", icon: <Home size={20} />, path: "/beranda" },
  {
    name: "Akun",
    icon: <Users size={20} />,
    children: [
      { name: "Admin", path: "/akun/admin" },
      { name: "Petugas", path: "/akun/petugas" },
    ],
  },
  { name: "Pencatatan", icon: <Folder size={20} />, path: "/pencatatan" },
  { name: "Laporan", icon: <FileText size={20} />, path: "/laporan" },
];

export default function SidebarHover() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`h-screen bg-white border-r transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4">
        <h1 className={`text-blue-700 font-bold text-lg transition-opacity ${expanded ? "opacity-100" : "opacity-0"}`}>
          SIA
        </h1>
      </div>

      <ul className="mt-6 space-y-2">
        {menus.map((item) => (
          <li key={item.name}>
            <div className="group relative flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
              <div className="text-gray-700">{item.icon}</div>
              {expanded && (
                <span className="ml-3 text-gray-800">{item.name}</span>
              )}
              {!expanded && item.children && (
                <div className="absolute left-full top-0 ml-2 bg-white border shadow-lg rounded-md p-2 hidden group-hover:block">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.path}
                      className="block text-sm text-gray-700 hover:text-blue-600 px-3 py-1"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
