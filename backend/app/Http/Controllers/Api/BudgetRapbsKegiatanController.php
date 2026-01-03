<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Budget_Rapbs_Kegiatan;
use App\Models\Akuntan_Unit;
use PhpOffice\PhpSpreadsheet\IOFactory;

class BudgetRapbsKegiatanController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $id_unit = $request->input('unit', 'all');
            $isAll = ($id_unit === 'all' || $id_unit === null);
            
            // If akuntan_unit, force filter to their own unit
            if ($user && $user->role === 'akuntan_unit') {
                $akuntan = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->first();
                if ($akuntan) {
                    $id_unit = $akuntan->id_unit;
                    $isAll = false;
                }
            }
            
            $query = DB::table('kegiatan as k')
                ->leftJoin('budget_rapbs_kegiatan as b', function ($join) use ($id_unit, $isAll) {
                    $join->on('k.id_kegiatan', '=', 'b.id_kegiatan');
                    if (!$isAll) {
                        $join->where('b.id_unit', '=', $id_unit);
                    }
                })
                ->select(
                    DB::raw('COALESCE(MAX(b.id_budget_rapbs_kegiatan), 0) as id_budget_rapbs_kegiatan'),
                    'k.id_kegiatan',
                    'k.kode_kegiatan',
                    'k.kegiatan',
                    DB::raw('COALESCE(MAX(b.id_unit), 0) as id_unit'),
                    DB::raw('SUM(COALESCE(b.budget_rapbs_kegiatan, 0)) as budget_rapbs_kegiatan')
                )
                ->groupBy('k.id_kegiatan', 'k.kode_kegiatan', 'k.kegiatan')
                ->orderBy('k.kode_kegiatan', 'asc');
            
            $data = $query->get();

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
        DB::statement('SET @current_user_id = ?', [auth()->id()]);

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

    // =========================
    // IMPORT EXCEL
    // =========================
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

        try {
            DB::statement('SET @current_user_id = ?', [auth()->id()]);
            
            DB::transaction(function () use ($rows) {
                foreach ($rows as $index => $row) {
                    if ($index === 1) continue; // Skip header

                    $kode_kegiatan = trim($row['A'] ?? '');
                    $budget = (float) str_replace(',', '', $row['C'] ?? 0);
                    $kode_unit = trim($row['D'] ?? '');

                    if (empty($kode_kegiatan) || empty($kode_unit)) continue;

                    $id_kegiatan = DB::table('kegiatan')
                        ->where('kode_kegiatan', $kode_kegiatan)
                        ->value('id_kegiatan');

                    $id_unit = DB::table('unit')
                        ->where('kode_unit', $kode_unit)
                        ->value('id_unit');

                    if (!$id_kegiatan || !$id_unit) continue;

                    Budget_Rapbs_Kegiatan::updateOrCreate(
                        [
                            'id_kegiatan' => $id_kegiatan,
                            'id_unit' => $id_unit,
                        ],
                        [
                            'budget_rapbs_kegiatan' => $budget,
                        ]
                    );
                }
            });

            return response()->json(['success' => true, 'message' => 'Import berhasil']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}