<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Budget_Rapbs_Kegiatan;

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
    // CREATE/UPDATE BUDGET
    // =========================
    public function storeOrUpdate(Request $request)
    {
        $validated = $request->validate([
            'id_kegiatan' => 'required|integer',
            'id_unit' => 'required|integer',
            'budget_rapbs_kegiatan' => 'required|numeric',
        ]);

        Budget_Rapbs_Kegiatan::updateOrCreate(
            [
                'id_kegiatan' => $validated['id_kegiatan'],
                'id_unit' => $validated['id_unit'],
            ],
            [
                'budget_rapbs_kegiatan' => $validated['budget_rapbs_kegiatan'],
            ]
        );

        return response()->json(['message' => 'Berhasil disimpan']);
    }
}