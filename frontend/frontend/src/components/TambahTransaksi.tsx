"use client";

import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * =========================
 * TYPE SCRIPT INTERFACE
 * =========================
 */

interface FormTransaksi {
  tanggal: string;
  keterangan: string;
  jenis_transaksi: "Terikat" | "Tidak Terikat" | "";
  id_unit: number | "";
  id_divisi: number | "";
  id_kegiatan: number | "";
  id_sumber_anggaran: number | "";
}

interface DetailAkun {
  id: number; // frontend only
  id_akun: number | "";
  debit: string;
  kredit: string;
}

interface StoreTransaksiPayload {
  tanggal: string;
  keterangan: string;
  jenis_transaksi: string;
  id_unit: number;
  id_divisi: number;
  id_kegiatan: number;
  id_sumber_anggaran: number;
  id_akun: number[];
  debit: string[];
  kredit: string[];
}

/**
 * =========================
 * API RESPONSE INTERFACE
 * =========================
 */

interface OptionUnit {
  id_unit: number;
  kode_unit: string;
  unit: string;
}

interface OptionDivisi {
  id_divisi: number;
  divisi: string;
}

interface OptionKegiatan {
  id_kegiatan: number;
  kode_kegiatan: string;
  kegiatan: string;
}

interface OptionAkun {
  id_akun: number;
  kode_akun: string;
  akun: string;
}

interface FormDataResponse {
  success: boolean;
  data: {
    unit: OptionUnit[];
    divisi: OptionDivisi[];
    kegiatan: OptionKegiatan[];
    akun: OptionAkun[];
    sumber_anggaran: OptionAkun[];
  };
}


