<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Akun;
use Illuminate\Http\Request;

class AkunController extends Controller
{
    // =========================================================
    // GET /api/akun
    // =========================================================
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Akun::with('subKategori')
            ->select(
                'id_akun',
                'kode_akun',
                'akun',
                'saldo_awal_debit',
                'saldo_awal_kredit',
                'id_sub_kategori_akun'
            );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_akun', 'like', "%$search%")
                  ->orWhere('akun', 'like', "%$search%");
            });
        }

        $data = $query->orderBy('kode_akun')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $data
        ]);
    }

    // =========================================================
    // POST /api/akun
    // =========================================================
    public function store(Request $request)
    {
        $request->merge([
            'saldo_awal_debit'  => str_replace('.', '', $request->saldo_awal_debit),
            'saldo_awal_kredit' => str_replace('.', '', $request->saldo_awal_kredit),
        ]);

        $validated = $request->validate([
            'id_sub_kategori_akun' => 'required|exists:sub_kategori_akun,id_sub_kategori_akun',
            'kode_akun'            => 'required|string|max:255|unique:akun,kode_akun',
            'akun'                 => 'required|string|max:255',
            'saldo_awal_debit'     => 'required|numeric',
            'saldo_awal_kredit'    => 'required|numeric',
        ]);

        $akun = Akun::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun berhasil dibuat.',
            'data'    => $akun
        ], 201);
    }

    // =========================================================
    // PUT /api/akun/{id}
    // =========================================================
    public function update(Request $request, $id)
    {
        $request->merge([
            'saldo_awal_debit'  => str_replace('.', '', $request->saldo_awal_debit),
            'saldo_awal_kredit' => str_replace('.', '', $request->saldo_awal_kredit),
        ]);

        $validated = $request->validate([
            'id_sub_kategori_akun' => 'required|exists:sub_kategori_akun,id_sub_kategori_akun',
            'kode_akun'            => 'required|string|max:255|unique:akun,kode_akun,' . $id . ',id_akun',
            'akun'                 => 'required|string|max:255|unique:akun,akun,' . $id . ',id_akun',
            'saldo_awal_debit'     => 'required|numeric',
            'saldo_awal_kredit'    => 'required|numeric',
        ]);

        $akun = Akun::findOrFail($id);
        $akun->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun berhasil diperbarui.',
            'data'    => $akun
        ]);
    }

    // =========================================================
    // DELETE /api/akun/{id}
    // =========================================================
    public function destroy($id)
    {
        $akun = Akun::findOrFail($id);
        $akun->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun berhasil dihapus.'
        ]);
    }
}
