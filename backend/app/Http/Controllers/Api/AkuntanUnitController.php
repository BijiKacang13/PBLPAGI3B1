<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\User;
use App\Models\Hak_Akses;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AkuntanUnitController extends Controller
{
    /**
     * GET /api/akuntan-unit
     * List akuntan unit + filter
     */
    public function index(Request $request)
    {
        try {
            $query = Akuntan_Unit::with(['user', 'unit']);

            if ($request->filled('search')) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('nama', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->filled('unit')) {
                $query->where('id_unit', $request->unit);
            }

            $data = $query->get()->sortBy('user.nama')->values();

            return response()->json([
                'success' => true,
                'message' => 'Data akuntan unit berhasil diambil',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/akuntan-unit/{id}
     * Detail akuntan unit
     */
    public function show($id)
    {
        try {
            $data = Akuntan_Unit::with(['user', 'unit', 'hakAkses'])
                ->where('id_akuntan_unit', $id)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'message' => 'Detail akuntan unit berhasil diambil',
                'data' => $data
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Data akuntan unit tidak ditemukan'
            ], 404);
        }
    }

    /**
     * POST /api/akuntan-unit
     * Create akuntan unit
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:user,username',
                'password' => 'required|string|min:8|confirmed',
                'id_unit' => 'required|exists:unit,id_unit',
                'email' => 'required|email|unique:akuntan_unit,email',
                'telp' => 'required|string|unique:akuntan_unit,telp',
            ]);

            DB::beginTransaction();

            // 1️⃣ Buat user (ROLE DIKUNCI DI BACKEND)
            $user = User::create([
                'nama' => $request->nama,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => 'akuntan_unit',
            ]);

            // 2️⃣ Buat akuntan unit
            $akuntanUnit = Akuntan_Unit::create([
                'id_akuntan_unit' => $user->id_user,
                'id_unit' => $request->id_unit,
                'email' => $request->email,
                'telp' => $request->telp,
            ]);

            // 3️⃣ Hak akses (boolean semua, default false)
            Hak_Akses::create(
                array_merge(
                    ['id_akuntan_unit' => $user->id_user],
                    $this->hakAksesPayload($request)
                )
            );

            DB::commit();

            $akuntanUnit->load(['user', 'unit', 'hakAkses']);

            return response()->json([
                'success' => true,
                'message' => 'Akuntan Unit berhasil didaftarkan',
                'data' => $akuntanUnit
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/akuntan-unit/{id}
     * Update akuntan unit
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:user,username,' . $id . ',id_user',
                'new_password' => 'nullable|string|min:8|confirmed',
                'old_password' => 'required_with:new_password',
                'id_unit' => 'required|exists:unit,id_unit',
                'email' => 'required|email|unique:akuntan_unit,email,' . $id . ',id_akuntan_unit',
                'telp' => 'required|string|unique:akuntan_unit,telp,' . $id . ',id_akuntan_unit',
            ]);

            DB::beginTransaction();

            $user = User::findOrFail($id);
            $akuntanUnit = Akuntan_Unit::where('id_akuntan_unit', $id)->firstOrFail();
            $hakAkses = Hak_Akses::where('id_akuntan_unit', $id)->firstOrFail();

            if ($request->filled('new_password')) {
                if (!Hash::check($request->old_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password lama tidak sesuai'
                    ], 422);
                }
                $user->password = Hash::make($request->new_password);
            }

            $user->update([
                'nama' => $request->nama,
                'username' => $request->username,
            ]);

            $akuntanUnit->update([
                'id_unit' => $request->id_unit,
                'email' => $request->email,
                'telp' => $request->telp,
            ]);

            $hakAkses->update($this->hakAksesPayload($request));

            DB::commit();

            $akuntanUnit->load(['user', 'unit', 'hakAkses']);

            return response()->json([
                'success' => true,
                'message' => 'Akuntan Unit berhasil diperbarui',
                'data' => $akuntanUnit
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/akuntan-unit/{id}
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            Hak_Akses::where('id_akuntan_unit', $id)->delete();
            Akuntan_Unit::where('id_akuntan_unit', $id)->delete();
            User::where('id_user', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Akuntan Unit berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus akuntan unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper: normalize hak akses payload
     */
    private function hakAksesPayload(Request $request): array
    {
        return [
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
        ];
    }
}
