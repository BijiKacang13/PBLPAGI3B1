<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kategori_Akun;
use Illuminate\Support\Facades\DB;

class KategoriAkunController extends Controller
{
    public function index()
    {
        return response()->json(
            Kategori_Akun::select(
                'id_kategori_akun',
                'kode_kategori_akun',
                'kategori_akun'
            )->get()
        );
    }

    public function store(Request $request)
    {
        DB::statement('SET @current_user_id = ?', [auth()->id()]);

        $request->validate([
            'kode_kategori_akun' => 'required|string|max:255|unique:kategori_akun,kode_kategori_akun',
            'kategori_akun' => 'required|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $kategori = Kategori_Akun::create([
                'kode_kategori_akun' => $request->kode_kategori_akun,
                'kategori_akun' => $request->kategori_akun,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Kategori akun berhasil ditambahkan',
                'data' => $kategori
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal menambah kategori akun',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        DB::statement('SET @current_user_id = ?', [auth()->id()]);

        $request->validate([
            'kode_kategori_akun' => 'required|string|max:255|unique:kategori_akun,kode_kategori_akun,' . $id . ',id_kategori_akun',
            'kategori_akun' => 'required|string|max:255|unique:kategori_akun,kategori_akun,' . $id . ',id_kategori_akun',
        ]);

        DB::beginTransaction();

        try {
            $kategori = Kategori_Akun::findOrFail($id);
            $kategori->update([
                'kode_kategori_akun' => $request->kode_kategori_akun,
                'kategori_akun' => $request->kategori_akun,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Kategori akun berhasil diupdate',
                'data' => $kategori
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal update kategori akun',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        DB::statement('SET @current_user_id = ?', [auth()->id()]);

        DB::beginTransaction();

        try {
            $kategori = Kategori_Akun::findOrFail($id);
            $kategori->delete();

            DB::commit();

            return response()->json([
                'message' => 'Kategori akun berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal menghapus kategori akun',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
