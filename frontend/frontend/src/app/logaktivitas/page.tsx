"use client";

import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import { api } from "@/lib/api/axiosClient";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type LogItem = {
  id: number;
  user: { username: string } | null;
  aktivitas: string;
  waktu: string;
};

export default function LogAktivitasPage() {
  const [data, setData] = useState<LogItem[]>([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState("Semua User");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [openDropdown, setOpenDropdown] =
    useState<null | "user" | "date" | "limit">(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ============================
  // FORMATTER WAKTU 
  // ============================
  const formatTime = (raw: string) => {
    if (!raw) return "-";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw; // kalau salah format tetap tampil mentah

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  };

  // ============================
  // FETCH DATA
  // ============================
  const fetchLog = async () => {
    try {
      const res = await api.get("/log-aktivitas");

      const arr = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const mapped: LogItem[] = arr.map((x: any, i: number) => ({
        id: Number(x.id_log_activity ?? x.id ?? i + 1), // fallback biar gak NaN
        user: x.user ?? null,
        aktivitas: x.keterangan ?? "",
        waktu: x.created_at ?? "",
      }));

      setData(mapped);
    } catch (err) {
      console.error("Gagal fetch log aktivitas:", err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchLog();
  }, []);

  // Tutup dropdown ketika klik di luar
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ============================
  // USER LIST
  // ============================
  const userList = Array.from(
    new Set(
      data
        .map((x) => x.user?.username ?? null)
        .filter((u) => u && u.trim() !== "")
    )
  ) as string[];

  // ============================
  // FILTER
  // ============================
  const filtered = data.filter((item) => {
    const username = item.user?.username?.toLowerCase() ?? "";
    const act = item.aktivitas?.toLowerCase() ?? "";
    const q = search.toLowerCase();

    const matchSearch = username.includes(q) || act.includes(q);

    const matchUser =
      selectedUser !== "Semua User"
        ? item.user?.username === selectedUser
        : true;

    const t = new Date(item.waktu).getTime();
    const s = dateStart ? new Date(dateStart).getTime() : null;
    const e = dateEnd ? new Date(`${dateEnd} 23:59:59`).getTime() : null;

    const matchDate =
      s && e ? (t >= s && t <= e) : true;

    return matchSearch && matchUser && matchDate;
  });

  // ============================
  // PAGINATION
  // ============================
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  useEffect(() => setPage(1), [search, selectedUser, dateStart, dateEnd, limit]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-24">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-xl p-5 w-full max-w-sm md:max-w-full mb-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 className="flex-1 text-lg md:text-lg font-bold text-gray-800 text-center sm:text-start">
              LOG AKTIVITAS
            </h1>
            <div className="w-10 h-10" />
          </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Cari aktivitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-4 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* FILTER BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-sm">
          <div className="grid grid-cols-2 gap-3 text-sm w-full">
            <button
              onClick={() => setOpenDropdown(openDropdown === "user" ? null : "user")}
              className="w-full px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              {selectedUser}
            </button>

            <button
              onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
              className="w-full px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              {dateStart && dateEnd ? `${dateStart} → ${dateEnd}` : "Filter Tanggal"}
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedUser("Semua User");
              setDateStart("");
              setDateEnd("");
            }}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition sm:ml-auto"
          >
            Reset
          </button>
        </div>


        {/* USER DROPDOWN */}
        {openDropdown === "user" && (
          <div className="bg-white border border-blue-200 rounded-xl shadow-md p-3 mb-4">
            <p className="text-gray-700 text-sm mb-2">Pilih User:</p>

            <div
              onClick={() => {
                setSelectedUser("Semua User");
                setOpenDropdown(null);
              }}
              className={`px-3 py-2 rounded cursor-pointer ${
                selectedUser === "Semua User"
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              Semua User
            </div>

            {userList.map((u) => (
              <div
                key={u}
                onClick={() => {
                  setSelectedUser(u);
                  setOpenDropdown(null);
                }}
                className={`px-3 py-2 rounded cursor-pointer ${
                  selectedUser === u
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {u}
              </div>
            ))}
          </div>
        )}

        {/* DATE DROPDOWN */}
        {openDropdown === "date" && (
          <div className="bg-white border border-green-300 rounded-xl shadow-md p-4 mb-3">
            <p className="text-gray-700 text-sm mb-3 font-medium">
              Pilih Rentang Tanggal
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full">
                <label className="block text-xs text-gray-500 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full border px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs text-gray-500 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full border px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}


        {/* LIMIT DROPDOWN */}
        <div className="relative text-sm mb-4">
          <label className="block text-gray-700 mb-1">Tampilkan Data</label>

          <div
            onClick={() => setOpenDropdown(openDropdown === "limit" ? null : "limit")}
            className="w-36 bg-white border border-gray-200 rounded-xl px-4 py-2 flex justify-between cursor-pointer shadow-sm"
          >
            <span>{limit}</span>
            <ChevronDown
              className={`w-4 h-4 transition ${
                openDropdown === "limit" ? "rotate-180" : ""
              }`}
            />
          </div>

          {openDropdown === "limit" && (
            <div className="absolute w-36 bg-white border border-gray-200 rounded-xl shadow-sm mt-2 py-2 z-10">
              {[2, 5, 10].map((v) => (
                <div
                  key={v}
                  onClick={() => {
                    setLimit(v);
                    setOpenDropdown(null);
                  }}
                  className={`px-4 py-2 cursor-pointer ${
                    limit === v ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50"
                  }`}
                >
                  {v} Data
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-gray-700 min-w-[600px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Aktivitas</th>
                <th className="px-4 py-2 text-left">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{item.user?.username ?? "-"}</td>
                  <td className="px-4 py-2">{item.aktivitas}</td>
                  <td className="px-4 py-2">{formatTime(item.waktu)}</td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded-lg text-sm ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white"
            }`}
          >
            Sebelumnya
          </button>

          <span className="text-gray-700 text-sm font-semibold">
            Page {page} / {totalPages}
          </span>

          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-lg text-sm ${
              page === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white"
            }`}
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </main>

      <NavbarBottom />
    </div>
  );
}
