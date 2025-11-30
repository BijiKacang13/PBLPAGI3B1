<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KegiatanController extends Controller
{
    public function index()
    {
        return response()->json(
            Kegiatan::orderBy('kode_kegiatan')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_kegiatan' => 'required|string|max:255|unique:kegiatan,kode_kegiatan',
            'kegiatan' => 'required|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $kegiatan = Kegiatan::create([
                'kode_kegiatan' => $request->kode_kegiatan,
                'kegiatan' => $request->kegiatan,
            ]);

            DB::commit();
            return response()->json($kegiatan, 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Gagal menambah kegiatan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        return response()->json($kegiatan);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_kegiatan' => 'required|string|max:255',
            'kegiatan' => 'required|string|max:255'
        ]);

        DB::beginTransaction();

        try {
            $kegiatan = Kegiatan::findOrFail($id);

            $kegiatan->update([
                'kode_kegiatan' => $request->kode_kegiatan,
                'kegiatan' => $request->kegiatan,
            ]);

            DB::commit();
            return response()->json($kegiatan);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Gagal memperbarui kegiatan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $kegiatan = Kegiatan::findOrFail($id);
            $kegiatan->delete();

            DB::commit();
            return response()->json(['message' => 'kegiatan berhasil dihapus']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Gagal menghapus kegiatan: ' . $e->getMessage()
            ], 500);
        }
    }
}
