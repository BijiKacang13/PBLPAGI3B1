<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Divisi;
use App\Models\Buku_Besar;
use App\Models\Akuntan_Unit;
use App\Models\Jurnal_Umum ;
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
    

    public function index(Request $request)
    {
        $akun_id = $request->filled('akun') ? $request->akun : 1;
        $start_date = $request->filled('start_date') ? $request->start_date : date('Y-01-01');
        $end_date = $request->filled('end_date') ? $request->end_date : date('Y-m-d');

        $user = Auth::user();

        $id_unit = $request->filled('id_unit') ? $request->id_unit : null;
        $id_divisi = $request->filled('id_divisi') ? $request->id_divisi : null;

        if (!$id_unit && !$id_divisi) {
            if ($user->role === 'akuntan_unit') {
                $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
            } elseif ($user->role === 'akuntan_divisi') {
                $id_divisi = Akuntan_Divisi::where('id_akuntan_divisi', $user->id_user)->value('id_divisi');
            }
        }

        // Panggil prosedur 
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

        // Hitung total debit dan kredit sebelum paginasi
        $total_debit = $detail_jurnal->where('debit_kredit', 'debit')->sum('nominal');
        $total_kredit = $detail_jurnal->where('debit_kredit', 'kredit')->sum('nominal');

        // Manual paginasi
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

        $akunList = Akun::all();
        $akun = Akun::find($akun_id);

        $saldo_awal = 0;
        $saldo_akhir = 0;
        $kategori = null;

        if ($akun) {
            $kategori = $akun->sub_kategori_akun->kategori_akun->kategori_akun ?? null;
            $sub_kategori = $akun->sub_kategori_akun->sub_kategori_akun ?? null;

            // ========== LOGIKA KHUSUS UNTUK ASET NETO ==========
            if ($kategori === 'ASET NETO' && in_array($sub_kategori, ['Dengan Pembatasan', 'Tanpa Pembatasan'])) {
                
                // Function untuk menghitung kenaikan periode
                $getKenaikan = function ($id_akun, $start, $end) use ($id_unit, $id_divisi) {
                    $query = DB::table('detail_jurnal_umum')
                        ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
                        ->whereIn('jurnal_umum.id_jurnal_umum', DB::table('buku_besar')->pluck('id_jurnal_umum')->toArray()) // Hanya jurnal yang sudah diposting
                        ->where('detail_jurnal_umum.id_akun', $id_akun)
                        ->whereBetween('jurnal_umum.tanggal', [$start, $end]);

                    if ($id_unit) $query->where('jurnal_umum.id_unit', $id_unit);
                    if ($id_divisi) $query->where('jurnal_umum.id_divisi', $id_divisi);

                    return $query->select(
                        DB::raw("SUM(CASE WHEN debit_kredit = 'debit' THEN nominal ELSE 0 END) as total_debit"),
                        DB::raw("SUM(CASE WHEN debit_kredit = 'kredit' THEN nominal ELSE 0 END) as total_kredit")
                    )->first();
                };

                // Function untuk menghitung total manual berdasarkan jenis transaksi
                $getTotalManual = function ($isPendapatan, $jenis_transaksi, $start, $end) use ($id_unit, $id_divisi) {
                    $kategori_target = $isPendapatan ? 'PENERIMAAN DAN SUMBANGAN' : 'BEBAN';
                    $debit_kredit = $isPendapatan ? 'kredit' : 'debit';

                    return DB::table('detail_jurnal_umum as dju')
                        ->join('jurnal_umum as ju', 'dju.id_jurnal_umum', '=', 'ju.id_jurnal_umum')
                        ->join('akun as a', 'dju.id_akun', '=', 'a.id_akun')
                        ->join('sub_kategori_akun as ska', 'a.id_sub_kategori_akun', '=', 'ska.id_sub_kategori_akun')
                        ->join('kategori_akun as ka', 'ska.id_kategori_akun', '=', 'ka.id_kategori_akun')
                        ->whereIn('ju.id_jurnal_umum', DB::table('buku_besar')->pluck('id_jurnal_umum')->toArray()) // Hanya jurnal yang sudah diposting
                        ->where('ka.kategori_akun', $kategori_target)
                        ->where('ju.jenis_transaksi', $jenis_transaksi)
                        ->whereBetween('ju.tanggal', [$start, $end])
                        ->where('dju.debit_kredit', $debit_kredit)
                        ->when($id_unit, fn($q) => $q->where('ju.id_unit', $id_unit))
                        ->when($id_divisi, fn($q) => $q->where('ju.id_divisi', $id_divisi))
                        ->sum('dju.nominal');
                };

                // Saldo awal dari akun
                $saldo_awal = ($akun->saldo_awal_kredit ?? 0) - ($akun->saldo_awal_debit ?? 0);

                // Hitung kenaikan periode lalu (sebelum start_date)
                $kenaikan_periode_lalu = 0;
                $periodeLalu = DB::selectOne("CALL hitung_kenaikan_aset_neto(?, ?, ?, ?)", [
                    '1900-01-01',
                    date('Y-m-d', strtotime($start_date . ' -1 day')),
                    $id_unit,
                    $id_divisi
                ]);

                $kenaikan_periode_lalu = ($periodeLalu->terikat ?? 0) + ($periodeLalu->tidak_terikat ?? 0);
                
                // Hitung kenaikan periode berjalan berdasarkan jenis transaksi
                $jenis_transaksi = ($sub_kategori === 'Dengan Pembatasan') ? 'Terikat' : 'Tidak Terikat';
                
                $pendapatan_periode = $getTotalManual(true, $jenis_transaksi, $start_date, $end_date);
                $beban_periode = $getTotalManual(false, $jenis_transaksi, $start_date, $end_date);

                // Ambil saldo awal untuk proporsi
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

                // Hitung total pendapatan untuk proporsi
                $pendapatan_terikat_total = $getTotalManual(true, 'Terikat', $start_date, $end_date);
                $pendapatan_tidak_terikat_total = $getTotalManual(true, 'Tidak Terikat', $start_date, $end_date);
                $total_raw = $pendapatan_terikat_total + $pendapatan_tidak_terikat_total;

                $kenaikan_periode_berjalan = $pendapatan_periode - $beban_periode;

                // Tambahkan proporsi saldo awal jika ada total pendapatan
                if ($total_raw > 0) {
                    $proporsi = $pendapatan_periode / $total_raw;
                    $kenaikan_periode_berjalan += $saldoAwalPendapatan * $proporsi - $saldoAwalBeban * $proporsi;
                }

                // Hitung saldo akhir
                $saldo_akhir = $saldo_awal + $kenaikan_periode_lalu + $kenaikan_periode_berjalan;

            } else {
                // ========== LOGIKA NORMAL UNTUK AKUN LAINNYA ==========
                if (in_array($kategori, ['KEWAJIBAN', 'ASET NETO', 'PENERIMAAN DAN SUMBANGAN'])) {
                    // Saldo normal kredit
                    $saldo_awal = ($akun->saldo_awal_kredit ?? 0) - ($akun->saldo_awal_debit ?? 0);
                    $saldo_akhir = $saldo_awal - $total_debit + $total_kredit;
                } else {
                    // Saldo normal debit
                    $saldo_awal = ($akun->saldo_awal_debit ?? 0) - ($akun->saldo_awal_kredit ?? 0);
                    $saldo_akhir = $saldo_awal + $total_debit - $total_kredit;
                }
            }
        }

        if ($request->has('export_excel')) {
            return $this->exportExcelBukuBesar($akun, $detail_jurnal, $saldo_awal, $saldo_akhir, $start_date, $end_date);
        }

        return view('buku-besar', compact(
            'paginatedData',
            'akunList',
            'total_debit',
            'total_kredit',
            'saldo_awal',
            'saldo_akhir',
            'id_unit',
            'id_divisi'
        ));
    }

    private function exportExcelBukuBesar($akun, $data, $saldo_awal, $saldo_akhir, $start_date, $end_date)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // 🔁 Merge cell A1:G4
        $sheet->mergeCells('A1:G4');

        // 🖼️ Logo
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo');
        $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
        $drawing->setHeight(150);
        $drawing->setCoordinates('A1');
        $drawing->setOffsetX(10);
        $drawing->setOffsetY(5);
        $drawing->setWorksheet($sheet);

        // 📝 RichText Judul
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

        // 🧮 Saldo Awal (Baris 6)
        $sheet->mergeCells('A6:E6');
        $sheet->setCellValue('A6', 'Saldo Awal');
        $sheet->setCellValue('F6', $saldo_awal);
        $sheet->getStyle('A6:F6')->getFont()->setBold(true);
        $sheet->getStyle('F6')->getNumberFormat()->setFormatCode('#,##0');

        // 🧮 Saldo Akhir (Baris 7)
        $sheet->mergeCells('A7:E7');
        $sheet->setCellValue('A7', 'Saldo Akhir');
        $sheet->setCellValue('F7', $saldo_akhir);
        $sheet->getStyle('A7:F7')->getFont()->setBold(true);
        $sheet->getStyle('F7')->getNumberFormat()->setFormatCode('#,##0');

        // 📋 Header Tabel (Baris 9)
        $header = ['Tanggal', 'No Bukti', 'Keterangan', 'Unit', 'Divisi', 'Debit', 'Kredit'];
        $sheet->fromArray($header, null, 'A9');
        $sheet->getStyle('A9:G9')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '000000']],
            'font' => ['color' => ['rgb' => 'FFFFFF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        // 📄 Isi Data (Mulai baris 10)
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

        // 🖋️ Border dan Autosize
        $sheet->getStyle("A9:G" . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // ⬇️ Output
        $filename = 'Buku_Besar_' . $akun->kode_akun . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment;filename=\"{$filename}\"");
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function store(Request $request)
    {
        DB::statement("SET @current_user_id = " . Auth::id());

        $validated = $request->validate([
            'id_jurnal_umum' => 'required|exists:jurnal_umum,id_jurnal_umum',
        ]);

        $id = $validated['id_jurnal_umum'];

        $posted = Buku_Besar::firstOrCreate(['id_jurnal_umum' => $id]);

        if (!$posted->wasRecentlyCreated) {
            return back()->with('error', 'Jurnal sudah diposting.');
        }

        return back()->with('success', 'Berhasil diposting ke Buku Besar.');
    }

    public function postingSemua(Request $request)
    {
        DB::statement("SET @current_user_id = " . Auth::id());

        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $user = Auth::user();

        $query = Jurnal_Umum::query();

        if ($start_date && $end_date) {
            $query->whereBetween('tanggal', [$start_date, $end_date]);
        }

        // Jika user adalah akuntan_unit, batasi hanya jurnal dari unit dia
        if ($user->role === 'akuntan_unit') {
            $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
            $query->where('id_unit', $id_unit);
        }

        $jurnalBelumDiposting = $query->whereDoesntHave('buku_besar')->pluck('id_jurnal_umum');

        try {
            DB::transaction(function () use ($jurnalBelumDiposting) {
                foreach ($jurnalBelumDiposting as $id_jurnal) {
                    Buku_Besar::firstOrCreate(['id_jurnal_umum' => $id_jurnal]);
                }
            });

            return back()->with('success', '✅ Semua jurnal berhasil diposting ke Buku Besar.');
        } catch (\Throwable $e) {
            return back()->with('error', '❌ Gagal posting: ' . $e->getMessage());
        }
    }



}
