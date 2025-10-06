<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\Kegiatan;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Budget_Rapbs_Kegiatan;
use PhpOffice\PhpSpreadsheet\IOFactory;

class BudgetRapbsKegiatanController extends Controller
{
    
    public function index(Request $request)
    {
        $user = Auth::user();

        // Penentuan unit dan daftar unit berdasarkan role
        if (in_array($user->role, ['admin', 'auditor'])) {
            $id_unit = $request->get('unit', 'all');
            $units = Unit::all();
        } elseif ($user->role === 'akuntan_unit') {
            $akuntanUnit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->firstOrFail();
            $id_unit = $akuntanUnit->id_unit;
            $units = collect(); // kosongkan agar tidak render <select>
        } else {
            abort(403, 'Role tidak dikenal');
        }

        $search = $request->get('search');
        $perPage = $request->get('per_page', 20);

        // Query dasar
        $query = Kegiatan::select(
                'kegiatan.id_kegiatan',
                'kegiatan.kode_kegiatan',
                'kegiatan.kegiatan',
                $id_unit === 'all'
                    ? DB::raw('SUM(budget_rapbs_kegiatan.budget_rapbs_kegiatan) as budget_rapbs')
                    : DB::raw('COALESCE(budget_rapbs_kegiatan.budget_rapbs_kegiatan, 0) as budget_rapbs')
            )
            ->leftJoin('budget_rapbs_kegiatan', function ($join) use ($id_unit) {
                $join->on('kegiatan.id_kegiatan', '=', 'budget_rapbs_kegiatan.id_kegiatan');
                if ($id_unit !== 'all') {
                    $join->where('budget_rapbs_kegiatan.id_unit', $id_unit);
                }
            })
            ->orderBy('kegiatan.kode_kegiatan');

        if ($id_unit === 'all') {
            $query->groupBy('kegiatan.id_kegiatan', 'kegiatan.kode_kegiatan', 'kegiatan.kegiatan');
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kegiatan.kode_kegiatan', 'like', "%{$search}%")
                ->orWhere('kegiatan.kegiatan', 'like', "%{$search}%");
            });
        }

        $kegiatan = $perPage === 'all'
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        return view('budget-rapbs-kegiatan', compact('kegiatan', 'units', 'id_unit', 'user'));
    }




    public function storeOrUpdate(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

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
                'budget_rapbs_kegiatan' => $validated['budget_rapbs_kegiatan']
            ]
        );

        return back()->with('success', 'Budget RAPBS kegiatan berhasil disimpan.');
    }


    
    public function importExcel(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        $user = Auth::user();

        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);
        $kegiatanMap = Kegiatan::pluck('id_kegiatan', 'kode_kegiatan');
        $unitMap = in_array($user->role, ['admin']) ? Unit::pluck('id_unit', 'kode_unit') : null;
        try {
            DB::transaction(function () use ($rows, $kegiatanMap, $unitMap, $user) {
                $id_unit = null;

                if ($user->role === 'akuntan_unit') {
                    $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
                }

                foreach ($rows as $index => $row) {
                    if ($index === 1) continue;
                    $kode_kegiatan = trim($row['A']);
                    // $budget = (int) $row['C'];
                    $budget = (float) str_replace(',', '', $row['C']);

                    $id_kegiatan = $kegiatanMap[$kode_kegiatan] ?? null;
                    if ($user->role === 'admin') {
                        $kode_unit = trim($row['D']);
                        $id_unit = $unitMap[$kode_unit] ?? null;
                    }
                    if (!$id_kegiatan || !$id_unit) continue;

                    Budget_Rapbs_Kegiatan::updateOrCreate(
                        [
                            'id_kegiatan' => $id_kegiatan,
                            'id_unit' => $id_unit,
                        ],
                        [
                            'budget_rapbs_kegiatan' => $budget
                        ]
                    );
                }
            });

            return back()->with('success', 'Import Excel RAPBS kegiatan berhasil!');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import: ' . $e->getMessage());
        }
    }



}
