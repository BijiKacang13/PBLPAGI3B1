<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Unit;
use App\Models\Jurnal_Umum;
use Illuminate\Http\Request;

class DashboardAuditorController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $id_unit = $request->input('unit', 'all'); 
        $units = Unit::all(); 

        $labels = [];
        $data = [];

        for ($i = 29; $i >= 0; $i--) {
            $tanggal = Carbon::today()->subDays($i)->format('Y-m-d');
            $labels[] = Carbon::parse($tanggal)->format('d M');

            $query = Jurnal_Umum::whereDate('tanggal', $tanggal);

            // Filter unit kalau bukan 'all'
            if ($id_unit !== 'all') {
                $query->where('id_unit', $id_unit);
            }

            $data[] = $query->count();
        }

        return view('index_auditor', compact('user', 'labels', 'data', 'units', 'id_unit'));
    }
}
