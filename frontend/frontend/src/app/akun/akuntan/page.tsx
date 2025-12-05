"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import React from "react";

interface Unit {
  id_unit: string;
  kode_unit: string;
  unit: string;
}

interface User {
  nama: string;
  email: string;
}

interface AkuntanUnit {
  id_akuntan_unit: string;
  user: User;
  unit: Unit;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: AkuntanUnit[];
}

export default function AkuntanUnitPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [filteredData, setFilteredData] = useState<AkuntanUnit[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load units dan akuntan unit secara paralel
      await Promise.all([
        loadUnits(),
        loadAkuntanUnit()
      ]);
    } catch (err) {
      setError("Gagal memuat data. Silakan refresh halaman.");
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  };

// Load units untuk dropdown
const loadUnits = async () => {
  try {
    const token = localStorage.getItem("auth_token");

    const response = await fetch(`${API_BASE_URL}/akuntan-unit/units`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch units: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      setUnits(Array.isArray(result.data) ? result.data : []);
    } else {
      setUnits([]);
      console.error("Failed to load units:", result);
    }
  } catch (err: any) {
    console.error("Error loading units:", err);
    setUnits([]);
    // Don't set error here to avoid overwriting more important errors
  }
};

const loadAkuntanUnit = async () => {
  setLoading(true);

  try {
    const token = localStorage.getItem("auth_token");
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (selectedUnit) queryParams.append("unit", selectedUnit);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await fetch(`${API_BASE_URL}/akuntan-unit${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.message || result.error || `Failed to fetch data: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Handle both paginated and non-paginated responses
    if (result.success && result.data) {
      // Check if response is paginated (has last_page property)
      if (result.data.last_page !== undefined) {
        // Paginated response: data.data contains the array
        setFilteredData(result.data.data || []);
        setTotalPages(result.data.last_page || 1);
      } else if (Array.isArray(result.data)) {
        // Non-paginated response: data is directly an array
        setFilteredData(result.data);
        setTotalPages(1);
      } else {
        // Fallback: try to extract array from nested structure
        setFilteredData([]);
        setTotalPages(1);
        console.error("Unexpected data structure:", result);
      }
    } else {
      // API returned success: false or no data
      setFilteredData([]);
      setTotalPages(1);
      if (result.message) {
        setError(result.message);
      }
    }
  } catch (err: any) {
    const errorMessage = err?.message || "Gagal mengambil data akuntan unit";
    setError(errorMessage);
    console.error("Error loading akuntan unit:", err);
    setFilteredData([]);
  } finally {
    setLoading(false);
  }
};
  

  const handleCardClick = (id: string) => {
    router.push(`/akun/akuntan/akuntan_detail?id=${id}`);
  };

  const handleFilter = async () => {
    setCurrentPage(1);
    setLoading(true);
    await loadAkuntanUnit().finally(() => setLoading(false));
  };

  const handleReset = () => {
    setSearch("");
    setSelectedUnit("");
    setCurrentPage(1);
    setLoading(true);
    loadAkuntanUnit().finally(() => setLoading(false));
  };

  if (loading && filteredData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#004CDF] mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          
          {/* Header */}
          <h5 className="text-xl font-semibold mb-4">Akuntan Unit</h5>

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
              <div className="md:col-span-7">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari nama akuntan..."
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

              {/* Unit Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">-- Semua Unit --</option>
                  {units.map((unit) => (
                    <option key={unit.id_unit} value={unit.id_unit}>
                      {unit.kode_unit} | {unit.unit}
                    </option>
                  ))}
                </select>
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

            {/* Reset Filter Button */}
            {(search || selectedUnit) && (
              <div className="mt-2">
                <button
                  onClick={handleReset}
                  className="text-sm text-[#004CDF] hover:underline"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* List Akuntan Unit */}
          <div className="space-y-3">
            {loading && filteredData.length > 0 ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-[#004CDF] mx-auto" />
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((data) => (
                <div
                  key={data.id_akuntan_unit}
                  onClick={() => handleCardClick(data.id_akuntan_unit)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div className="text-gray-800">
                      <strong className="text-lg">{data.user.nama}</strong>
                      <p className="text-sm text-gray-600">{data.user.email}</p>
                    </div>
                    <div className="text-gray-600">
                      <strong className="text-base">
                        {data.unit.kode_unit} | {data.unit.unit}
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada data akuntan unit ditemukan</p>
                {(search || selectedUnit) && (
                  <button
                    onClick={handleReset}
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
  )};