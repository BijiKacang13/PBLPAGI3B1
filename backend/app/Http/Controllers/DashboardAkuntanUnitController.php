<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Akuntan_Unit;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Jurnal_Umum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardAkuntanUnitController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $labels = [];
        $data = [];

        // Jika akuntan_unit, ambil id_unit dari tabel akuntan_unit
        $id_unit = null;
        if ($user->role === 'akuntan_unit') {
            $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
        }

        for ($i = 29; $i >= 0; $i--) {
            $tanggal = Carbon::today()->subDays($i)->format('Y-m-d');
            $labels[] = Carbon::parse($tanggal)->format('d M');

            $query = Jurnal_Umum::whereDate('tanggal', $tanggal);

            if ($user->role === 'akuntan_unit' && $id_unit) {
                $query->where('id_unit', $id_unit);
            }

            $data[] = $query->count();
        }

        return view('index', compact('user', 'labels', 'data'));
    }

}