/**
 * =========================
 * HELPER AUTH TOKEN
 * =========================
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token"); // samakan dengan auth kamu
};

export default function TambahTransaksi({ open, onClose }: any) {
  /**
   * =========================
   * STATE
   * =========================
   */
  const [form, setForm] = useState<FormTransaksi>({
    tanggal: "",
    keterangan: "",
    jenis_transaksi: "",
    id_unit: "",
    id_divisi: "",
    id_kegiatan: "",
    id_sumber_anggaran: "",
  });

  /**
   * =========================
   * USER ROLE STATE
   * =========================
   */
  const [userRole, setUserRole] = useState<string>("");
  const [userUnitId, setUserUnitId] = useState<number | null>(null);

  /**
   * =========================
   * DROPDOWN STATE
   * =========================
   */
  const [units, setUnits] = useState<OptionUnit[]>([]);
  const [divisis, setDivisis] = useState<OptionDivisi[]>([]);
  const [kegiatans, setKegiatans] = useState<OptionKegiatan[]>([]);
  const [akuns, setAkuns] = useState<OptionAkun[]>([]);
  const [sumberAnggaran, setSumberAnggaran] = useState<OptionAkun[]>([]);


  const [accounts, setAccounts] = useState<DetailAkun[]>([
    { id: 1, id_akun: "", debit: "", kredit: "" },
    { id: 2, id_akun: "", debit: "", kredit: "" },
  ]);

  /**
   * =========================
   * HANDLER
   * =========================
   */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (
    id: number,
    field: keyof DetailAkun,
    value: any
  ) => {
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === id ? { ...acc, [field]: value } : acc
      )
    );
  };

  const addAccount = () => {
    const newId = Math.max(...accounts.map(a => a.id)) + 1;
    setAccounts([...accounts, { id: newId, id_akun: "", debit: "", kredit: "" }]);
  };

  const removeAccount = (id: number) => {
    if (accounts.length > 2) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  /**
   * =========================
   * SUBMIT
   * =========================
   */
  const handleSubmit = async () => {
    const token = getAuthToken();

    if (!token) {
      alert("Token tidak ditemukan, silakan login ulang.");
      return;
    }

    const payload: StoreTransaksiPayload = {
      tanggal: form.tanggal,
      keterangan: form.keterangan,
      jenis_transaksi: form.jenis_transaksi,
      id_unit: Number(form.id_unit),
      id_divisi: Number(form.id_divisi),
      id_kegiatan: Number(form.id_kegiatan),
      id_sumber_anggaran: Number(form.id_sumber_anggaran),
      id_akun: accounts.map(a => Number(a.id_akun)),
      debit: accounts.map(a => a.debit || "0"),
      kredit: accounts.map(a => a.kredit || "0"),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/input-transaksi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error(result);
        alert(result.message || "Gagal menyimpan transaksi");
        return;
      }

      alert("Transaksi berhasil disimpan");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan server");
    }
  };

  /**
   * =========================
   * EFFECT
   * =========================
   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  /**
   * =========================
   * FETCH FORM DATA
   * =========================
   */
  useEffect(() => {
    if (!open) return;

    const fetchFormData = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/input-transaksi/form-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result: FormDataResponse = await response.json();

        if (!response.ok || !result.success) {
          console.error("Gagal load form data", result);
          return;
        }

        setUnits(result.data.unit);
        setDivisis(result.data.divisi);
        setKegiatans(result.data.kegiatan);
        setAkuns(result.data.akun);
        setSumberAnggaran(result.data.sumber_anggaran);

        // Get user role and unit from localStorage
        const role = localStorage.getItem("user_role") || "";
        const unitId = localStorage.getItem("user_unit_id");

        setUserRole(role);

        // If user is akuntan_unit, set their unit automatically
        if (role === "akuntan_unit" && unitId) {
          const parsedUnitId = parseInt(unitId);
          setUserUnitId(parsedUnitId);
          setForm(prev => ({ ...prev, id_unit: parsedUnitId }));
        }

      } catch (error) {
        console.error("Error fetch form data:", error);
      }
    };

    fetchFormData();
  }, [open]);

  /**
   * =========================
   * RENDER
   * =========================
   */
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-lg p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* ================= CLOSE BUTTON ================= */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ================= HEADER ================= */}
            <h3 className="text-center font-semibold text-gray-800 mb-4 mt-2">
              TAMBAH TRANSAKSI
            </h3>

            {/* ================= BODY ================= */}
            <div className="space-y-4">
              {/* Tanggal */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="keterangan"
                  value={form.keterangan}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {/* Grid Master Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Jenis Transaksi */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Jenis Transaksi
                  </label>
                  <select
                    name="jenis_transaksi"
                    value={form.jenis_transaksi}
                    onChange={handleChange}
                    className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="Terikat">Terikat</option>
                    <option value="Tidak Terikat">Tidak Terikat</option>
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Unit</label>
                  <select
                    name="id_unit"
                    value={form.id_unit}
                    onChange={(e) =>
                      setForm({ ...form, id_unit: e.target.value ? Number(e.target.value) : "" })
                    }
                    disabled={userRole === "akuntan_unit"}
                    className={`w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none ${userRole === "akuntan_unit" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="">Pilih Unit</option>
                    {userRole === "akuntan_unit" && userUnitId
                      ? units
                        .filter((u) => u.id_unit === userUnitId)
                        .map((u) => (
                          <option key={u.id_unit} value={u.id_unit}>
                            {u.kode_unit} - {u.unit}
                          </option>
                        ))
                      : units.map((u) => (
                        <option key={u.id_unit} value={u.id_unit}>
                          {u.kode_unit} - {u.unit}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Divisi */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Divisi</label>
                  <select
                    name="id_divisi"
                    value={form.id_divisi}
                    onChange={(e) =>
                      setForm({ ...form, id_divisi: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Pilih Divisi</option>
                    {divisis.map(d => (
                      <option key={d.id_divisi} value={d.id_divisi}>
                        {d.divisi}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kegiatan */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Kegiatan</label>
                  <select
                    name="id_kegiatan"
                    value={form.id_kegiatan}
                    onChange={(e) =>
                      setForm({ ...form, id_kegiatan: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Pilih Kegiatan</option>
                    {kegiatans.map(k => (
                      <option key={k.id_kegiatan} value={k.id_kegiatan}>
                        {k.kode_kegiatan} - {k.kegiatan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sumber Anggaran */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Sumber Anggaran
                </label>
                <select
                  name="id_sumber_anggaran"
                  value={form.id_sumber_anggaran}
                  onChange={(e) =>
                    setForm({ ...form, id_sumber_anggaran: e.target.value ? Number(e.target.value) : "" })
                  }
                  className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">Pilih Sumber Anggaran</option>
                  {sumberAnggaran.map(s => (
                    <option key={s.id_akun} value={s.id_akun}>
                      {s.kode_akun} - {s.akun}
                    </option>
                  ))}
                </select>
              </div>

              {/* ================= DETAIL AKUN ================= */}
              <div className="border-t pt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Detail Akun
                </h3>

                {accounts.map((acc, index) => (
                  <div
                    key={acc.id}
                    className="border border-gray-300 rounded-xl p-3 mb-3 space-y-2"
                  >
                    {/* Label for first two default rows */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">
                        {index === 0 ? "Akun Debit" : index === 1 ? "Akun Kredit" : `Akun ${index + 1}`}
                      </span>
                      {accounts.length > 2 && index >= 2 && (
                        <button
                          onClick={() => removeAccount(acc.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <select
                      value={acc.id_akun}
                      onChange={(e) =>
                        handleAccountChange(acc.id, "id_akun", Number(e.target.value))
                      }
                      className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">Pilih Akun</option>
                      {akuns.map(a => (
                        <option key={a.id_akun} value={a.id_akun}>
                          {a.kode_akun} - {a.akun}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Debit"
                        value={acc.debit}
                        onChange={(e) =>
                          handleAccountChange(acc.id, "debit", e.target.value)
                        }
                        className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Kredit"
                        value={acc.kredit}
                        onChange={(e) =>
                          handleAccountChange(acc.id, "kredit", e.target.value)
                        }
                        className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addAccount}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Plus size={16} /> Tambah Akun
                </button>
              </div>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-red-600 transition"
              >
                BATAL
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-blue-700 transition"
              >
                SIMPAN
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
