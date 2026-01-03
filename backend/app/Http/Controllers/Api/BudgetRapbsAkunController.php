<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Akun;
use App\Models\Budget_Rapbs_Akun;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;

class BudgetRapbsAkunController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $search  = trim($request->input('search', ''));
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

        $query = Akun::select(
            'akun.id_akun',
            'akun.kode_akun',
            'akun.akun',
            DB::raw('COALESCE(SUM(akun.saldo_awal_debit), 0) AS saldo_awal_debit'),
            DB::raw('COALESCE(SUM(akun.saldo_awal_kredit), 0) AS saldo_awal_kredit'),
            DB::raw('COALESCE(SUM(budget_rapbs_akun.budget_rapbs_akun), 0) AS budget_rapbs')
        )
        ->leftJoin('budget_rapbs_akun', function ($join) use ($id_unit, $isAll) {
            $join->on('akun.id_akun', '=', 'budget_rapbs_akun.id_akun');
            if (!$isAll) {
                $join->where('budget_rapbs_akun.id_unit', '=', $id_unit);
            }
        })
        ->groupBy('akun.id_akun', 'akun.kode_akun', 'akun.akun')
        ->orderBy('akun.kode_akun', 'ASC');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('akun.kode_akun', 'like', "%$search%")
                  ->orWhere('akun.akun', 'like', "%$search%");
            });
        }

        return response()->json($query->get());
    }

    // =========================
    // CREATE / UPDATE BUDGET
    // =========================
    public function storeOrUpdate(Request $request)
    {
        DB::statement('SET @current_user_id = ?', [auth()->id()]);
    
        $validated = $request->validate([
            'id_akun' => 'required|integer',
            'id_unit' => 'required|integer',
            'budget_rapbs_akun' => 'required|numeric',
        ]);
    
        Budget_Rapbs_Akun::updateOrCreate(
            [
                'id_akun' => $validated['id_akun'],
                'id_unit' => $validated['id_unit'],
            ],
            [
                'budget_rapbs_akun' => $validated['budget_rapbs_akun'],
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
                    if ($index === 1) continue;

                    $kode_akun = trim($row['A']);
                    $budget    = (float) str_replace(',', '', $row['C']);
                    $kode_unit = trim($row['D']);

                    $id_akun = DB::table('akun')
                        ->where('kode_akun', $kode_akun)
                        ->value('id_akun');

                    $id_unit = DB::table('unit')
                        ->where('kode_unit', $kode_unit)
                        ->value('id_unit');

                    if (!$id_akun || !$id_unit) continue;

                    Budget_Rapbs_Akun::updateOrCreate(
                        [
                            'id_akun' => $id_akun,
                            'id_unit' => $id_unit,
                        ],
                        [
                            'budget_rapbs_akun' => $budget,
                            'id_user' => auth()->id(), // ✅ WAJIB JUGA
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
