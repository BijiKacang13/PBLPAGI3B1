<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\Unit;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use App\Models\Budget_Rapbs_Akun;
use App\Models\Sub_Kategori_Akun;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;

class BudgetRapbsAkunController extends Controller
{
    
    public function index(Request $request)
    {
        $user = Auth::user();

        // Ambil filter dari request
        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');

        // Tentukan unit & role user
        if (in_array($user->role, ['admin', 'auditor'])) {
            $id_unit = $request->get('unit', 'all');
            $units = Unit::all();
            $nama_unit = $id_unit !== 'all' ? Unit::where('id_unit', $id_unit)->value('unit') : null;
        } elseif ($user->role === 'akuntan_unit') {
            $akuntanUnit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->firstOrFail();
            $id_unit = $akuntanUnit->id_unit;
            $units = collect(); // kosong
            $nama_unit = Unit::where('id_unit', $id_unit)->value('unit');
        } else {
            abort(403, 'Role tidak dikenal');
        }

        // Query awal
        $query = Akun::select(
            'akun.id_akun',
            'akun.kode_akun',
            'akun.akun',
            ($id_unit === 'all' 
                ? DB::raw('SUM(akun.saldo_awal_debit) as saldo_awal_debit') 
                : 'akun.saldo_awal_debit'),
            ($id_unit === 'all' 
                ? DB::raw('SUM(akun.saldo_awal_kredit) as saldo_awal_kredit') 
                : 'akun.saldo_awal_kredit'),
            DB::raw(($id_unit === 'all' 
                ? 'SUM(budget_rapbs_akun.budget_rapbs_akun)' 
                : 'COALESCE(budget_rapbs_akun.budget_rapbs_akun, 0)'
            ) . ' as budget_rapbs')
        )
        ->leftJoin('budget_rapbs_akun', function ($join) use ($id_unit) {
            $join->on('akun.id_akun', '=', 'budget_rapbs_akun.id_akun');
            if ($id_unit !== 'all') {
                $join->where('budget_rapbs_akun.id_unit', '=', $id_unit);
            }
        })
        ->orderBy('akun.kode_akun');

        // Group by jika semua unit
        if ($id_unit === 'all') {
            $query->groupBy('akun.id_akun', 'akun.kode_akun', 'akun.akun');
        }

        // Filter search jika ada
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('akun.kode_akun', 'like', "%{$search}%")
                ->orWhere('akun.akun', 'like', "%{$search}%");
            });
        }

        // Ambil data
        $akun = ($perPage === 'all')
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        return view('budget-rapbs-akun', compact(
            'akun', 'units', 'id_unit', 'user', 'nama_unit'
        ));
    }




    public function storeOrUpdate(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        $validated = $request->validate([
            'id_akun' => 'required|integer',
            'id_unit' => 'required|integer',
            'budget_rapbs_akun' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated) {
            Budget_Rapbs_Akun::updateOrCreate(
                [
                    'id_akun' => $validated['id_akun'],
                    'id_unit' => $validated['id_unit']
                ],
                [
                    'budget_rapbs_akun' => $validated['budget_rapbs_akun']
                ]
            );
            return back()->with('success', 'Data berhasil disimpan.');
        });
    }



    public function importExcel(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

        $user = Auth::user();
        $akunMap = Akun::pluck('id_akun', 'kode_akun');

        // Jika admin/auditor, butuh unitMap
        $unitMap = $user->role == 'admin' ? Unit::pluck('id_unit', 'kode_unit') : null;

        try {
            DB::transaction(function () use ($rows, $akunMap, $unitMap, $user) {
                $id_unit = null;
                if ($user->role === 'akuntan_unit') {
                    $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
                }

                foreach ($rows as $index => $row) {
                    if ($index === 1) continue;

                    $kode_akun = trim($row['A']);
                    // $budget = (int) $row['C'];
                    $budget = (float) str_replace(',', '', $row['C']);
                    
                    $id_akun = $akunMap[$kode_akun] ?? null;

                    if ($user->role === 'akuntan_unit') {
                        // Unit dari login
                        if (!$id_akun || !$id_unit) continue;
                    } else {
                        // Unit dari Excel
                        $kode_unit = trim($row['D']);
                        $id_unit = $unitMap[$kode_unit] ?? null;
                        if (!$id_akun || !$id_unit) continue;
                    }

                    Budget_Rapbs_Akun::updateOrCreate(
                        [
                            'id_akun' => $id_akun,
                            'id_unit' => $id_unit,
                        ],
                        [
                            'budget_rapbs_akun' => $budget
                        ]
                    );
                }
            });

            return back()->with('success', 'Import Excel berhasil!');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import: ' . $e->getMessage());
        }
    }



}
