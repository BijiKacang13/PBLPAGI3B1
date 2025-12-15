<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class BudgetRapbsKegiatanController extends Controller
{
    public function index()
    {
        try {
            $data = DB::table('kegiatan as k')
                ->leftJoin('budget_rapbs_kegiatan as b', function ($join) {
                    $join->on('k.id_kegiatan', '=', 'b.id_kegiatan');
                    // ⬆️ jangan filter unit dulu, karena halaman awal = akumulasi
                })
                ->select(
                    // jika belum ada budget → 0
                    DB::raw('COALESCE(b.id_budget_rapbs_kegiatan, 0) as id_budget_rapbs_kegiatan'),
                    'k.id_kegiatan',
                    'k.kode_kegiatan',
                    'k.kegiatan',
                    DB::raw('COALESCE(b.id_unit, 0) as id_unit'),
                    DB::raw('COALESCE(b.budget_rapbs_kegiatan, 0) as budget_rapbs_kegiatan')
                )
                ->orderBy('k.kode_kegiatan', 'asc')
                ->get();

            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal mengambil data RAPBS',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    
    // =========================
    // UPDATE BUDGET
    // =========================
    public function update(Request $request, $id)
    {
        // =========================
        // VALIDASI INPUT
        // =========================
        $validated = $request->validate([
            'budget_rapbs_kegiatan' => 'required|numeric|min:0',
        ]);

        // =========================
        // CEK DATA ADA / TIDAK
        // =========================
        $exists = DB::table('budget_rapbs_kegiatan')
            ->where('id_budget_rapbs_kegiatan', $id)
            ->exists();

        if (! $exists) {
            return response()->json([
                'message' => 'Data RAPBS kegiatan tidak ditemukan'
            ], 404);
        }

        // =========================
        // UPDATE DATA
        // =========================
        DB::table('budget_rapbs_kegiatan')
            ->where('id_budget_rapbs_kegiatan', $id)
            ->update([
                'budget_rapbs_kegiatan' => $validated['budget_rapbs_kegiatan'],
                'updated_at' => now(),
            ]);

        // =========================
        // RESPONSE
        // =========================
        return response()->json([
            'message' => 'Budget RAPBS kegiatan berhasil diperbarui',
        ]);
    }
}

