<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Unit;
use App\Models\User;
use App\Models\Hak_Akses;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AkuntanUnitController extends Controller
{
    /**
     * Constructor - Apply middleware
     */
    public function __construct()
    {
        // Middleware auth untuk semua method kecuali yang dikecualikan
        // Gunakan salah satu sesuai autentikasi Anda:
        
        // Jika menggunakan Sanctum (Token-based):
        // $this->middleware('auth:sanctum');
        
        // Jika menggunakan Session-based:
        // $this->middleware('auth');
        
        // Atau jika ingin beberapa endpoint tanpa auth (misal: getUnits untuk public):
        // $this->middleware('auth:sanctum')->except(['getUnits']);
    }

    /**
     * Display a listing of the resource.
     * GET /api/akuntan-unit
     */
    public function index(Request $request)
    {
        try {
            // Query awal dengan eager load relasi
            $query = Akuntan_Unit::with(['user', 'unit', 'hakAkses']);

            // Filter berdasarkan nama user (jika ada input)
            if ($request->filled('search')) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('nama', 'like', '%' . $request->search . '%');
                });
            }

            // Filter berdasarkan unit (jika ada input)
            if ($request->filled('unit')) {
                $query->where('id_unit', $request->unit);
            }

            // Pagination atau get all
            if ($request->has('per_page')) {
                $perPage = $request->get('per_page', 10);
                $akuntan_unit = $query->paginate($perPage);
            } else {
                $akuntan_unit = $query->get();
            }

            return response()->json([
                'success' => true,
                'message' => 'Data akuntan unit berhasil diambil',
                'data' => $akuntan_unit
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all units for dropdown
     * GET /api/akuntan-unit/units
     */
    public function getUnits()
    {
        try {
            $units = Unit::select('id_unit', 'kode_unit', 'unit')
                ->orderBy('kode_unit')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data unit berhasil diambil',
                'data' => $units
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/akuntan-unit
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|unique:user,username|max:255',
                'password' => 'required|string|min:8|confirmed',
                'id_unit' => 'required|exists:unit,id_unit',
                'email' => 'required|email',
                'telp' => 'required|string',
                // Hak Akses (optional, default false)
                'view_rapbs_akun' => 'boolean',
                'create_rapbs_akun' => 'boolean',
                'update_rapbs_akun' => 'boolean',
                'view_rapbs_kegiatan' => 'boolean',
                'create_rapbs_kegiatan' => 'boolean',
                'update_rapbs_kegiatan' => 'boolean',
                'view_jurnal_umum' => 'boolean',
                'create_jurnal_umum' => 'boolean',
                'update_jurnal_umum' => 'boolean',
                'delete_jurnal_umum' => 'boolean',
                'view_buku_besar' => 'boolean',
                'create_buku_besar' => 'boolean',
                'delete_buku_besar' => 'boolean',
                'view_laporan_komprehensif' => 'boolean',
                'view_laporan_posisi_keuangan' => 'boolean',
                'view_laporan_arus_kas' => 'boolean',
                'view_laporan_perubahan_aset_neto' => 'boolean',
                'view_laporan_catatan_atas_laporan_keuangan' => 'boolean',
                'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => 'boolean',
            ]);

            DB::beginTransaction();

            try {
                if (auth()->check()) {
                    DB::statement('SET @current_user_id = ' . auth()->id());
                }

                // Buat user
                $user = User::create([
                    'nama' => $request->nama,
                    'username' => $request->username,
                    'password' => bcrypt($request->password),
                    'role' => 'akuntan_unit',
                ]);

                // Akuntan_Unit
                $akuntanUnit = Akuntan_Unit::create([
                    'id_akuntan_unit' => $user->id_user,
                    'id_unit' => $request->id_unit,
                    'email' => $request->email,
                    'telp' => $request->telp,
                ]);

                // Hak Akses
                $hakAkses = Hak_Akses::create([
                    'id_akuntan_unit' => $user->id_user,
                    'view_rapbs_akun' => $request->boolean('view_rapbs_akun'),
                    'create_rapbs_akun' => $request->boolean('create_rapbs_akun'),
                    'update_rapbs_akun' => $request->boolean('update_rapbs_akun'),
                    'view_rapbs_kegiatan' => $request->boolean('view_rapbs_kegiatan'),
                    'create_rapbs_kegiatan' => $request->boolean('create_rapbs_kegiatan'),
                    'update_rapbs_kegiatan' => $request->boolean('update_rapbs_kegiatan'),
                    'view_jurnal_umum' => $request->boolean('view_jurnal_umum'),
                    'create_jurnal_umum' => $request->boolean('create_jurnal_umum'),
                    'update_jurnal_umum' => $request->boolean('update_jurnal_umum'),
                    'delete_jurnal_umum' => $request->boolean('delete_jurnal_umum'),
                    'view_buku_besar' => $request->boolean('view_buku_besar'),
                    'create_buku_besar' => $request->boolean('create_buku_besar'),
                    'delete_buku_besar' => $request->boolean('delete_buku_besar'),
                    'view_laporan_komprehensif' => $request->boolean('view_laporan_komprehensif'),
                    'view_laporan_posisi_keuangan' => $request->boolean('view_laporan_posisi_keuangan'),
                    'view_laporan_arus_kas' => $request->boolean('view_laporan_arus_kas'),
                    'view_laporan_perubahan_aset_neto' => $request->boolean('view_laporan_perubahan_aset_neto'),
                    'view_laporan_catatan_atas_laporan_keuangan' => $request->boolean('view_laporan_catatan_atas_laporan_keuangan'),
                    'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => $request->boolean('view_laporan_proyeksi_rencana_dan_realisasi_anggaran'),
                ]);

                DB::commit();

                // Load relasi untuk response
                $akuntanUnit->load(['user', 'unit', 'hakAkses']);

                return response()->json([
                    'success' => true,
                    'message' => 'Akuntan Unit berhasil didaftarkan',
                    'data' => $akuntanUnit
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/akuntan-unit/{id}
     */
    public function show($id)
    {
        try {
            $akuntanUnit = Akuntan_Unit::with(['user', 'unit', 'hakAkses'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data akuntan unit berhasil diambil',
                'data' => $akuntanUnit
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data akuntan unit tidak ditemukan',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     * PUT/PATCH /api/akuntan-unit/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:user,username,' . $id . ',id_user',
                'old_password' => 'required_with:new_password',
                'new_password' => 'nullable|string|min:8|confirmed',
                'id_unit' => 'required|exists:unit,id_unit',
                'email' => 'required|email',
                'telp' => 'required|string',
                // Hak Akses
                'view_rapbs_akun' => 'boolean',
                'create_rapbs_akun' => 'boolean',
                'update_rapbs_akun' => 'boolean',
                'view_rapbs_kegiatan' => 'boolean',
                'create_rapbs_kegiatan' => 'boolean',
                'update_rapbs_kegiatan' => 'boolean',
                'view_jurnal_umum' => 'boolean',
                'create_jurnal_umum' => 'boolean',
                'update_jurnal_umum' => 'boolean',
                'delete_jurnal_umum' => 'boolean',
                'view_buku_besar' => 'boolean',
                'create_buku_besar' => 'boolean',
                'delete_buku_besar' => 'boolean',
                'view_laporan_komprehensif' => 'boolean',
                'view_laporan_posisi_keuangan' => 'boolean',
                'view_laporan_arus_kas' => 'boolean',
                'view_laporan_perubahan_aset_neto' => 'boolean',
                'view_laporan_catatan_atas_laporan_keuangan' => 'boolean',
                'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => 'boolean',
            ]);

            DB::beginTransaction();

            try {
                if (auth()->check()) {
                    DB::statement('SET @current_user_id = ' . auth()->id());
                }

                $user = User::findOrFail($id);
                $akuntanUnit = Akuntan_Unit::where('id_akuntan_unit', $id)->firstOrFail();
                $hakAkses = Hak_Akses::where('id_akuntan_unit', $id)->firstOrFail();

                // Update password jika diisi
                if ($request->filled('new_password')) {
                    if (!Hash::check($request->old_password, $user->password)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Password lama salah',
                            'errors' => [
                                'old_password' => ['Password lama tidak sesuai']
                            ]
                        ], 422);
                    }

                    $user->password = bcrypt($request->new_password);
                }

                // Update user
                $user->nama = $request->nama;
                $user->username = $request->username;
                $user->save();

                // Update akuntan_unit
                $akuntanUnit->update([
                    'id_unit' => $request->id_unit,
                    'email' => $request->email,
                    'telp' => $request->telp,
                ]);

                // Update hak akses
                $hakAkses->update([
                    'view_rapbs_akun' => $request->boolean('view_rapbs_akun'),
                    'create_rapbs_akun' => $request->boolean('create_rapbs_akun'),
                    'update_rapbs_akun' => $request->boolean('update_rapbs_akun'),
                    'view_rapbs_kegiatan' => $request->boolean('view_rapbs_kegiatan'),
                    'create_rapbs_kegiatan' => $request->boolean('create_rapbs_kegiatan'),
                    'update_rapbs_kegiatan' => $request->boolean('update_rapbs_kegiatan'),
                    'view_jurnal_umum' => $request->boolean('view_jurnal_umum'),
                    'create_jurnal_umum' => $request->boolean('create_jurnal_umum'),
                    'update_jurnal_umum' => $request->boolean('update_jurnal_umum'),
                    'delete_jurnal_umum' => $request->boolean('delete_jurnal_umum'),
                    'view_buku_besar' => $request->boolean('view_buku_besar'),
                    'create_buku_besar' => $request->boolean('create_buku_besar'),
                    'delete_buku_besar' => $request->boolean('delete_buku_besar'),
                    'view_laporan_komprehensif' => $request->boolean('view_laporan_komprehensif'),
                    'view_laporan_posisi_keuangan' => $request->boolean('view_laporan_posisi_keuangan'),
                    'view_laporan_arus_kas' => $request->boolean('view_laporan_arus_kas'),
                    'view_laporan_perubahan_aset_neto' => $request->boolean('view_laporan_perubahan_aset_neto'),
                    'view_laporan_catatan_atas_laporan_keuangan' => $request->boolean('view_laporan_catatan_atas_laporan_keuangan'),
                    'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => $request->boolean('view_laporan_proyeksi_rencana_dan_realisasi_anggaran'),
                ]);

                DB::commit();

                // Load relasi untuk response
                $akuntanUnit->load(['user', 'unit', 'hakAkses']);

                return response()->json([
                    'success' => true,
                    'message' => 'Akuntan Unit berhasil diperbarui',
                    'data' => $akuntanUnit
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/akuntan-unit/{id}
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            if (auth()->check()) {
                DB::statement("SET @current_user_id = " . auth()->id());
            }

            // Cek apakah data exists
            $akuntanUnit = Akuntan_Unit::findOrFail($id);

            // Hapus hak akses terlebih dahulu (foreign key constraint)
            Hak_Akses::where('id_akuntan_unit', $id)->delete();

            // Hapus data akuntan unit
            Akuntan_Unit::where('id_akuntan_unit', $id)->delete();

            // Hapus user
            User::where('id_user', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Akuntan Unit berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}