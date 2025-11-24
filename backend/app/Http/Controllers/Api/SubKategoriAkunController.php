<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sub_Kategori_Akun;
use Illuminate\Support\Facades\DB;
use Exception;

class SubKategoriAkunController extends Controller
{
    // ===============================
    // GET ALL
    // ===============================
    public function index()
    {
        $data = Sub_Kategori_Akun::orderBy('kode_sub_kategori_akun', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    // ===============================
    // STORE / CREATE
    // ===============================
    public function store(Request $request)
    {
        // Paksa user untuk debug (ID 1)
        $userId = auth()->id() ?? 1;
        DB::statement("SET @current_user_id = ?", [$userId]);

        $request->validate([
            'id_kategori_akun' => 'required|integer|exists:kategori_akun,id_kategori_akun',
            'kode_sub_kategori_akun' => 'required|string|max:255|unique:sub_kategori_akun,kode_sub_kategori_akun',
            'sub_kategori_akun' => 'required|string|max:255'
        ]);

        DB::beginTransaction();

        try {
            $data = Sub_Kategori_Akun::create([
                'id_kategori_akun' => $request->id_kategori_akun,
                'kode_sub_kategori_akun' => $request->kode_sub_kategori_akun,
                'sub_kategori_akun' => $request->sub_kategori_akun,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Sub kategori akun berhasil didaftarkan.',
                'data' => $data
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambah sub kategori akun.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ===============================
    // UPDATE
    // ===============================
    public function update(Request $request, $id)
    {
        $userId = auth()->id() ?? 1;
        DB::statement("SET @current_user_id = ?", [$userId]);

        $request->validate([
            'kode_sub_kategori_akun' =>
                'required|string|max:255|unique:sub_kategori_akun,kode_sub_kategori_akun,' . $id . ',id_sub_kategori_akun',
            'sub_kategori_akun' =>
                'required|string|max:255|unique:sub_kategori_akun,sub_kategori_akun,' . $id . ',id_sub_kategori_akun',
            'id_kategori_akun' =>
                'required|integer|exists:kategori_akun,id_kategori_akun',
        ]);

        DB::beginTransaction();

        try {
            $sub = Sub_Kategori_Akun::findOrFail($id);

            $sub->update([
                'kode_sub_kategori_akun' => $request->kode_sub_kategori_akun,
                'sub_kategori_akun' => $request->sub_kategori_akun,
                'id_kategori_akun' => $request->id_kategori_akun
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Sub kategori akun berhasil diperbarui.',
                'data' => $sub
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui sub kategori akun.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ===============================
    // DELETE
    // ===============================
    public function destroy($id)
    {
        $userId = auth()->id() ?? 1;
        DB::statement("SET @current_user_id = ?", [$userId]);

        DB::beginTransaction();

        try {
            $sub = Sub_Kategori_Akun::findOrFail($id);
            $sub->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Sub kategori akun berhasil dihapus.'
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus sub kategori akun.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
