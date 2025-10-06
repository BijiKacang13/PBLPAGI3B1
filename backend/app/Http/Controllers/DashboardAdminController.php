<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Jurnal_Umum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardAdminController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $id_unit = $request->input('unit', 'all'); // default 'all'
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

        return view('admin.index', compact('user', 'labels', 'data', 'units', 'id_unit'));
    }


    // public function index2()
    // {
    //     $user = auth()->user();

    //     $labels = [];
    //     $data = [];

    //     for ($i = 29; $i >= 0; $i--) {
    //         $tanggal = Carbon::today()->subDays($i)->format('Y-m-d');
    //         $labels[] = Carbon::parse($tanggal)->format('d M');

    //         $jumlah = Jurnal_Umum::whereDate('tanggal', $tanggal)->count();
    //         $data[] = $jumlah;
    //     }

    //     return view('admin.index', compact('user', 'labels', 'data'));
    // }
}
