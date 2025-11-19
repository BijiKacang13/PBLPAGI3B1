<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kategori_Akun;

class KategoriAkunController extends Controller
{
    // GET /api/kategori-akun
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

    // POST /api/kategori-akun
    public function store(Request $request)
    {
        $request->validate([
            'kode_kategori_akun' => 'required',
            'kategori_akun' => 'required',
        ]);

        $kategori = Kategori_Akun::create([
            'kode_kategori_akun' => $request->kode_kategori_akun,
            'kategori_akun' => $request->kategori_akun,
        ]);

        return response()->json([
            'message' => 'Kategori akun berhasil ditambahkan',
            'data' => $kategori
        ], 201);
    }

    // PUT /api/kategori-akun/{id}
    public function update(Request $request, $id)
    {
        $kategori = Kategori_Akun::find($id);

        if (!$kategori) {
            return response()->json(['message' => 'Kategori akun tidak ditemukan'], 404);
        }

        $kategori->update([
            'kode_kategori_akun' => $request->kode_kategori_akun,
            'kategori_akun' => $request->kategori_akun,
        ]);

        return response()->json([
            'message' => 'Kategori akun berhasil diupdate',
            'data' => $kategori
        ]);
    }

    // DELETE /api/kategori-akun/{id}
    public function destroy($id)
    {
        $kategori = Kategori_Akun::find($id);

        if (!$kategori) {
            return response()->json(['message' => 'Kategori akun tidak ditemukan'], 404);
        }

        $kategori->delete();

        return response()->json([
            'message' => 'Kategori akun berhasil dihapus'
        ]);
    }
}
