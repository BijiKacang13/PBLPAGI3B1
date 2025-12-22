"use client";

import { useEffect, useState } from "react";
import { UserPlus, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import SuccessAlert from "@/components/SuccessAlert";
import { userService, type Unit, type Divisi } from "@/lib/api/userService";

/* ===============================
   TYPES
================================ */
type TipeAkun = "unit" | "auditor";

type PermissionKey =
  | "view_rapbs_akun"
  | "create_rapbs_akun"
  | "update_rapbs_akun"
  | "view_rapbs_kegiatan"
  | "create_rapbs_kegiatan"
  | "update_rapbs_kegiatan"
  | "view_jurnal_umum"
  | "create_jurnal_umum"
  | "update_jurnal_umum"
  | "delete_jurnal_umum"
  | "view_buku_besar"
  | "create_buku_besar"
  | "delete_buku_besar"
  | "view_laporan_komprehensif"
  | "view_laporan_posisi_keuangan"
  | "view_laporan_arus_kas"
  | "view_laporan_perubahan_aset_neto"
  | "view_laporan_catatan_atas_laporan_keuangan"
  | "view_laporan_proyeksi_rencana_dan_realisasi_anggaran";

export default function TambahUser() {
  const router = useRouter();

  /* ===============================
     STATE
  ================================ */
  const [tipeAkun, setTipeAkun] = useState<TipeAkun>("unit");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkAllAccess, setCheckAllAccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const [units, setUnits] = useState<Unit[]>([]);
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);

  const [formData, setFormData] = useState({
    id_unit: "",
    id_divisi: "",
    nama: "",
    email: "",
    telp: "",
    username: "",
    password: "",
    password_confirmation: "",
  });

  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    view_rapbs_akun: false,
    create_rapbs_akun: false,
    update_rapbs_akun: false,
    view_rapbs_kegiatan: false,
    create_rapbs_kegiatan: false,
    update_rapbs_kegiatan: false,
    view_jurnal_umum: false,
    create_jurnal_umum: false,
    update_jurnal_umum: false,
    delete_jurnal_umum: false,
    view_buku_besar: false,
    create_buku_besar: false,
    delete_buku_besar: false,
    view_laporan_komprehensif: false,
    view_laporan_posisi_keuangan: false,
    view_laporan_arus_kas: false,
    view_laporan_perubahan_aset_neto: false,
    view_laporan_catatan_atas_laporan_keuangan: false,
    view_laporan_proyeksi_rencana_dan_realisasi_anggaran: false,
  });

  const accessModules: { name: string; keys: (PermissionKey | null)[] }[] = [
    { name: "RAPBS Akun", keys: ["view_rapbs_akun", "create_rapbs_akun", "update_rapbs_akun"] },
    { name: "RAPBS Kegiatan", keys: ["view_rapbs_kegiatan", "create_rapbs_kegiatan", "update_rapbs_kegiatan"] },
    { name: "Jurnal Umum", keys: ["view_jurnal_umum", "create_jurnal_umum", "update_jurnal_umum", "delete_jurnal_umum"] },
    { name: "Buku Besar", keys: ["view_buku_besar", "create_buku_besar", null, "delete_buku_besar"] },
    { name: "Laporan Komprehensif", keys: ["view_laporan_komprehensif"] },
    { name: "Laporan Posisi Keuangan", keys: ["view_laporan_posisi_keuangan"] },
    { name: "Laporan Arus Kas", keys: ["view_laporan_arus_kas"] },
    { name: "Laporan Perubahan Aset Neto", keys: ["view_laporan_perubahan_aset_neto"] },
    { name: "Laporan CALK", keys: ["view_laporan_catatan_atas_laporan_keuangan"] },
    { name: "Laporan Proyeksi", keys: ["view_laporan_proyeksi_rencana_dan_realisasi_anggaran"] },
  ];

  /* ===============================
     EFFECT
  ================================ */
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const data = await userService.getFormData();
        setUnits(data.unit);
        setDivisiList(data.divisi);
      } catch (e: any) {
        setError(e.message || "Gagal memuat data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchFormData();
  }, []);

  /* ===============================
     HANDLERS
  ================================ */
  const handleBack = () => router.push("/akun");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handlePermissionChange = (key: PermissionKey) => {
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleCheckAll = () => {
    const value = !checkAllAccess;
    setCheckAllAccess(value);

    const updated = {} as Record<PermissionKey, boolean>;
    (Object.keys(permissions) as PermissionKey[]).forEach((k) => (updated[k] = value));
    setPermissions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi tidak sama");
      return;
    }

    setIsLoading(true);

    try {
      if (tipeAkun === "unit") {
        if (!formData.id_unit) throw new Error("Unit wajib dipilih");

        await userService.createAkuntanUnit({
          nama: formData.nama,
          username: formData.username,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          email: formData.email,
          telp: formData.telp,
          id_unit: Number(formData.id_unit),
          ...permissions,
        });
      } else {
        if (!formData.id_divisi) throw new Error("Divisi wajib dipilih");

        await userService.createUser({
          nama: formData.nama,
          username: formData.username,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          email: formData.email,
          telp: formData.telp,
          id_divisi: Number(formData.id_divisi),
          role: "auditor",
        });
      }

      setShowSuccess(true);
      setTimeout(() => router.push("/akun"), 1500);
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
   
      <main className="flex-1 w-full pb-20 sm:pb-6">
        <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
          {/* Back Button - Desktop */}
          <button
            onClick={handleBack}
            className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
            disabled={isLoading}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="sm:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
                    disabled={isLoading}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    <h5 className="text-lg sm:text-xl font-semibold text-black">Tambah User</h5>
                  </div>
                </div>
                
                <select
                  name="tipe_akun"
                  value={tipeAkun}
                  onChange={(e) => setTipeAkun(e.target.value as any)}
                  disabled={isLoading}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 border border-black/25 bg-white text-gray-700 rounded-lg focus:ring-2 focus:ring-[#004CDF] focus:border-transparent text-sm sm:text-base font-medium w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="unit">Akuntan Unit</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-4 sm:mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {isLoadingData && (
                <div className="w-full max-w-2xl mx-auto text-center py-8">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Memuat data...</p>
                  </div>
                </div>
              )}
              {!isLoadingData && (
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                
                {/* Profil Section */}
                <div>
                  <h6 className="font-semibold text-base sm:text-lg mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#004CDF] rounded"></div>
                    Profil
                  </h6>
                  
                  {tipeAkun === "unit" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="id_unit"
                        value={formData.id_unit}
                        onChange={handleChange}
                        disabled={isLoading || isLoadingData}
                        className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">Pilih Unit</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.kode_unit ? `${unit.kode_unit} - ` : ''}{unit.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {tipeAkun === "auditor" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Divisi <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="id_divisi"
                        value={formData.id_divisi}
                        onChange={handleChange}
                        disabled={isLoading || isLoadingData}
                        className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">Pilih Divisi</option>
                        {divisiList.map((divisi) => (
                          <option key={divisi.id} value={divisi.id}>
                            {divisi.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="contoh@email.com"
                        className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="telp"
                        value={formData.telp}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Akun Pengguna Section */}
                <div>
                  <h6 className="font-semibold text-base sm:text-lg mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#004CDF] rounded"></div>
                    Akun Pengguna
                  </h6>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Username untuk login"
                        className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Minimal 8 karakter"
                          className="w-full px-4 py-3 pr-12 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 transition disabled:opacity-50"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Ulangi password"
                          className="w-full px-4 py-3 pr-12 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004CDF] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 transition disabled:opacity-50"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {tipeAkun === "unit" && (
                  <>
                    <hr className="border-gray-200" />

                    {/* Hak Akses Section */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 pb-2 border-b">
                        <h6 className="font-semibold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                          <div className="w-1 h-5 bg-[#004CDF] rounded"></div>
                          Hak Akses
                        </h6>
                        <label className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition border border-blue-200">
                  <input
                    type="checkbox"
                    checked={checkAllAccess}
                    onChange={handleCheckAll}
                    disabled={isLoading || isLoadingData}
                    className="w-4 h-4 text-[#004CDF] border-gray-300 rounded focus:ring-[#004CDF] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                          <span className="text-sm font-medium text-gray-700">Pilih Semua Akses</span>
                        </label>
                      </div>

                      {/* Table - Responsive */}
                      <div className="overflow-x-auto border border-gray-300 rounded-lg">
                        <table className="min-w-full border-collapse">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="border-b border-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[140px]">Modul</th>
                              <th className="border-b border-l border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 w-16 sm:w-24">View</th>
                              <th className="border-b border-l border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 w-16 sm:w-24">Create</th>
                              <th className="border-b border-l border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 w-16 sm:w-24">Update</th>
                              <th className="border-b border-l border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 w-16 sm:w-24">Delete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {accessModules.map((module, idx) => (
                              <tr key={idx} className="hover:bg-blue-50 transition">
                                <td className="border-b border-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 font-medium">{module.name}</td>
                                {[0, 1, 2, 3].map((colIdx) => {
                                  const permission = module.keys[colIdx];
                                  return (
                                    <td key={colIdx} className="border-b border-l border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
                                      {permission ? (
                                        <input
                                          type="checkbox"
                                          checked={permissions[permission]}
                                          onChange={() => handlePermissionChange(permission)}
                                          disabled={isLoading || isLoadingData}
                                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#004CDF] border-gray-300 rounded focus:ring-[#004CDF] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                      ) : (
                                        <span className="text-gray-300 text-base sm:text-lg">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || isLoadingData}
                    className="w-full sm:flex-1 bg-gradient-to-r from-[#004CDF] to-[#0066FF] text-white font-semibold py-3 rounded-lg hover:from-[#003BB8] hover:to-[#0052CC] active:from-[#002E99] active:to-[#0047B3] transition shadow-md hover:shadow-lg text-sm sm:text-base order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Data</span>
                    )}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-gray-400 text-xs text-center mt-6 sm:mt-8">
            Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025
          </p>
        </div>
      </main>

      <SuccessAlert show={showSuccess} />

      <NavbarBottom />
    </div>
  );
}