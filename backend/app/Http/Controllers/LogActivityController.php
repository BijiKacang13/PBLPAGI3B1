<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Log_Activity;
use Illuminate\Http\Request;

class LogActivityController extends Controller
{
    
    public function index(Request $request)
    {
        $query = Log_Activity::query();

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->whereHas('user', function ($query) use ($request) {
                    $query->where('username', 'like', '%' . $request->search . '%');
                })
                ->orWhere('keterangan', 'like', '%' . $request->search . '%') // Mencari di kolom keterangan
                ->orWhereDate('created_at', 'like', '%' . $request->search . '%'); // Mencari di kolom created_at
            });
        }
        
        // Filter berdasarkan tanggal jika ada
        if ($request->filled('start_date') || $request->filled('end_date') || $request->filled('start_time') || $request->filled('end_time')) {
            $startDate = $request->start_date ?? Carbon::now()->startOfMonth()->toDateString();
            $endDate = $request->end_date ?? Carbon::now()->endOfMonth()->toDateString();
        } else {
            // default filter saat tidak ada input sama sekali
            $startDate = Carbon::now()->startOfMonth()->toDateString();
            $endDate = Carbon::now()->endOfMonth()->toDateString();
        }

        $startTime = $request->start_time ? $request->start_time . ':00' : '00:00:00';
        $endTime = $request->end_time ? $request->end_time . ':00' : '23:59:59';

        $startDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $startDate . ' ' . $startTime);
        $endDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $endDate . ' ' . $endTime);

        if ($startDateTime > $endDateTime) {
            [$startDateTime, $endDateTime] = [$endDateTime, $startDateTime];
        }

        $query->whereBetween('created_at', [$startDateTime, $endDateTime]);




        // Ambil log aktivitas yang sudah difilter
        // $log_aktivitas = $query->get();
        $log_aktivitas = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        return view('admin.log-aktivitas', compact('log_aktivitas'));
    }


}
