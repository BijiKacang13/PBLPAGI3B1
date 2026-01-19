"use client";

import Navbar from "@/components/Navbar";
import { api } from "@/lib/api/axiosClient";
import { ChevronDown, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import EditRapbsKegiatan from "@/components/EditRapbsKegiatan";
import SuccessAlert from "@/components/SuccessAlert";
import AlertMessage from "@/components/AlertMessage";
import { useRouter } from "next/navigation";

type RapbsKegiatan = {
  id_budget_rapbs_kegiatan: number;
  id_kegiatan: string;
  id_unit: string;
  kode_kegiatan: string;
  kegiatan: string;
  budget_rapbs_kegiatan: number;
  items?: any[];
};

type Unit = {
  id_unit: number;
  kode_unit: string;
  unit: string;
};

export default function RapbsKegiatanPage() {
  const [data, setData] = useState<RapbsKegiatan[]>([]);
  const [selected, setSelected] = useState<RapbsKegiatan | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // Unit Filter
  const [unit, setUnit] = useState("all");
  const [unitList, setUnitList] = useState<Unit[]>([]);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userUnitName, setUserUnitName] = useState<string>("");

  const [fileName, setFileName] = useState("Tidak ada file");
  const [file, setFile] = useState<File | null>(null);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Alert states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Error/Warning states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ======================
  // FETCH UNIT LIST
  // ======================
  const fetchUnits = async () => {
    try {
      const res = await api.get("/input-transaksi/form-data");
      const data = res.data || res;
      setUnitList(data.unit || data.units || []);
    } catch (err) {
      console.error("Error fetching units:", err);
    }
  };

  // ======================
  // FETCH DATA
  // ======================
  const fetchRapbsKegiatan = async (selectedUnit: string = unit) => {
    setLoading(true);
    try {
      const params = selectedUnit !== "all" ? `?unit=${selectedUnit}` : "";
      const res = await api.get(`/budget-rapbs-kegiatan${params}`);

      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

      setData(arr);
    } catch (error) {
      console.error("Fetch gagal:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("user_role") || "";
    setUserRole(role);

    // Get user's unit name from localStorage for akuntan_unit
    const unitName = localStorage.getItem("user_unit_name") || "";
    setUserUnitName(unitName);

    fetchUnits();
    fetchRapbsKegiatan();
  }, []);

  // Re-fetch when unit changes
  useEffect(() => {
    fetchRapbsKegiatan(unit);
  }, [unit]);

  // ======================
  // IMPORT EXCEL
  // ======================
  const handleImportExcel = async () => {
    if (!file) {
      return;
    }

    setLoadingImport(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-rapbs-kegiatan/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && (result.success !== false)) {
        setSuccessMessage("BERHASIL IMPORT DATA RAPBS KEGIATAN");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        fetchRapbsKegiatan();
        setFile(null);
        setFileName("Tidak ada file");
      } else {
        setErrorMessage(result.message || result.error || "Gagal import");
        setShowError(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Gagal import");
      setShowError(true);
    } finally {
      setLoadingImport(false);
    }
  };

  // ======================
  // FILTER & PAGINATION
  // ======================
  const filtered = data.filter(
    (item) =>
      item.kegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.kode_kegiatan.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      {/* Content */}
      <main className="w-full px-4 py-6 md:px-6 lg:px-10">
        <div className="bg-white shadow-md rounded-xl px-6 py-5 md:px-8 w-full mb-6">
          <div className="flex items-center gap-3 mb-2">
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
              RAPBS KEGIATAN
            </h1>
            <div className="w-10 h-10" />
          </div>

          {/* UNIT INDICATOR - For Akuntan Unit */}
          {userRole === "akuntan_unit" && userUnitName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Unit:</span> {userUnitName}
              </p>
            </div>
          )}

          {/* Dropdown Unit - Only for Admin */}
          {userRole === "admin" && (
            <div className="relative text-sm mb-3">
              <label className="block text-gray-700 mb-1">Unit</label>
              <div
                onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 flex justify-between items-center cursor-pointer shadow-sm bg-white"
              >
                <span>
                  {unit === "all"
                    ? "Akumulasi (Semua Unit)"
                    : unitList.find((u) => String(u.id_unit) === unit)?.unit || "Pilih Unit"}
                </span>
                <ChevronDown className={`w-4 h-4 transition ${showUnitDropdown ? "rotate-180" : ""}`} />
              </div>

              <AnimatePresence>
                {showUnitDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute w-full bg-white border border-gray-200 shadow-xl rounded-xl mt-2 py-2 z-20 max-h-60 overflow-y-auto"
                  >
                    <div
                      onClick={() => {
                        setUnit("all");
                        setShowUnitDropdown(false);
                      }}
                      className={`px-4 py-2 cursor-pointer ${unit === "all" ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50"}`}
                    >
                      Akumulasi (Semua Unit)
                    </div>
                    {unitList.map((u) => (
                      <div
                        key={u.id_unit}
                        onClick={() => {
                          setUnit(String(u.id_unit));
                          setShowUnitDropdown(false);
                        }}
                        className={`px-4 py-2 cursor-pointer ${String(u.id_unit) === unit ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50"}`}
                      >
                        {u.kode_unit} - {u.unit}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Download Template */}
          <a
            href="/assets/templates/Template_Rapbs_Kegiatan.xlsx"
            download="Template_Rapbs_Kegiatan.xlsx"
            className="text-blue-600 text-sm font-semibold underline block text-center md:text-right mb-3"
          >
            Download Template Import RAPBS per-Kegiatan
          </a>

          {/* Import */}
          <div className="flex items-center gap-2 mb-4">
            <label
              htmlFor="fileUpload"
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-300 transition"
            >
              Pilih File
            </label>
            <input
              id="fileUpload"
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setFileName(f?.name || "Tidak ada file");
              }}
            />
            <input
              type="text"
              value={fileName}
              readOnly
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-500 bg-gray-50 outline-none"
            />
            <button
              onClick={handleImportExcel}
              disabled={!file || loadingImport}
              className="bg-blue-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingImport ? "Mengimpor..." : "Import"}
            </button>
          </div>

          {/* SEARCH INPUT */}
          <input
            type="text"
            placeholder="Cari kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Dropdown Limit */}
          <div className="relative text-sm mb-3">
            <label className="block text-gray-700 mb-1">
              Tampilkan Data per Halaman
            </label>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-32 border border-gray-200 rounded-xl px-4 py-2 flex justify-between cursor-pointer shadow-sm bg-white"
            >
              <span>{limit}</span>
              <ChevronDown
                className={`w-4 h-4 transition ${showDropdown ? "rotate-180" : ""
                  }`}
              />
            </div>

            {showDropdown && (
              <div className="absolute w-32 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 py-2 z-10">
                {[2, 5, 10].map((v) => (
                  <div
                    key={v}
                    onClick={() => {
                      setLimit(v);
                      setShowDropdown(false);
                    }}
                    className={`px-4 py-2 cursor-pointer ${limit === v ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50"
                      }`}
                  >
                    {v} Data
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-xl border border-gray-300">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Kode</th>
                  <th className="px-4 py-2 text-left">Kegiatan</th>
                  <th className="px-4 py-2 text-right">Budget</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-gray-600">Memuat data...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((item) => (
                    <tr key={item.id_kegiatan} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-gray-600">{item.kode_kegiatan}</td>
                      <td className="px-4 py-2">{item.kegiatan}</td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.budget_rapbs_kegiatan)}
                      </td>
                      <td className="px-4 py-2 flex justify-end">
                        <button
                          onClick={() => {
                            setSelected(item);
                            setOpenEdit(true);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-lg text-sm ${page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-200 text-gray-800 hover:bg-blue-400"
                }`}
            >
              Sebelumnya
            </button>

            <span className="text-gray-700 text-sm font-semibold">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-lg text-sm ${page === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-200 text-gray-800 hover:bg-blue-400"
                }`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </main>

      <p className="text-gray-400 text-xs italic mt-8 text-center">
        Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
      </p>

      <EditRapbsKegiatan
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchRapbsKegiatan}
        data={selected}
      />

      {/* SUCCESS ALERT */}
      <SuccessAlert
        show={showSuccess}
        message={successMessage}
      />

      <AlertMessage
        show={showError}
        type="error"
        message={errorMessage}
        onClose={() => setShowError(false)}
      />

      <AlertMessage
        show={showWarning}
        type="warning"
        message={warningMessage}
        onClose={() => setShowWarning(false)}
      />
    </div>
  );
}
