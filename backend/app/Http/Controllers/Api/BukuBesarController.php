<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Divisi;
use App\Models\Buku_Besar;
use App\Models\Akuntan_Unit;
use App\Models\Jurnal_Umum;
use Illuminate\Http\Request;
use App\Models\Akuntan_Divisi;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Illuminate\Pagination\LengthAwarePaginator;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class BukuBesarController extends Controller
{
    /**
     * GET /api/buku-besar
     * Mengambil data buku besar dengan filter
     */
    public function index(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'akun' => 'nullable|integer|exists:akun,id_akun',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'id_unit' => 'nullable|integer',
                'id_divisi' => 'nullable|integer',
                'search' => 'nullable|string|max:255',
                'per_page' => 'nullable|integer|min:1|max:100',
                'page' => 'nullable|integer|min:1'
            ]);

            // Set default values
            $akun_id = $request->filled('akun') ? $request->akun : 1;
            $start_date = $request->filled('start_date') ? $request->start_date : date('Y-01-01');
            $end_date = $request->filled('end_date') ? $request->end_date : date('Y-m-d');

            $user = Auth::user() ?? (object)['role' => null, 'id_user' => null];

            $id_unit = $request->filled('id_unit') ? $request->id_unit : null;
            $id_divisi = $request->filled('id_divisi') ? $request->id_divisi : null;

            // Logic untuk menentukan unit/divisi berdasarkan role user
            if (!$id_unit && !$id_divisi) {
                if ($user->role === 'akuntan_unit') {
                    $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
                } elseif ($user->role === 'akuntan_divisi') {
                    $id_divisi = Akuntan_Divisi::where('id_akuntan_divisi', $user->id_user)->value('id_divisi');
                }
            }

            // Panggil stored procedure
            $detail_jurnal = collect(DB::select(
                'CALL laporan_buku_besar(?, ?, ?, ?, ?)',
                [$akun_id, $start_date, $end_date, $id_unit, $id_divisi]
            ));

            // Filter pencarian
            if ($request->filled('search')) {
                $search = strtolower($request->search);
                $detail_jurnal = $detail_jurnal->filter(function ($item) use ($search) {
                    return str_contains(strtolower($item->no_bukti), $search)
                        || str_contains(strtolower($item->keterangan), $search)
                        || str_contains(strtolower($item->akun), $search)
                        || str_contains(strtolower($item->unit ?? ''), $search)
                        || str_contains(strtolower($item->divisi ?? ''), $search)
                        || str_contains(strtolower($item->kode_sumbangan ?? ''), $search)
                        || str_contains(strtolower($item->kode_ph ?? ''), $search);
                });
            }

            // Hitung total debit dan kredit
            $total_debit = $detail_jurnal->where('debit_kredit', 'debit')->sum('nominal');
            $total_kredit = $detail_jurnal->where('debit_kredit', 'kredit')->sum('nominal');

            // Get data akun
            $akun = Akun::find($akun_id);

            // Hitung saldo
            $saldo_awal = 0;
            $saldo_akhir = 0;
            $kategori = null;

            if ($akun) {
                $kategori = $akun->sub_kategori_akun->kategori_akun->kategori_akun ?? null;
                $sub_kategori = $akun->sub_kategori_akun->sub_kategori_akun ?? null;

                // Logic untuk ASET NETO
                if ($kategori === 'ASET NETO' && in_array($sub_kategori, ['Dengan Pembatasan', 'Tanpa Pembatasan'])) {
                    $saldo_awal = ($akun->saldo_awal_kredit ?? 0) - ($akun->saldo_awal_debit ?? 0);

                    // Hitung kenaikan periode lalu
                    $kenaikan_periode_lalu = 0;
                    $periodeLalu = DB::selectOne("CALL hitung_kenaikan_aset_neto(?, ?, ?, ?)", [
                        '1900-01-01',
                        date('Y-m-d', strtotime($start_date . ' -1 day')),
                        $id_unit,
                        $id_divisi
                    ]);

                    $kenaikan_periode_lalu = ($periodeLalu->terikat ?? 0) + ($periodeLalu->tidak_terikat ?? 0);

                    // Function getTotalManual
                    $getTotalManual = function ($isPendapatan, $jenis_transaksi, $start, $end) use ($id_unit, $id_divisi) {
                        $kategori_target = $isPendapatan ? 'PENERIMAAN DAN SUMBANGAN' : 'BEBAN';
                        $debit_kredit = $isPendapatan ? 'kredit' : 'debit';

                        return DB::table('detail_jurnal_umum as dju')
                            ->join('jurnal_umum as ju', 'dju.id_jurnal_umum', '=', 'ju.id_jurnal_umum')
                            ->join('akun as a', 'dju.id_akun', '=', 'a.id_akun')
                            ->join('sub_kategori_akun as ska', 'a.id_sub_kategori_akun', '=', 'ska.id_sub_kategori_akun')
                            ->join('kategori_akun as ka', 'ska.id_kategori_akun', '=', 'ka.id_kategori_akun')
                            ->whereIn('ju.id_jurnal_umum', DB::table('buku_besar')->pluck('id_jurnal_umum')->toArray())
                            ->where('ka.kategori_akun', $kategori_target)
                            ->where('ju.jenis_transaksi', $jenis_transaksi)
                            ->whereBetween('ju.tanggal', [$start, $end])
                            ->where('dju.debit_kredit', $debit_kredit)
                            ->when($id_unit, fn($q) => $q->where('ju.id_unit', $id_unit))
                            ->when($id_divisi, fn($q) => $q->where('ju.id_divisi', $id_divisi))
                            ->sum('dju.nominal');
                    };

                    $jenis_transaksi = ($sub_kategori === 'Dengan Pembatasan') ? 'Terikat' : 'Tidak Terikat';

                    $pendapatan_periode = $getTotalManual(true, $jenis_transaksi, $start_date, $end_date);
                    $beban_periode = $getTotalManual(false, $jenis_transaksi, $start_date, $end_date);

                    // Saldo awal pendapatan dan beban
                    $saldoAwalPendapatan = DB::table('akun')
                        ->join('sub_kategori_akun', 'akun.id_sub_kategori_akun', '=', 'sub_kategori_akun.id_sub_kategori_akun')
                        ->join('kategori_akun', 'sub_kategori_akun.id_kategori_akun', '=', 'kategori_akun.id_kategori_akun')
                        ->where('kategori_akun.kategori_akun', 'PENERIMAAN DAN SUMBANGAN')
                        ->sum('akun.saldo_awal_kredit');

                    $saldoAwalBeban = DB::table('akun')
                        ->join('sub_kategori_akun', 'akun.id_sub_kategori_akun', '=', 'sub_kategori_akun.id_sub_kategori_akun')
                        ->join('kategori_akun', 'sub_kategori_akun.id_kategori_akun', '=', 'kategori_akun.id_kategori_akun')
                        ->where('kategori_akun.kategori_akun', 'BEBAN')
                        ->sum('akun.saldo_awal_debit');

                    $pendapatan_terikat_total = $getTotalManual(true, 'Terikat', $start_date, $end_date);
                    $pendapatan_tidak_terikat_total = $getTotalManual(true, 'Tidak Terikat', $start_date, $end_date);
                    $total_raw = $pendapatan_terikat_total + $pendapatan_tidak_terikat_total;

                    $kenaikan_periode_berjalan = $pendapatan_periode - $beban_periode;

                    if ($total_raw > 0) {
                        $proporsi = $pendapatan_periode / $total_raw;
                        $kenaikan_periode_berjalan += $saldoAwalPendapatan * $proporsi - $saldoAwalBeban * $proporsi;
                    }

                    $saldo_akhir = $saldo_awal + $kenaikan_periode_lalu + $kenaikan_periode_berjalan;

                } else {
                    // Logic normal untuk akun lainnya
                    if (in_array($kategori, ['KEWAJIBAN', 'ASET NETO', 'PENERIMAAN DAN SUMBANGAN'])) {
                        $saldo_awal = ($akun->saldo_awal_kredit ?? 0) - ($akun->saldo_awal_debit ?? 0);
                        $saldo_akhir = $saldo_awal - $total_debit + $total_kredit;
                    } else {
                        $saldo_awal = ($akun->saldo_awal_debit ?? 0) - ($akun->saldo_awal_kredit ?? 0);
                        $saldo_akhir = $saldo_awal + $total_debit - $total_kredit;
                    }
                }
            }

            // Manual pagination
            $perPage = $request->input('per_page', 20);
            $currentPage = LengthAwarePaginator::resolveCurrentPage();
            $pagedData = $detail_jurnal->slice(($currentPage - 1) * $perPage, $perPage)->values();

            $paginatedData = new LengthAwarePaginator(
                $pagedData,
                $detail_jurnal->count(),
                $perPage,
                $currentPage,
                ['path' => $request->url(), 'query' => $request->query()]
            );

            // Response JSON untuk API
            return response()->json([
                'success' => true,
                'message' => 'Data buku besar berhasil diambil',
                'data' => [
                    'items' => $paginatedData->items(),
                    'pagination' => [
                        'current_page' => $paginatedData->currentPage(),
                        'last_page' => $paginatedData->lastPage(),
                        'per_page' => $paginatedData->perPage(),
                        'total' => $paginatedData->total(),
                        'from' => $paginatedData->firstItem(),
                        'to' => $paginatedData->lastItem(),
                    ],
                    'filters' => [
                        'akun_id' => $akun_id,
                        'start_date' => $start_date,
                        'end_date' => $end_date,
                        'id_unit' => $id_unit,
                        'id_divisi' => $id_divisi,
                        'search' => $request->search,
                    ],
                    'akun' => $akun ? [
                        'id_akun' => $akun->id_akun,
                        'kode_akun' => $akun->kode_akun,
                        'akun' => $akun->akun,
                        'kategori' => $kategori,
                    ] : null,
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/buku-besar/akun-list
     * Mengambil daftar semua akun
     */
    public function getAkunList()
    {
        try {
            $akunList = Akun::with(['subKategori.kategori_akun'])
                ->orderBy('kode_akun')
                ->get()
                ->map(function ($akun) {

                    $subKategori = $akun->subKategori;
                    $kategori = $subKategori?->kategori_akun;

                    return [
                        'id_akun' => $akun->id_akun,
                        'kode_akun' => $akun->kode_akun,
                        'akun' => $akun->akun,
                        'kategori' => $kategori?->kategori_akun,
                        'sub_kategori' => $subKategori?->sub_kategori_akun,
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Daftar akun berhasil diambil',
                'data' => $akunList,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/buku-besar/export
     * Export data buku besar ke Excel
     */
    public function exportExcel(Request $request)
    {
        try {
            $validated = $request->validate([
                'akun' => 'required|integer|exists:akun,id_akun',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'id_unit' => 'nullable|integer',
                'id_divisi' => 'nullable|integer',
            ]);

            $akun_id = $request->akun;
            $start_date = $request->filled('start_date') ? $request->start_date : date('Y-01-01');
            $end_date = $request->filled('end_date') ? $request->end_date : date('Y-m-d');
            $id_unit = $request->id_unit;
            $id_divisi = $request->id_divisi;

            // Ambil data
            $detail_jurnal = collect(DB::select(
                'CALL laporan_buku_besar(?, ?, ?, ?, ?)',
                [$akun_id, $start_date, $end_date, $id_unit, $id_divisi]
            ));

            $akun = Akun::find($akun_id);

            // Hitung saldo (simplified version - gunakan logic yang sama seperti index)
            $total_debit = $detail_jurnal->where('debit_kredit', 'debit')->sum('nominal');
            $total_kredit = $detail_jurnal->where('debit_kredit', 'kredit')->sum('nominal');

            $kategori = $akun->sub_kategori_akun->kategori_akun->kategori_akun ?? null;

            if (in_array($kategori, ['KEWAJIBAN', 'ASET NETO', 'PENERIMAAN DAN SUMBANGAN'])) {
                $saldo_awal = ($akun->saldo_awal_kredit ?? 0) - ($akun->saldo_awal_debit ?? 0);
                $saldo_akhir = $saldo_awal - $total_debit + $total_kredit;
            } else {
                $saldo_awal = ($akun->saldo_awal_debit ?? 0) - ($akun->saldo_awal_kredit ?? 0);
                $saldo_akhir = $saldo_awal + $total_debit - $total_kredit;
            }

            return $this->generateExcel($akun, $detail_jurnal, $saldo_awal, $saldo_akhir, $start_date, $end_date);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal export: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate Excel file
     */
    private function generateExcel($akun, $data, $saldo_awal, $saldo_akhir, $start_date, $end_date)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Merge cell A1:G4
        $sheet->mergeCells('A1:G4');

        // Logo
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo');
        $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
        $drawing->setHeight(150);
        $drawing->setCoordinates('A1');
        $drawing->setOffsetX(10);
        $drawing->setOffsetY(5);
        $drawing->setWorksheet($sheet);

        // RichText Judul
        $richText = new RichText();
        $judulText = $richText->createTextRun("LAPORAN BUKU BESAR YAYASAN DARUSSALAM BATAM\n");
        $judulText->getFont()->setBold(true)->setSize(14);

        $akunText = $richText->createTextRun("Akun: {$akun->kode_akun} | {$akun->akun}\n");
        $akunText->getFont()->setBold(true)->setSize(12);

        $periodeText = $richText->createTextRun(
            "Periode " . Carbon::parse($start_date)->translatedFormat('d F Y') .
            " s.d. " . Carbon::parse($end_date)->translatedFormat('d F Y')
        );
        $periodeText->getFont()->setSize(10);

        $sheet->setCellValue('A1', $richText);
        $sheet->getStyle('A1')->getAlignment()->setWrapText(true);
        $sheet->getStyle('A1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getRowDimension('1')->setRowHeight(80);

        // Saldo Awal
        $sheet->mergeCells('A6:E6');
        $sheet->setCellValue('A6', 'Saldo Awal');
        $sheet->setCellValue('F6', $saldo_awal);
        $sheet->getStyle('A6:F6')->getFont()->setBold(true);
        $sheet->getStyle('F6')->getNumberFormat()->setFormatCode('#,##0');

        // Saldo Akhir
        $sheet->mergeCells('A7:E7');
        $sheet->setCellValue('A7', 'Saldo Akhir');
        $sheet->setCellValue('F7', $saldo_akhir);
        $sheet->getStyle('A7:F7')->getFont()->setBold(true);
        $sheet->getStyle('F7')->getNumberFormat()->setFormatCode('#,##0');

        // Header Tabel
        $header = ['Tanggal', 'No Bukti', 'Keterangan', 'Unit', 'Divisi', 'Debit', 'Kredit'];
        $sheet->fromArray($header, null, 'A9');
        $sheet->getStyle('A9:G9')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '000000']],
            'font' => ['color' => ['rgb' => 'FFFFFF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        // Isi Data
        $row = 10;
        foreach ($data as $item) {
            $sheet->setCellValue("A{$row}", $item->tanggal ?? '')
                ->setCellValue("B{$row}", $item->no_bukti ?? '')
                ->setCellValue("C{$row}", $item->keterangan ?? '')
                ->setCellValue("D{$row}", $item->unit ?? '')
                ->setCellValue("E{$row}", $item->divisi ?? '')
                ->setCellValue("F{$row}", $item->debit_kredit === 'debit' ? $item->nominal : null)
                ->setCellValue("G{$row}", $item->debit_kredit === 'kredit' ? $item->nominal : null);

            $sheet->getStyle("F{$row}:G{$row}")
                ->getNumberFormat()
                ->setFormatCode('#,##0');
            $row++;
        }

        // Border dan Autosize
        $sheet->getStyle("A9:G" . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Output
        $filename = 'Buku_Besar_' . $akun->kode_akun . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment;filename=\"{$filename}\"");
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    /**
     * POST /api/buku-besar/posting
     * Posting satu jurnal ke buku besar
     */
    public function store(Request $request)
    {
        try {
            DB::statement("SET @current_user_id = " . Auth::id());

            $validated = $request->validate([
                'id_jurnal_umum' => 'required|exists:jurnal_umum,id_jurnal_umum',
            ]);

            $id = $validated['id_jurnal_umum'];

            $posted = Buku_Besar::firstOrCreate(['id_jurnal_umum' => $id]);

            if (!$posted->wasRecentlyCreated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jurnal sudah diposting.',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil diposting ke Buku Besar.',
                'data' => $posted,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/buku-besar/posting-semua
     * Posting semua jurnal yang belum diposting
     */
    public function postingSemua(Request $request)
    {
        try {
            DB::statement("SET @current_user_id = " . Auth::id());

            $validated = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
            ]);

            $start_date = $request->start_date;
            $end_date = $request->end_date;

            $user = Auth::user();

            $query = Jurnal_Umum::query();

            if ($start_date && $end_date) {
                $query->whereBetween('tanggal', [$start_date, $end_date]);
            }

            // Filter berdasarkan role
            if ($user->role === 'akuntan_unit') {
                $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
                $query->where('id_unit', $id_unit);
            }

            $jurnalBelumDiposting = $query->whereDoesntHave('buku_besar')->pluck('id_jurnal_umum');

            if ($jurnalBelumDiposting->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada jurnal yang perlu diposting.',
                    'data' => [
                        'total_posted' => 0,
                    ],
                ], 200);
            }

            DB::transaction(function () use ($jurnalBelumDiposting) {
                foreach ($jurnalBelumDiposting as $id_jurnal) {
                    Buku_Besar::firstOrCreate(['id_jurnal_umum' => $id_jurnal]);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Semua jurnal berhasil diposting ke Buku Besar.',
                'data' => [
                    'total_posted' => $jurnalBelumDiposting->count(),
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}