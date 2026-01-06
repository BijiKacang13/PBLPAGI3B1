"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, List, Eye, Edit2, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import NavbarBottom from "@/components/NavbarBottom";
import Navbar from "@/components/Navbar";
import CalkFormModal from "@/components/CalkFormModal";

// Types
interface CALK {
  id_calk: number;
  keterangan: string;
  file: string;
  file_url?: string;
  urutan: number;
}

interface UserRole {
  role: "admin" | "auditor" | "akuntan_unit";
}

export default function CatatanLaporanKeuangan() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const APP_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, ""); // drop /api for static file access

  // State management
  const [loading, setLoading] = useState(false);
  const [calkData, setCalkData] = useState<CALK[]>([]);
  const [filteredData, setFilteredData] = useState<CALK[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<UserRole>({ role: "admin" });
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCalk, setSelectedCalk] = useState<CALK | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    keterangan: "",
    file: null as File | null,
  });

  // Alert states
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  // Fetch CALK data on mount
  useEffect(() => {
    fetchCalkData();
    // Get user role from localStorage or API
    const role = localStorage.getItem("user_role") as "admin" | "auditor" | "akuntan_unit";
    if (role) {
      setUserRole({ role });
    }
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(calkData);
    } else {
      const filtered = calkData.filter((item) =>
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, calkData]);

  const fetchCalkData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/laporan/calk`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setCalkData(result.data);
        setFilteredData(result.data);
      } else {
        showAlert("error", result.message || "Gagal mengambil data");
      }
    } catch (error) {
      console.error("Error fetching CALK data:", error);
      showAlert("error", "Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCalk = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("keterangan", formData.keterangan);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const response = await fetch(`${API_BASE_URL}/laporan/calk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          // JANGAN tambahkan Content-Type, biarkan browser yang set otomatis untuk FormData
        },
        body: formDataToSend,
      });

      // Tambahkan pengecekan response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        showAlert("success", "CALK berhasil ditambahkan");
        fetchCalkData();
      } else {
        showAlert("error", result.message || "Gagal menambahkan CALK");
      }
    } catch (error) {
      console.error("Error adding CALK:", error);
      showAlert("error", "Terjadi kesalahan saat menambahkan CALK");
    } finally {
      setLoading(false);
      setShowAddModal(false); // tutup otomatis setelah eksekusi selesai
      resetForm();
    }
  };

  const handleEditCalk = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCalk) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("keterangan", formData.keterangan);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }
      formDataToSend.append("_method", "PUT");

      const response = await fetch(`${API_BASE_URL}/laporan/calk/${selectedCalk.id_calk}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        showAlert("success", "CALK berhasil diperbarui");
        fetchCalkData();
      } else {
        showAlert("error", result.message || "Gagal memperbarui CALK");
      }
    } catch (error) {
      console.error("Error updating CALK:", error);
      showAlert("error", "Terjadi kesalahan saat memperbarui CALK");
    } finally {
      setLoading(false);
      setShowEditModal(false); // tutup otomatis setelah eksekusi selesai
      resetForm();
    }
  };

  const handleDeleteCalk = async (id: number) => {
    if (!confirm("Yakin ingin menghapus CALK ini?")) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/laporan/calk/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        showAlert("success", "CALK berhasil dihapus");
        fetchCalkData();
      } else {
        showAlert("error", result.message || "Gagal menghapus CALK");
      }
    } catch (error) {
      console.error("Error deleting CALK:", error);
      showAlert("error", "Terjadi kesalahan saat menghapus CALK");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const openEditModal = (calk: CALK) => {
    setSelectedCalk(calk);
    setFormData({
      keterangan: calk.keterangan,
      file: null,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      keterangan: "",
      file: null,
    });
    setSelectedCalk(null);
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-20">
      <Navbar />

      {/* Main Content */}
      <main className="flex flex-col items-center mt-6 px-4 md:px-6 lg:px-10 w-full max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white shadow-md rounded-xl p-5 w-full">
          {/* Alert */}
          {alert.show && (
            <div
              className={`mb-4 p-4 rounded-lg ${alert.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
                }`}
            >
              <div className="flex justify-between items-center">
                <span>{alert.message}</span>
                <button
                  onClick={() => setAlert({ ...alert, show: false })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold text-lg flex-1 text-center">
              CATATAN ATAS LAPORAN KEUANGAN
            </h2>
            <div className="w-10" />
          </div>

          {/* Add Button (Admin only) */}
          {userRole.role === "admin" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#7CA6FF] text-white py-2 rounded-full font-semibold mb-4 hover:bg-[#6a95ee] transition-colors"
            >
              <Plus size={18} />
              Tambah CALK
            </button>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari CALK..."
              className="w-full border rounded-full px-4 py-2 pl-10 text-sm text-gray-600 bg-gray-50"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* CALK List */}
        {loading ? (
          <div className="w-full mt-6 text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="w-full mt-6 space-y-3">
            {filteredData.map((calk, index) => (
              <div
                key={calk.id_calk}
                className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-[#BDE1FF] p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {userRole.role === "admin" && (
                      <List className="text-gray-500 cursor-move" size={20} />
                    )}
                    <button
                      onClick={() => toggleExpand(calk.id_calk)}
                      className="flex-1 text-left font-medium text-gray-800 flex items-center justify-between"
                    >
                      <span>
                        {index + 1}. {calk.keterangan}
                      </span>
                      {expandedItems.has(calk.id_calk) ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>

                  {/* Edit Button (Admin only) */}
                  {userRole.role === "admin" && (
                    <button
                      onClick={() => openEditModal(calk)}
                      className="ml-2 p-2 hover:bg-white rounded-full transition-colors"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Expanded Content */}
                {expandedItems.has(calk.id_calk) && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <a
                      href={
                        calk.file_url
                          ? calk.file_url
                          : `${APP_BASE_URL}/storage/${calk.file}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#7CA6FF] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#6a95ee] transition-colors"
                    >
                      <Eye size={16} />
                      Lihat File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full mt-6 text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">
              {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data CALK"}
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-gray-400 text-xs italic mt-8 text-center">
          Sistem Informasi Akuntansi Yayasan <br /> Darussalam Batam | 2025
        </p>
      </main>

      <CalkFormModal
        open={showAddModal}
        mode="add"
        loading={loading}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleAddCalk}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      />

      <CalkFormModal
        open={showEditModal && !!selectedCalk}
        mode="edit"
        loading={loading}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleEditCalk}
        onDelete={selectedCalk ? () => handleDeleteCalk(selectedCalk.id_calk) : undefined}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
      />

      <NavbarBottom />
    </div>
  );
}