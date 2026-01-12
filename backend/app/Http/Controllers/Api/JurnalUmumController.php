<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Kegiatan;
use App\Models\Buku_Besar;
use App\Models\Jurnal_Umum;
use App\Models\Akuntan_Unit;
use App\Models\Akuntan_Divisi;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class JurnalUmumController extends Controller
{
    /**
     * GET /api/jurnal-umum
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // ==========================
        // 1. Decode filter dari Next.js
        // ==========================
        $unitFilter   = $request->unit;
        $divisiFilter = $request->divisi;

        // Jika frontend mengirim "Akumulasi (Semua Unit)" → anggap null
        if ($unitFilter === "Akumulasi (Semua Unit)" || $unitFilter === "" || $unitFilter === null) {
            $unitFilter = null;
        }

        if ($divisiFilter === "Akumulasi (Semua Divisi)" || $divisiFilter === "" || $divisiFilter === null) {
            $divisiFilter = null;
        }

        // ==========================
        // 2. Override berdasarkan role user (akuntan_unit / akuntan_divisi)
        // ==========================
        if ($user->role === 'akuntan_unit') {
            $akunUnit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->first();
            if (!$akunUnit) {
                return response()->json(['error' => 'Akun unit tidak ditemukan'], 403);
            }
            $unitFilter = $akunUnit->id_unit;
        }

        if ($user->role === 'akuntan_divisi') {
            $divisiFilter = $user->id_divisi;
        }

        // ==========================
        // 3. Base Query
        // ==========================
        $query = Jurnal_Umum::with(['unit', 'divisi', 'kegiatan', 'sumber_anggaran', 'buku_besar', 'detail_jurnal_umum.akun'])
            ->orderByDesc('id_jurnal_umum');

        // ==========================
        // 4. Filter Tanggal (from–to)
        // ==========================
        $from = $request->from ?: date('Y-01-01');
        $to   = $request->to   ?: date('Y-12-31');

        $query->whereBetween('tanggal', [$from, $to]);

        // ==========================
        // 5. Filter Search
        // ==========================
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_bukti', 'LIKE', "%$search%")
                ->orWhere('keterangan', 'LIKE', "%$search%");
            });
        }

        // ==========================
        // 6. Filter Unit & Divisi
        // ==========================
        if ($unitFilter)   $query->where('id_unit', $unitFilter);
        if ($divisiFilter) $query->where('id_divisi', $divisiFilter);

        // ==========================
        // 7. Count unposted journals
        // ==========================
        $hasUnposted = (clone $query)->whereDoesntHave('buku_besar')->exists();

        // ==========================
        // 8. Pagination
        // ==========================
        $perPage = $request->per_page ?? 10;
        $result = $query->paginate($perPage);

        // Add is_posted flag and calculate totals for each item
        $result->getCollection()->transform(function ($item) {
            $item->is_posted = $item->buku_besar !== null;
            
            // Calculate total debit and kredit from detail_jurnal_umum
            $item->total_debit = $item->detail_jurnal_umum
                ->where('debit_kredit', 'debit')
                ->sum('nominal');
            $item->total_kredit = $item->detail_jurnal_umum
                ->where('debit_kredit', 'kredit')
                ->sum('nominal');
            
            return $item;
        });

        // ==========================
        // 9. Return
        // ==========================
        return response()->json([
            'success' => true,
            'has_unposted' => $hasUnposted,
            'data' => $result
        ]);
    }

    /**
     * GET /api/jurnal-umum/export
     * Khusus Export Excel & Print
     */
    public function export(Request $request)
    {
        $user = Auth::user();

        // ==========================
        // 1. Decode filter
        // ==========================
        $unitFilter   = $request->unit;
        $divisiFilter = $request->divisi;

        if ($unitFilter === "Akumulasi (Semua Unit)" || !$unitFilter) {
            $unitFilter = null;
        }

        if ($divisiFilter === "Akumulasi (Semua Divisi)" || !$divisiFilter) {
            $divisiFilter = null;
        }

        // ==========================
        // 2. Role override
        // ==========================
        if ($user->role === 'akuntan_unit') {
            $akunUnit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->first();
            $unitFilter = $akunUnit?->id_unit;
        }

        if ($user->role === 'akuntan_divisi') {
            $divisiFilter = $user->id_divisi;
        }

        // ==========================
        // 3. Query tanpa paginate
        // ==========================
        $query = Jurnal_Umum::with(['unit', 'divisi', 'kegiatan', 'sumber_anggaran', 'detail_jurnal_umum.akun'])
            ->orderBy('tanggal')
            ->orderBy('no_bukti');

        // Tanggal
        $from = $request->from ?: date('Y-01-01');
        $to   = $request->to   ?: date('Y-12-31');
        $query->whereBetween('tanggal', [$from, $to]);

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('no_bukti', 'LIKE', "%{$request->search}%")
                ->orWhere('keterangan', 'LIKE', "%{$request->search}%");
            });
        }

        // Unit & Divisi
        if ($unitFilter)   $query->where('id_unit', $unitFilter);
        if ($divisiFilter) $query->where('id_divisi', $divisiFilter);

        $data = $query->get();

        // ==========================
        // 4. Response KHUSUS
        // ==========================
        return response()->json([
            'success' => true,
            'meta' => [
                'from' => $from,
                'to' => $to,
                'unit' => $unitFilter,
                'divisi' => $divisiFilter,
                'total' => $data->count()
            ],
            'data' => $data
        ]);
    }

    
    /**
     * POST /api/jurnal-umum
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'jenis_transaksi' => 'required|string',
            'id_unit' => 'required|exists:unit,id_unit',
            'id_divisi' => 'required|exists:divisi,id_divisi',
            'id_akun' => 'required|array',
            'id_akun.*' => 'exists:akun,id_akun',
            'debit' => 'required|array',
            'kredit' => 'required|array',
            'id_kegiatan' => 'nullable|exists:kegiatan,id_kegiatan',
            'id_sumber_anggaran' => 'nullable|exists:akun,id_akun',
        ]);

        $id_user = Auth::id();
        DB::statement("SET @current_user_id = $id_user");

        $jurnal = DB::transaction(function () use ($request) {

            $lastNumber = (int) Jurnal_Umum::max(DB::raw('CAST(no_bukti AS UNSIGNED)'));
            $no_bukti = str_pad($lastNumber + 1, 7, '0', STR_PAD_LEFT);

            $jurnal = Jurnal_Umum::create([
                'tanggal' => $request->tanggal,
                'no_bukti' => $no_bukti,
                'keterangan' => $request->keterangan,
                'jenis_transaksi' => $request->jenis_transaksi,
                'id_unit' => $request->id_unit,
                'id_divisi' => $request->id_divisi,
                'id_kegiatan' => $request->id_kegiatan,
                'id_sumber_anggaran' => $request->id_sumber_anggaran,
                'kode_sumbangan' => $request->kode_sumbangan ?? '',
                'kode_ph' => $request->kode_ph ?? '',
            ]);

            foreach ($request->id_akun as $i => $akun) {
                $debit = (int) preg_replace('/\D/', '', $request->debit[$i]) ?: 0;
                $kredit = (int) preg_replace('/\D/', '', $request->kredit[$i]) ?: 0;

                if ($debit > 0) {
                    Detail_Jurnal_Umum::create([
                        'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                        'id_akun' => $akun,
                        'nominal' => $debit,
                        'debit_kredit' => 'debit'
                    ]);
                }

                if ($kredit > 0) {
                    Detail_Jurnal_Umum::create([
                        'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                        'id_akun' => $akun,
                        'nominal' => $kredit,
                        'debit_kredit' => 'kredit'
                    ]);
                }
            }

            if ($request->postingBukuBesar) {
                Buku_Besar::create([
                    'id_jurnal_umum' => $jurnal->id_jurnal_umum
                ]);
            }

            return $jurnal;
        });

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil disimpan',
            'data' => $jurnal
        ], 201);
    }


    /**
     * GET /api/jurnal-umum/{id}
     */
    public function show($id)
    {
        $jurnal = Jurnal_Umum::with(['detail_jurnal_umum', 'buku_besar'])->find($id);

        if (!$jurnal) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $jurnal
        ]);
    }


    /**
     * PUT /api/jurnal-umum/{id}
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'jenis_transaksi' => 'required|string',
            'id_unit' => 'required|exists:unit,id_unit',
            'id_divisi' => 'required|exists:divisi,id_divisi',
            'id_akun' => 'required|array',
            'id_akun.*' => 'exists:akun,id_akun',
            'debit' => 'required|array',
            'kredit' => 'required|array',
        ]);

        DB::statement("SET @current_user_id = " . Auth::id());

        $jurnal = Jurnal_Umum::find($id);
        if (!$jurnal) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }

        DB::transaction(function () use ($request, $jurnal) {

            $jurnal->update($request->only([
                'tanggal', 'keterangan', 'jenis_transaksi',
                'id_unit', 'id_divisi', 'id_kegiatan', 'id_sumber_anggaran'
            ]));

            Detail_Jurnal_Umum::where('id_jurnal_umum', $jurnal->id_jurnal_umum)->delete();

            foreach ($request->id_akun as $i => $akun) {
                $debit = (int) preg_replace('/\D/', '', $request->debit[$i]) ?: 0;
                $kredit = (int) preg_replace('/\D/', '', $request->kredit[$i]) ?: 0;

                if ($debit > 0) {
                    Detail_Jurnal_Umum::create([
                        'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                        'id_akun' => $akun,
                        'nominal' => $debit,
                        'debit_kredit' => 'debit'
                    ]);
                }

                if ($kredit > 0) {
                    Detail_Jurnal_Umum::create([
                        'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                        'id_akun' => $akun,
                        'nominal' => $kredit,
                        'debit_kredit' => 'kredit'
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diperbarui'
        ]);
    }


    /**
     * DELETE /api/jurnal-umum/{id}
     */
    public function destroy($id)
    {
        $jurnal = Jurnal_Umum::find($id);

        if (!$jurnal) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }

        DB::transaction(function () use ($jurnal) {
            Detail_Jurnal_Umum::where('id_jurnal_umum', $jurnal->id_jurnal_umum)->delete();
            $jurnal->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dihapus'
        ]);
    }

    /**
     * GET /api/jurnal-umum/daily-stats
     * Mengambil statistik jumlah transaksi harian dalam 30 hari terakhir
     */
    public function dailyStats(Request $request)
    {
        $user = Auth::user();
        
        // ==========================
        // 1. Determine date range (last 30 days)
        // ==========================
        $endDate = Carbon::now()->endOfDay();
        $startDate = Carbon::now()->subDays(29)->startOfDay();
        
        // ==========================
        // 2. Handle role-based filtering
        // ==========================
        $unitFilter = null;
        $divisiFilter = null;
        
        if ($user->role === 'akuntan_unit') {
            $akunUnit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->first();
            if ($akunUnit) {
                $unitFilter = $akunUnit->id_unit;
            }
        }
        
        if ($user->role === 'akuntan_divisi') {
            $divisiFilter = $user->id_divisi;
        }
        
        // ==========================
        // 3. Build query for daily counts
        // ==========================
        $query = Jurnal_Umum::select(
                DB::raw('DATE(tanggal) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('tanggal', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        
        // Apply role-based filters
        if ($unitFilter) {
            $query->where('id_unit', $unitFilter);
        }
        if ($divisiFilter) {
            $query->where('id_divisi', $divisiFilter);
        }
        
        $query->groupBy(DB::raw('DATE(tanggal)'))
              ->orderBy('date', 'asc');
        
        $results = $query->get()->keyBy('date');
        
        // ==========================
        // 4. Build complete 30-day array with all dates
        // ==========================
        $data = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            $dateKey = $currentDate->format('Y-m-d');
            $data[] = [
                'date' => $dateKey,
                'formatted_date' => $currentDate->locale('id')->isoFormat('DD MMM'),
                'full_date' => $currentDate->locale('id')->isoFormat('DD MMMM YYYY'),
                'day_name' => $currentDate->locale('id')->isoFormat('dddd'),
                'count' => isset($results[$dateKey]) ? (int) $results[$dateKey]->count : 0
            ];
            $currentDate->addDay();
        }
        
        // ==========================
        // 5. Calculate summary statistics
        // ==========================
        $totalTransactions = array_sum(array_column($data, 'count'));
        $maxTransactions = max(array_column($data, 'count'));
        $avgTransactions = $totalTransactions > 0 ? round($totalTransactions / 30, 1) : 0;
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'summary' => [
                'total' => $totalTransactions,
                'max' => $maxTransactions,
                'average' => $avgTransactions,
                'period' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d')
                ]
            ],
            'debug' => [
                'user_role' => $user->role,
                'unit_filter' => $unitFilter,
                'divisi_filter' => $divisiFilter,
                'raw_results_count' => $results->count()
            ]
        ]);
    }
}
