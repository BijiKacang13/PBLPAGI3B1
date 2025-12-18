"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

interface User {
  nama: string;
  email: string;
}

interface Auditor {
  id_auditor: string;
  user: User;
}

export default function AuditorPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    loadAuditor();
  }, []);

  const loadAuditor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const response = await fetch(`${API_BASE_URL}/auditor${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || `Failed to fetch data: ${response.status}`);
      }

      if (result.success && result.data) {
        // Handle both paginated and non-paginated responses
        if (result.data.last_page !== undefined) {
          // Paginated response: data.data contains the array
          setFilteredData(result.data.data || []);
        } else if (Array.isArray(result.data)) {
          // Non-paginated response: data is directly an array
          setFilteredData(result.data);
        } else {
          setFilteredData([]);
        }
      } else {
        setFilteredData([]);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Gagal mengambil data auditor";
      setError(errorMessage);
      console.error("Error loading auditor:", err);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadAuditor();
  };

  const handleCardClick = (id: string) => {
    // PERBAIKAN: Sesuaikan path dengan struktur file Anda
    // Pilih salah satu dari opsi berikut sesuai struktur folder Anda:
    
    // Opsi 1: Jika file detail ada di /app/akun/auditor/detail/page.tsx
    router.push(`/akun/auditor/auditor_detail?id=${id}`);
    
    // Opsi 2: Jika file detail ada di /app/akun/auditor/[id]/page.tsx (dynamic route)
    // router.push(`/akun/auditor/${id}`);
    
    // Opsi 3: Jika file detail ada di /app/akun/auditor/auditor_detail/page.tsx
    // router.push(`/akun/auditor/auditor_detail?id=${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          
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
              AUDITOR
            </h1>
            <div className="w-10 h-10" />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Filter Section */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              {/* Search Input */}
              <div className="md:col-span-10">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari nama auditor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleFilter();
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleFilter}
                  disabled={loading}
                  className="w-full bg-[#004CDF] text-white py-2 px-4 rounded-lg hover:bg-[#1A3E85] transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Filter size={18} />
                  )}
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* List Auditor */}
          <div className="space-y-3">
            {loading && filteredData.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-[#004CDF] mx-auto mb-2" />
                <p className="text-gray-600">Memuat data...</p>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((data) => (
                <div
                  key={data.id_auditor}
                  onClick={() => handleCardClick(data.id_auditor)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div className="text-gray-800">
                      <strong className="text-lg">{data.user?.nama || "N/A"}</strong>
                      {data.user?.email && (
                        <p className="text-sm text-gray-600">{data.user.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada data auditor ditemukan</p>
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      loadAuditor();
                    }}
                    className="mt-2 text-[#004CDF] hover:underline"
                  >
                    Reset pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center">
          <p className="text-gray-400 text-sm">
            Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025
          </p>
        </div>
      </main>
    </div>
  );
}