<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Log_Activity;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LogActivityController extends Controller
{
    public function index(Request $request)
    {
        // ===========================
        // BASE QUERY
        // ===========================
        $query = Log_Activity::query()
            ->with('user:id_user,username');

        // ===========================
        // SEARCH
        // ===========================
        if ($request->filled('search')) {
            $q = $request->search;

            $query->where(function ($x) use ($q) {
                $x->whereHas('user', function ($u) use ($q) {
                    $u->where('username', 'like', "%$q%");
                })
                ->orWhere('keterangan', 'like', "%$q%")
                ->orWhere('created_at', 'like', "%$q%");
            });
        }

        // ===========================
        // DATE RANGE (Optional - hanya filter jika ada parameter)
        // ===========================
        if ($request->filled('start_date') || $request->filled('end_date')) {
            $startDate = $request->start_date ?? Carbon::now()->startOfMonth()->toDateString();
            $endDate = $request->end_date ?? Carbon::now()->endOfMonth()->toDateString();

            $startTime = $request->start_time ? $request->start_time . ':00' : '00:00:00';
            $endTime   = $request->end_time ? $request->end_time . ':00'   : '23:59:59';

            $startDateTime = Carbon::createFromFormat('Y-m-d H:i:s', "$startDate $startTime");
            $endDateTime   = Carbon::createFromFormat('Y-m-d H:i:s', "$endDate $endTime");

            // Tukar jika start > end
            if ($startDateTime > $endDateTime) {
                [$startDateTime, $endDateTime] = [$endDateTime, $startDateTime];
            }

            $query->whereBetween('created_at', [$startDateTime, $endDateTime]);
        }

        // ===========================
        // PAGINATION
        // ===========================
        $limit = (int) ($request->limit ?? 20);

        $log = $query
            ->orderBy('created_at', 'desc')
            ->paginate($limit);

        // ===========================
        // RETURN JSON
        // ===========================
        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }
}
