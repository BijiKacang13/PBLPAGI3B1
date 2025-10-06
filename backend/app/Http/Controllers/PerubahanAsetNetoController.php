<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Support\Facades\DB;
use App\Models\Perubahan_Aset_Neto;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class PerubahanAsetNetoController extends Controller
{
    
    // public function index(Request $request)
    // {
    //     $user = Auth::user();

    //     $start = $request->input('tanggal_mulai') ?? date('Y') . '-01-01';
    //     $end = $request->input('tanggal_selesai') ?? date('Y-m-d');

    //     // Cek dan tetapkan unit & divisi sesuai role
    //     $id_unit = $request->unit;
    //     $id_divisi = $request->divisi;

    //     if (!$id_unit && $user->role === 'akuntan_unit') {
    //         $id_unit = \App\Models\Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
    //     }
    //     if (!$id_divisi && $user->role === 'akuntan_divisi') {
    //         $id_divisi = \App\Models\Akuntan_Divisi::where('id_akuntan_divisi', $user->id_user)->value('id_divisi');
    //     }

    //     // Ambil akun ASET NETO
    //     $akunDengan = DB::table('akun')
    //         ->join('sub_kategori_akun', 'akun.id_sub_kategori_akun', '=', 'sub_kategori_akun.id_sub_kategori_akun')
    //         ->join('kategori_akun', 'sub_kategori_akun.id_kategori_akun', '=', 'kategori_akun.id_kategori_akun')
    //         ->where('kategori_akun.kategori_akun', 'ASET NETO')
    //         ->where('sub_kategori_akun.sub_kategori_akun', 'Dengan Pembatasan')
    //         ->select('akun.*')
    //         ->first();

    //     $akunTanpa = DB::table('akun')
    //         ->join('sub_kategori_akun', 'akun.id_sub_kategori_akun', '=', 'sub_kategori_akun.id_sub_kategori_akun')
    //         ->join('kategori_akun', 'sub_kategori_akun.id_kategori_akun', '=', 'kategori_akun.id_kategori_akun')
    //         ->where('kategori_akun.kategori_akun', 'ASET NETO')
    //         ->where('sub_kategori_akun.sub_kategori_akun', 'Tanpa Pembatasan')
    //         ->select('akun.*')
    //         ->first();

    //     $getKenaikan = function ($id_akun, $start, $end) use ($id_unit, $id_divisi) {
    //         $query = DB::table('detail_jurnal_umum')
    //             ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
    //             ->where('detail_jurnal_umum.id_akun', $id_akun)
    //             ->whereBetween('jurnal_umum.tanggal', [$start, $end]);

    //         if ($id_unit) $query->where('jurnal_umum.id_unit', $id_unit);
    //         if ($id_divisi) $query->where('jurnal_umum.id_divisi', $id_divisi);

    //         return $query->select(
    //             DB::raw("SUM(CASE WHEN debit_kredit = 'debit' THEN nominal ELSE 0 END) as total_debit"),
    //             DB::raw("SUM(CASE WHEN debit_kredit = 'kredit' THEN nominal ELSE 0 END) as total_kredit")
    //         )->first();
    //     };

    //     $data = [
    //         'dengan_pembatasan' => [
    //             'saldo_awal' => $akunDengan ? $akunDengan->saldo_awal_kredit - $akunDengan->saldo_awal_debit : 0,
    //             'kenaikan_periode_lalu' => 0,
    //             'kenaikan_periode_berjalan' => 0,
    //             'saldo_akhir' => 0,
    //         ],
    //         'tanpa_pembatasan' => [
    //             'saldo_awal' => $akunTanpa ? $akunTanpa->saldo_awal_kredit - $akunTanpa->saldo_awal_debit : 0,
    //             'kenaikan_periode_lalu' => 0,
    //             'kenaikan_periode_berjalan' => 0,
    //             'saldo_akhir' => 0,
    //         ],
    //     ];

    //     if ($akunDengan) {
    //         $lalu = $getKenaikan($akunDengan->id_akun, '1900-01-01', date('Y-m-d', strtotime($start . ' -1 day')));
    //         $data['dengan_pembatasan']['kenaikan_periode_lalu'] = ($lalu->total_kredit ?? 0) - ($lalu->total_debit ?? 0);
    //     }

    //     if ($akunTanpa) {
    //         $lalu = $getKenaikan($akunTanpa->id_akun, '1900-01-01', date('Y-m-d', strtotime($start . ' -1 day')));
    //         $data['tanpa_pembatasan']['kenaikan_periode_lalu'] = ($lalu->total_kredit ?? 0) - ($lalu->total_debit ?? 0);
    //     }

    //     $getTotalManual = function ($isPendapatan, $jenis_transaksi, $start, $end) use ($id_unit, $id_divisi) {
    //         $kategori = $isPendapatan ? 'PENERIMAAN DAN SUMBANGAN' : 'BEBAN';
    //         $debit_kredit = $isPendapatan ? 'kredit' : 'debit';

    //         return DB::table('detail_jurnal_umum as dju')
    //             ->join('jurnal_umum as ju', 'dju.id_jurnal_umum', '=', 'ju.id_jurnal_umum')
    //             ->join('akun as a', 'dju.id_akun', '=', 'a.id_akun')
    //             ->join('sub_kategori_akun as ska', 'a.id_sub_kategori_akun', '=', 'ska.id_sub_kategori_akun')
    //             ->join('kategori_akun as ka', 'ska.id_kategori_akun', '=', 'ka.id_kategori_akun')
    //             ->where('ka.kategori_akun', $kategori)
    //             ->where('ju.jenis_transaksi', $jenis_transaksi)
    //             ->whereBetween('ju.tanggal', [$start, $end])
    //             ->where('dju.debit_kredit', $debit_kredit)
    //             ->when($id_unit, fn($q) => $q->where('ju.id_unit', $id_unit))
    //             ->when($id_divisi, fn($q) => $q->where('ju.id_divisi', $id_divisi))
    //             ->sum('dju.nominal');
    //     };

    //     $pendapatan_terikat = $getTotalManual(true, 'Terikat', $start, $end);
    //     $beban_terikat = $getTotalManual(false, 'Terikat', $start, $end);
    //     $pendapatan_tidak_terikat = $getTotalManual(true, 'Tidak Terikat', $start, $end);
    //     $beban_tidak_terikat = $getTotalManual(false, 'Tidak Terikat', $start, $end);

    //     $saldoAwalPendapatan = DB::table('akun')
    //         ->join('sub_kategori_akun', 'akun.id_sub_kategori_akun', '=', 'sub_kategori_akun.id_sub_kategori_akun')
    //         ->join('kategori_akun', 'sub_kategori_akun.id_kategori_akun', '=', 'kategori_akun.id_kategori_akun')
    //         ->where('kategori_akun.kategori_akun', 'PENERIMAAN DAN SUMBANGAN')
    //         ->sum('akun.saldo_awal_kredit');

    //     $saldoAwalBeban = DB::table('akun')
    //         ->join('sub_kategori_akun', 'akun.id_sub_kategori_akun', '=', 'sub_kategori_akun.id_sub_kategori_akun')
    //         ->join('kategori_akun', 'sub_kategori_akun.id_kategori_akun', '=', 'kategori_akun.id_kategori_akun')
    //         ->where('kategori_akun.kategori_akun', 'BEBAN')
    //         ->sum('akun.saldo_awal_debit');

    //     $total_raw = $pendapatan_terikat + $pendapatan_tidak_terikat;
    //     $kenaikan_terikat = $pendapatan_terikat - $beban_terikat;
    //     $kenaikan_tidak_terikat = $pendapatan_tidak_terikat - $beban_tidak_terikat;

    //     if ($total_raw > 0) {
    //         $proporsi_terikat = $pendapatan_terikat / $total_raw;
    //         $proporsi_tidak_terikat = $pendapatan_tidak_terikat / $total_raw;

    //         $kenaikan_terikat += $saldoAwalPendapatan * $proporsi_terikat - $saldoAwalBeban * $proporsi_terikat;
    //         $kenaikan_tidak_terikat += $saldoAwalPendapatan * $proporsi_tidak_terikat - $saldoAwalBeban * $proporsi_tidak_terikat;
    //     }

    //     $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = $kenaikan_terikat;
    //     $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = $kenaikan_tidak_terikat;

    //     $data['dengan_pembatasan']['saldo_akhir'] =
    //         $data['dengan_pembatasan']['saldo_awal'] +
    //         $data['dengan_pembatasan']['kenaikan_periode_lalu'] +
    //         $data['dengan_pembatasan']['kenaikan_periode_berjalan'];

    //     $data['tanpa_pembatasan']['saldo_akhir'] =
    //         $data['tanpa_pembatasan']['saldo_awal'] +
    //         $data['tanpa_pembatasan']['kenaikan_periode_lalu'] +
    //         $data['tanpa_pembatasan']['kenaikan_periode_berjalan'];

    //     $total_saldo_akhir = $data['dengan_pembatasan']['saldo_akhir'] + $data['tanpa_pembatasan']['saldo_akhir'];

    //     if ($request->has('export_excel')) {
    //         return $this->export_excel($data, $total_saldo_akhir, $start, $end);
    //     }

    //     $units = Unit::all();
    //     $divisis = Divisi::all();

    //     return view('perubahan_aset_neto', compact(
    //         'data',
    //         'total_saldo_akhir',
    //         'start',
    //         'end',
    //         'units',
    //         'divisis',
    //         'id_unit',
    //         'id_divisi'
    //     ));
    // }
    
    // public function index(Request $request)
    // {
    //     $user = Auth::user();
    //     $start = $request->input('tanggal_mulai') ?? date('Y') . '-01-01';
    //     $end = $request->input('tanggal_selesai') ?? date('Y-m-d');

    //     $id_unit = $request->unit;
    //     $id_divisi = $request->divisi;

    //     if (!$id_unit && $user->role === 'akuntan_unit') {
    //         $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
    //     }
    //     if (!$id_divisi && $user->role === 'akuntan_divisi') {
    //         $id_divisi = Akuntan_Divisi::where('id_akuntan_divisi', $user->id_user)->value('id_divisi');
    //     }

    //     $akunDengan = Akun::whereHas('sub_kategori_akun.kategori_akun', fn($q) =>
    //         $q->where('kategori_akun', 'ASET NETO')
    //     )->whereHas('sub_kategori_akun', fn($q) =>
    //         $q->where('sub_kategori_akun', 'Dengan Pembatasan')
    //     )->first();

    //     $akunTanpa = Akun::whereHas('sub_kategori_akun.kategori_akun', fn($q) =>
    //         $q->where('kategori_akun', 'ASET NETO')
    //     )->whereHas('sub_kategori_akun', fn($q) =>
    //         $q->where('sub_kategori_akun', 'Tanpa Pembatasan')
    //     )->first();

    //     $data = [
    //         'dengan_pembatasan' => [
    //             'saldo_awal' => $akunDengan ? $akunDengan->saldo_awal_kredit - $akunDengan->saldo_awal_debit : 0,
    //             'kenaikan_periode_lalu' => 0, // Sudah termasuk dalam saldo_awal
    //             'kenaikan_periode_berjalan' => 0,
    //             'saldo_akhir' => 0,
    //         ],
    //         'tanpa_pembatasan' => [
    //             'saldo_awal' => $akunTanpa ? $akunTanpa->saldo_awal_kredit - $akunTanpa->saldo_awal_debit : 0,
    //             'kenaikan_periode_lalu' => 0, // Sudah termasuk dalam saldo_awal
    //             'kenaikan_periode_berjalan' => 0,
    //             'saldo_akhir' => 0,
    //         ],
    //     ];

    //     $getTotalManual = function ($isPendapatan, $jenis_transaksi, $start, $end) use ($id_unit, $id_divisi) {
    //         $kategori = $isPendapatan ? 'PENERIMAAN DAN SUMBANGAN' : 'BEBAN';
    //         $debit_kredit = $isPendapatan ? 'kredit' : 'debit';

    //         return Detail_Jurnal_Umum::where('debit_kredit', $debit_kredit)
    //             ->whereHas('akun.sub_kategori_akun.kategori_akun', fn($q) =>
    //                 $q->where('kategori_akun', $kategori)
    //             )
    //             ->whereHas('jurnal_umum', function ($q) use ($jenis_transaksi, $start, $end, $id_unit, $id_divisi) {
    //                 $q->where('jenis_transaksi', $jenis_transaksi)
    //                     ->whereBetween('tanggal', [$start, $end]);
    //                 if ($id_unit) $q->where('id_unit', $id_unit);
    //                 if ($id_divisi) $q->where('id_divisi', $id_divisi);
    //             })->sum('nominal');
    //     };

    //     $pendapatan_terikat = $getTotalManual(true, 'Terikat', $start, $end);
    //     $beban_terikat = $getTotalManual(false, 'Terikat', $start, $end);
    //     $pendapatan_tidak_terikat = $getTotalManual(true, 'Tidak Terikat', $start, $end);
    //     $beban_tidak_terikat = $getTotalManual(false, 'Tidak Terikat', $start, $end);

    //     $saldoAwalPendapatan = Akun::whereHas('sub_kategori_akun.kategori_akun', fn($q) =>
    //         $q->where('kategori_akun', 'PENERIMAAN DAN SUMBANGAN')
    //     )->sum('saldo_awal_kredit');

    //     $saldoAwalBeban = Akun::whereHas('sub_kategori_akun.kategori_akun', fn($q) =>
    //         $q->where('kategori_akun', 'BEBAN')
    //     )->sum('saldo_awal_debit');

    //     $total_raw = $pendapatan_terikat + $pendapatan_tidak_terikat;
    //     $kenaikan_terikat = $pendapatan_terikat - $beban_terikat;
    //     $kenaikan_tidak_terikat = $pendapatan_tidak_terikat - $beban_tidak_terikat;

    //     if ($total_raw > 0) {
    //         $proporsi_terikat = $pendapatan_terikat / $total_raw;
    //         $proporsi_tidak_terikat = $pendapatan_tidak_terikat / $total_raw;

    //         $kenaikan_terikat += $saldoAwalPendapatan * $proporsi_terikat - $saldoAwalBeban * $proporsi_terikat;
    //         $kenaikan_tidak_terikat += $saldoAwalPendapatan * $proporsi_tidak_terikat - $saldoAwalBeban * $proporsi_tidak_terikat;
    //     }

    //     $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = $kenaikan_terikat;
    //     $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = $kenaikan_tidak_terikat;

    //     $data['dengan_pembatasan']['saldo_akhir'] =
    //         $data['dengan_pembatasan']['saldo_awal'] +
    //         $data['dengan_pembatasan']['kenaikan_periode_berjalan'];

    //     $data['tanpa_pembatasan']['saldo_akhir'] =
    //         $data['tanpa_pembatasan']['saldo_awal'] +
    //         $data['tanpa_pembatasan']['kenaikan_periode_berjalan'];

    //     $total_saldo_akhir = $data['dengan_pembatasan']['saldo_akhir'] + $data['tanpa_pembatasan']['saldo_akhir'];

    //     if ($request->has('export_excel')) {
    //         return $this->export_excel($data, $total_saldo_akhir, $start, $end);
    //     }

    //     $units = Unit::all();
    //     $divisis = Divisi::all();

    //     return view('perubahan_aset_neto', compact(
    //         'data',
    //         'total_saldo_akhir',
    //         'start',
    //         'end',
    //         'units',
    //         'divisis',
    //         'id_unit',
    //         'id_divisi'
    //     ));
    // }


    public function index(Request $request)
    {
        $user = Auth::user();

        $start = $request->input('tanggal_mulai') ?? date('Y') . '-01-01';
        $end = $request->input('tanggal_selesai') ?? date('Y-m-d');

        $id_unit = $request->unit;
        $id_divisi = $request->divisi;

        

        // Set default unit/divisi dari role user
        if (!$id_unit && $user->role === 'akuntan_unit') {
            $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
        }

        if (!$id_divisi && $user->role === 'akuntan_divisi') {
            $id_divisi = Akuntan_Divisi::where('id_akuntan_divisi', $user->id_user)->value('id_divisi');
        }

        // Ambil akun ASET NETO DENGAN & TANPA PEMBATASAN
        $akunDengan = Akun::whereHas('sub_kategori_akun.kategori_akun', fn($q) =>
            $q->where('kategori_akun', 'ASET NETO')
        )->whereHas('sub_kategori_akun', fn($q) =>
            $q->where('sub_kategori_akun', 'Dengan Pembatasan')
        )->first();

        $akunTanpa = Akun::whereHas('sub_kategori_akun.kategori_akun', fn($q) =>
            $q->where('kategori_akun', 'ASET NETO')
        )->whereHas('sub_kategori_akun', fn($q) =>
            $q->where('sub_kategori_akun', 'Tanpa Pembatasan')
        )->first();

        // Hitung 
        $data = [
            'dengan_pembatasan' => [
                'saldo_awal' => $akunDengan ? $akunDengan->saldo_awal_kredit - $akunDengan->saldo_awal_debit : 0,
                'kenaikan_periode_lalu' => 0,
                'kenaikan_periode_berjalan' => 0,
                'saldo_akhir' => 0,
            ],
            'tanpa_pembatasan' => [
                'saldo_awal' => $akunTanpa ? $akunTanpa->saldo_awal_kredit - $akunTanpa->saldo_awal_debit : 0,
                'kenaikan_periode_lalu' => 0,
                'kenaikan_periode_berjalan' => 0,
                'saldo_akhir' => 0,
            ],
        ];

        
        // === PANGGIL STORED PROCEDURE UNTUK KENAIKAN BERJALAN ===
        try {
            $hasil = DB::select('CALL hitung_kenaikan_aset_neto(?, ?, ?, ?)', [
                $start,
                $end,
                $id_unit,
                $id_divisi
            ])[0];

            $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = $hasil->terikat ?? 0;
            $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = $hasil->tidak_terikat ?? 0;

        } catch (\Exception $e) {
            \Log::error('Gagal hitung aset neto via procedure: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghitung perubahan aset neto.');
        }

        // Hitung saldo akhir
        $data['dengan_pembatasan']['saldo_akhir'] =
            $data['dengan_pembatasan']['saldo_awal'] +
            $data['dengan_pembatasan']['kenaikan_periode_berjalan'];

        $data['tanpa_pembatasan']['saldo_akhir'] =
            $data['tanpa_pembatasan']['saldo_awal'] +
            $data['tanpa_pembatasan']['kenaikan_periode_berjalan'];

        $total_saldo_akhir = $data['dengan_pembatasan']['saldo_akhir'] + $data['tanpa_pembatasan']['saldo_akhir'];

        // === Export Excel jika diminta ===
        if ($request->has('export_excel')) {
            return $this->export_excel($data, $total_saldo_akhir, $start, $end);
        }

        // Data tambahan ke view
        $units = Unit::all();
        $divisis = Divisi::all();

        return view('perubahan_aset_neto', compact(
            'data',
            'total_saldo_akhir',
            'start',
            'end',
            'units',
            'divisis',
            'id_unit',
            'id_divisi'
        ));
    }


    public function export_excel($data, $total_saldo_akhir, $tanggal_mulai, $tanggal_selesai)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // 📝 Set default font
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(11);

        // 🖼️ Logo
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo');
        $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
        $drawing->setHeight(100);
        $drawing->setCoordinates('A1');
        $drawing->setOffsetX(5);
        $drawing->setWorksheet($sheet);

        // 📌 Judul dengan RichText
        $richText = new RichText();
        $judul = $richText->createTextRun("LAPORAN PERUBAHAN ASET NETO YAYASAN DARUSSALAM BATAM\n");
        $judul->getFont()->setBold(true)->setSize(14);

        $periode = $richText->createTextRun("Periode " .
            Carbon::parse($tanggal_mulai)->translatedFormat('d F Y') .
            " s.d. " .
            Carbon::parse($tanggal_selesai)->translatedFormat('d F Y'));
        $periode->getFont()->setSize(10);

        // 🧾 Atur merge dan alignment
        $sheet->setCellValue('A1', $richText);
        $sheet->mergeCells('A1:B4');
        $sheet->getStyle('A1')->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true);

        // 🧱 Tinggi baris header
        for ($i = 1; $i <= 4; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }

        $row = 5;

        // 🟩 Header bagian 1
        $sheet->setCellValue("A{$row}", 'Aset Neto Dengan Pembatasan Sumber Daya');
        $sheet->mergeCells("A{$row}:B{$row}");
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C6EFCE']],
        ]);
        $row++;

        // 📊 Data bagian 1
        $items = [
            'Saldo Awal' => 'saldo_awal',
            'Kenaikan (Penurunan) Aset Neto Periode Lalu' => 'kenaikan_periode_lalu',
            'Kenaikan (Penurunan) Aset Neto Periode Berjalan' => 'kenaikan_periode_berjalan',
            'Saldo Akhir Aset Neto Dengan Pembatasan' => 'saldo_akhir',
        ];

        foreach ($items as $label => $key) {
            $sheet->setCellValue("A{$row}", $label);
            $sheet->setCellValue("B{$row}", $data['dengan_pembatasan'][$key]);

            if (str_contains(strtolower($label), 'saldo akhir')) {
                $sheet->getStyle("A{$row}:B{$row}")->getFont()->setBold(true);
            }

            $sheet->getStyle("B{$row}")->getNumberFormat()->setFormatCode('#,##0');
            $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;
        }

        // 🟨 Header bagian 2
        $sheet->setCellValue("A{$row}", 'Aset Neto Tanpa Pembatasan Sumber Daya');
        $sheet->mergeCells("A{$row}:B{$row}");
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF2CC']],
        ]);
        $row++;

        // 📊 Data bagian 2
        foreach ($items as $label => $key) {
            $sheet->setCellValue("A{$row}", $label);
            $sheet->setCellValue("B{$row}", $data['tanpa_pembatasan'][$key]);

            if (str_contains(strtolower($label), 'saldo akhir')) {
                $sheet->getStyle("A{$row}:B{$row}")->getFont()->setBold(true);
            }

            $sheet->getStyle("B{$row}")->getNumberFormat()->setFormatCode('#,##0');
            $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;
        }

        // ✅ Total saldo akhir keseluruhan
        $sheet->setCellValue("A{$row}", 'Total Saldo Akhir Aset Neto');
        $sheet->setCellValue("B{$row}", $total_saldo_akhir);
        $sheet->getStyle("A{$row}:B{$row}")->getFont()->setBold(true);
        $sheet->getStyle("B{$row}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // 📏 Kolom
        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setWidth(52.0); // Kurang lebih 369px

        // 📄 Footer info
        $row += 2;
        $sheet->setCellValue("A{$row}", 'Sistem Informasi Akuntansi | ' . date('Y'));
        $sheet->mergeCells("A{$row}:B{$row}");
        $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // 🔲 Border seluruh data
        $lastDataRow = $row - 3;
        $sheet->getStyle("A6:B{$lastDataRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // 🔠 Alignment dan wrap
        $sheet->getStyle("A6:A{$lastDataRow}")->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_LEFT)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true);
        $sheet->getStyle("B6:B{$lastDataRow}")->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_RIGHT)
            ->setVertical(Alignment::VERTICAL_CENTER);

        // 📤 Output
        $fileName = 'Perubahan_Aset_Neto_' . date('d-m-Y', strtotime($tanggal_mulai)) . '_' . date('d-m-Y', strtotime($tanggal_selesai)) . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment;filename=\"{$fileName}\"");
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

}
