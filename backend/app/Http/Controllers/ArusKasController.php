<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Akuntan_Unit;
use App\Models\Divisi;
use App\Models\Jurnal_Umum;
use Illuminate\Http\Request;
use App\Models\Kategori_Akun;
use App\Models\Sub_Kategori_Akun;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Komprehensif_Akhir_Tahun;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class ArusKasController extends Controller
{


    public function index(Request $request)
    {
        $user = Auth::user();

        $id_unit = $request->unit;
        $id_divisi = $request->divisi;
        $start_date = $request->input('start_date') ?? now()->startOfYear()->format('Y-m-d');
        $end_date = $request->input('end_date') ?? now()->format('Y-m-d');

        
        // Jika user akuntan_unit dan tidak memilih unit, pakai unit dari akuntan_unit
        if (!$id_unit && $user->role === 'akuntan_unit') {
            $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
        }

        
        $filters = [
            'id_unit' => $id_unit,
            'id_divisi' => $id_divisi,
            'start_date' => $start_date,
            'end_date' => $end_date,
        ];

        $units = Unit::all();
        $divisis = Divisi::all();
        $tahun = $request->input('tahun', date('Y'));

        //kompre
        $laba_bersih = $this->hitungLabaBersih($tahun, $filters);


        //aktivitas operasional
        $persediaan_perlengkapan_kantor = $this->hitung_persediaan_perlengkapan_kantor($tahun, $filters);
        $persediaan_perlengkapan_asrama = $this->hitung_persediaan_perlengkapan_asrama($tahun, $filters);
        $persediaan_atk = $this->hitung_persediaan_atk($tahun, $filters);
        $persediaan_lainnya = $this->hitung_persediaan_lainnya($tahun, $filters);

        $piutang_rekanan = $this->hitung_piutang_rekanan($tahun, $filters);
        $piutang_kegiatan = $this->hitung_piutang_kegiatan($tahun, $filters);
        $piutang_karyawan = $this->hitung_piutang_karyawan($tahun, $filters);
        $piutang_sumbangan = $this->hitung_piutang_sumbangan($tahun, $filters);
        $piutang_lainnya = $this->hitung_piutang_lainnya($tahun, $filters);

        $sewa_dibayar_dimuka = $this->hitung_sewa_dibayar_dimuka($tahun, $filters);
        $tabungan_pensiun_karyawan = $this->hitung_tabungan_pensiun_karyawan($tahun, $filters);
        $pajak_dibayar_dimuka = $this->hitung_pajak_dibayar_dimuka($tahun, $filters);
        $hutang_jangka_pendek = $this->hitung_hutang_jangka_pendek($tahun, $filters);


        //aktivitas investasi
        $aset_tetap = $this->hitung_aset_tetap($tahun, $filters);


        //aktivitas pendanaan
        $kewajiban_jangka_panjang = $this->hitung_kewajiban_jangka_panjang($tahun, $filters);
        $aset_neto = $this->hitung_aset_neto($tahun, $filters);


        //saldo akun
        $saldo_kas = $this->hitung_saldo_kas($tahun, $filters);




        if ($request->has('export_excel')) {
            return $this->exportExcelArusKas($request, [
                'tahun' => $tahun,
                'filters' => $filters,

                'laba_bersih' => ['tahun_ini' => $laba_bersih],

                'persediaan_perlengkapan_kantor' => $persediaan_perlengkapan_kantor['tahun_ini'],
                'persediaan_perlengkapan_kantor_lalu' => $persediaan_perlengkapan_kantor['tahun_lalu'],

                'persediaan_perlengkapan_asrama' => $persediaan_perlengkapan_asrama['tahun_ini'],
                'persediaan_perlengkapan_asrama_lalu' => $persediaan_perlengkapan_asrama['tahun_lalu'],

                'persediaan_atk' => $persediaan_atk['tahun_ini'],
                'persediaan_atk_lalu' => $persediaan_atk['tahun_lalu'],

                'persediaan_lainnya' => $persediaan_lainnya['tahun_ini'],
                'persediaan_lainnya_lalu' => $persediaan_lainnya['tahun_lalu'],

                'piutang_rekanan' => $piutang_rekanan['tahun_ini'],
                'piutang_rekanan_lalu' => $piutang_rekanan['tahun_lalu'],

                'piutang_kegiatan' => $piutang_kegiatan['tahun_ini'],
                'piutang_kegiatan_lalu' => $piutang_kegiatan['tahun_lalu'],

                'piutang_karyawan' => $piutang_karyawan['tahun_ini'],
                'piutang_karyawan_lalu' => $piutang_karyawan['tahun_lalu'],

                'piutang_sumbangan' => $piutang_sumbangan['tahun_ini'],
                'piutang_sumbangan_lalu' => $piutang_sumbangan['tahun_lalu'],

                'piutang_lainnya' => $piutang_lainnya['tahun_ini'],
                'piutang_lainnya_lalu' => $piutang_lainnya['tahun_lalu'],

                'sewa_dibayar_dimuka' => $sewa_dibayar_dimuka['tahun_ini'],
                'sewa_dibayar_dimuka_lalu' => $sewa_dibayar_dimuka['tahun_lalu'],

                'tabungan_pensiun_karyawan' => $tabungan_pensiun_karyawan['tahun_ini'],
                'tabungan_pensiun_karyawan_lalu' => $tabungan_pensiun_karyawan['tahun_lalu'],

                'pajak_dibayar_dimuka' => $pajak_dibayar_dimuka['tahun_ini'],
                'pajak_dibayar_dimuka_lalu' => $pajak_dibayar_dimuka['tahun_lalu'],

                'hutang_jangka_pendek' => $hutang_jangka_pendek['tahun_ini'],
                'hutang_jangka_pendek_lalu' => $hutang_jangka_pendek['tahun_lalu'],

                'aset_tetap' => $aset_tetap['tahun_ini'],
                'aset_tetap_lalu' => $aset_tetap['tahun_lalu'],

                'kewajiban_jangka_panjang' => $kewajiban_jangka_panjang['tahun_ini'],
                'kewajiban_jangka_panjang_lalu' => $kewajiban_jangka_panjang['tahun_lalu'],

                'aset_neto' => $aset_neto['tahun_ini'],
                'aset_neto_lalu' => $aset_neto['tahun_lalu'],

                'saldo_kas' => $saldo_kas['tahun_ini'],
                'saldo_kas_lalu' => $saldo_kas['tahun_lalu'],
            ]);
        }

        return view('arus-kas', [
            'tahun' => $tahun,
            'units' => $units,
            'divisis' => $divisis,
            'id_unit' => $id_unit,
            'id_divisi' => $id_divisi,
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],


            //kompre
                // 'laba_bersih_tahun_ini' => $laba_bersih['tahun_ini'],
                // 'laba_bersih_tahun_lalu' => $laba_bersih['tahun_lalu'],
                'laba_bersih_tahun_ini' => $laba_bersih ,
                // 'laba_bersih' => $laba_bersih,



            //aktivitas operasional
                'persediaan_perlengkapan_kantor' => $persediaan_perlengkapan_kantor['tahun_ini'],
                'persediaan_perlengkapan_kantor_lalu' => $persediaan_perlengkapan_kantor['tahun_lalu'],

                'persediaan_perlengkapan_asrama' => $persediaan_perlengkapan_asrama['tahun_ini'],
                'persediaan_perlengkapan_asrama_lalu' => $persediaan_perlengkapan_asrama['tahun_lalu'],
                
                'persediaan_atk' => $persediaan_atk['tahun_ini'],
                'persediaan_atk_lalu' => $persediaan_atk['tahun_lalu'],
                
                'persediaan_lainnya' => $persediaan_lainnya['tahun_ini'],
                'persediaan_lainnya_lalu' => $persediaan_lainnya['tahun_lalu'],

                'piutang_rekanan' => $piutang_rekanan['tahun_ini'],
                'piutang_rekanan_lalu' => $piutang_rekanan['tahun_lalu'],

                'piutang_kegiatan' => $piutang_kegiatan['tahun_ini'],
                'piutang_kegiatan_lalu' => $piutang_kegiatan['tahun_lalu'],

                'piutang_karyawan' => $piutang_karyawan['tahun_ini'],
                'piutang_karyawan_lalu' => $piutang_karyawan['tahun_lalu'],

                'piutang_sumbangan' => $piutang_sumbangan['tahun_ini'],
                'piutang_sumbangan_lalu' => $piutang_sumbangan['tahun_lalu'],

                'piutang_lainnya' => $piutang_lainnya['tahun_ini'],
                'piutang_lainnya_lalu' => $piutang_lainnya['tahun_lalu'],

                'sewa_dibayar_dimuka' => $sewa_dibayar_dimuka['tahun_ini'],
                'sewa_dibayar_dimuka_lalu' => $sewa_dibayar_dimuka['tahun_lalu'],

                'tabungan_pensiun_karyawan' => $tabungan_pensiun_karyawan['tahun_ini'],
                'tabungan_pensiun_karyawan_lalu' => $tabungan_pensiun_karyawan['tahun_lalu'],

                'pajak_dibayar_dimuka' => $pajak_dibayar_dimuka['tahun_ini'],
                'pajak_dibayar_dimuka_lalu' => $pajak_dibayar_dimuka['tahun_lalu'],


                'hutang_jangka_pendek' => $hutang_jangka_pendek['tahun_ini'],
                'hutang_jangka_pendek_lalu' => $hutang_jangka_pendek['tahun_lalu'],



            //aktivitas investasi
                'aset_tetap' => $aset_tetap['tahun_ini'],
                'aset_tetap_lalu' => $aset_tetap['tahun_lalu'],




            //aktivitas pendanaan
                'kewajiban_jangka_panjang' => $kewajiban_jangka_panjang['tahun_ini'],
                'kewajiban_jangka_panjang_lalu' => $kewajiban_jangka_panjang['tahun_lalu'],


                'aset_neto' => $aset_neto['tahun_ini'],
                'aset_neto_lalu' => $aset_neto['tahun_lalu'],


            //saldo kas
                'saldo_kas' => $saldo_kas['tahun_ini'],
                'saldo_kas_lalu' => $saldo_kas['tahun_lalu'],


        ]);
    }


    private function exportExcelArusKas($request, $data)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set default font
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(11);

        // Logo
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo');
        $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
        $drawing->setHeight(100);
        $drawing->setCoordinates('A1');
        $drawing->setOffsetX(5);
        // $drawing->setOffsetY(10);
        $drawing->setWorksheet($sheet);

        // Judul - rich text
        $richText = new RichText();
        $judulText = $richText->createTextRun("LAPORAN ARUS KAS YAYASAN DARUSSALAM BATAM\n");
        $judulText->getFont()->setBold(true)->setSize(14);
        $periodeText = $richText->createTextRun("Periode " . Carbon::parse($data['filters']['start_date'])->translatedFormat('d F Y') . " s.d. " . Carbon::parse($data['filters']['end_date'])->translatedFormat('d F Y'));
        $periodeText->getFont()->setSize(10);

        // Merge dan set judul
        $sheet->setCellValue('A1', $richText);
        $sheet->mergeCells('A1:C4');
        $sheet->getStyle('A1')->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true);

        // Set tinggi baris untuk header
        for ($i = 1; $i <= 4; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }

        // Header tabel
        $row = 5;
        $sheet->setCellValue("A{$row}", 'No');
        $sheet->setCellValue("B{$row}", 'Komponen Laporan Arus Kas');
        // $sheet->setCellValue("C{$row}", 'Tahun ' . $data['tahun']);
        $sheet->setCellValue("C{$row}", 'Jumlah ');
        $sheet->getStyle("A{$row}:C{$row}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '000000']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        $row++;

        // Format Rupiah helper
        $formatRupiah = function ($value) {
            if ($value == 0) return '-';
            return ($value > 0 ? '' : '(') . number_format(abs($value), 0, ',', '.') . ($value > 0 ? '' : ')');
        };

        // A. Aktivitas Operasional
        $sheet->fromArray(['1', 'Aktivitas Operasional', ''], null, "A{$row}");
        $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
        $row++;

        $sheet->fromArray(['', 'Kenaikan/Penurunan Aset Bersih', $formatRupiah($data['laba_bersih']['tahun_ini'])], null, "A{$row}");
        $row++;

        $items_operasional = [
            'Persediaan Perlengkapan Kantor' => [$data['persediaan_perlengkapan_kantor_lalu'], $data['persediaan_perlengkapan_kantor']],
            'Persediaan Perlengkapan Asrama' => [$data['persediaan_perlengkapan_asrama_lalu'], $data['persediaan_perlengkapan_asrama']],
            'Persediaan ATK' => [$data['persediaan_atk_lalu'], $data['persediaan_atk']],
            'Persediaan Lainnya' => [$data['persediaan_lainnya_lalu'], $data['persediaan_lainnya']],
            'Piutang Rekanan' => [$data['piutang_rekanan_lalu'], $data['piutang_rekanan']],
            'Piutang Kegiatan' => [$data['piutang_kegiatan_lalu'], $data['piutang_kegiatan']],
            'Piutang Karyawan' => [$data['piutang_karyawan_lalu'], $data['piutang_karyawan']],
            'Piutang Sumbangan' => [$data['piutang_sumbangan_lalu'], $data['piutang_sumbangan']],
            'Piutang Lainnya' => [$data['piutang_lainnya_lalu'], $data['piutang_lainnya']],
            'Sewa Dibayar Dimuka' => [$data['sewa_dibayar_dimuka_lalu'], $data['sewa_dibayar_dimuka']],
            'Tabungan Pensiun Karyawan' => [$data['tabungan_pensiun_karyawan_lalu'], $data['tabungan_pensiun_karyawan']],
            'Pajak Dibayar Dimuka' => [$data['pajak_dibayar_dimuka_lalu'], $data['pajak_dibayar_dimuka']],
            'Hutang Jangka Pendek' => [$data['hutang_jangka_pendek_lalu'], $data['hutang_jangka_pendek']],
        ];

        $total_operasional = $data['laba_bersih']['tahun_ini'];
        foreach ($items_operasional as $label => [$lalu, $sekarang]) {
            $selisih = $lalu - $sekarang;
            $total_operasional += $selisih;
            $sheet->fromArray(['', $label, $formatRupiah($selisih)], null, "A{$row}");
            $row++;
        }

        $sheet->fromArray(['', 'Kas Bersih dari Aktivitas Operasional', $formatRupiah($total_operasional)], null, "A{$row}");
        $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
        $row++;

        // B. Aktivitas Investasi
        $sheet->fromArray(['2', 'Aktivitas Investasi', ''], null, "A{$row}");
        $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
        $row++;

        $selisih_aset_tetap = $data['aset_tetap_lalu'] - $data['aset_tetap'];
        $sheet->fromArray(['', 'Penambahan/Pengurangan Aset Tetap', $formatRupiah($selisih_aset_tetap)], null, "A{$row}");
        $row++;

        $sheet->fromArray(['', 'Kas Bersih dari Aktivitas Investasi', $formatRupiah($selisih_aset_tetap)], null, "A{$row}");
        $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
        $row++;

        // C. Aktivitas Pendanaan
        $sheet->fromArray(['3', 'Aktivitas Pendanaan', ''], null, "A{$row}");
        $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
        $row++;

        $selisih_kewajiban = $data['kewajiban_jangka_panjang_lalu'] - $data['kewajiban_jangka_panjang'];
        $selisih_aset_neto = $data['aset_neto_lalu'] - $data['aset_neto'];
        $total_pendanaan = $selisih_kewajiban + $selisih_aset_neto;

        $sheet->fromArray(['', 'Kewajiban Jangka Panjang', $formatRupiah($selisih_kewajiban)], null, "A{$row}"); $row++;
        $sheet->fromArray(['', 'Aset Neto', $formatRupiah($selisih_aset_neto)], null, "A{$row}"); $row++;
        $sheet->fromArray(['', 'Kas Bersih dari Aktivitas Pendanaan', $formatRupiah($total_pendanaan)], null, "A{$row}");
        $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
        $row++;

        // Ringkasan akhir
        $kenaikan_kas = $total_operasional + $selisih_aset_tetap + $total_pendanaan;
        $sheet->fromArray(['', 'Kenaikan (Penurunan) Kas', $formatRupiah($kenaikan_kas)], null, "A{$row}"); $row++;
        $sheet->fromArray(['', 'Saldo Kas Awal', $formatRupiah($data['saldo_kas_lalu'])], null, "A{$row}"); $row++;
        $sheet->fromArray(['', 'Saldo Kas Akhir', $formatRupiah($data['saldo_kas'])], null, "A{$row}");
        $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);

        // Border
        $sheet->getStyle("A6:C{$row}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // Styling tambahan
        $sheet->getStyle("C6:C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("B6:B{$row}")->getAlignment()->setWrapText(true);
        $sheet->getStyle("A6:A{$row}")->getAlignment()
            ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER)
            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

        // Lebar kolom
        $sheet->getColumnDimension('A')->setWidth(5);
        $sheet->getColumnDimension('B')->setWidth(55);
        $sheet->getColumnDimension('C')->setWidth(38.57);

        // Output
        $fileName = 'Laporan_Arus_Kas_' . $data['tahun'] . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment;filename=\"{$fileName}\"");
        header('Cache-Control: max-age=0');
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }






    //operasional
    
    private function hitungLabaBersih($tahun, $filters)
    {
        $akunPendapatan = Akun::whereHas('sub_kategori_akun.kategori_akun', function ($query) {
            $query->where('kategori_akun', 'PENERIMAAN DAN SUMBANGAN');
        })->pluck('id_akun');

        $akunBeban = Akun::whereHas('sub_kategori_akun.kategori_akun', function ($query) {
            $query->where('kategori_akun', 'BEBAN');
        })->pluck('id_akun');

        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        $jurnalQuery = Detail_Jurnal_Umum::whereHas('jurnal_umum', function ($q) use ($tahun, $filters) {
            $q->whereYear('tanggal', $tahun);

            if (!empty($filters['id_unit'])) {
                $q->where('id_unit', $filters['id_unit']);
            }

            if (!empty($filters['id_divisi'])) {
                $q->where('id_divisi', $filters['id_divisi']);
            }

            if (!empty($filters['start_date'])) {
                $q->whereDate('tanggal', '>=', $filters['start_date']);
            }

            if (!empty($filters['end_date'])) {
                $q->whereDate('tanggal', '<=', $filters['end_date']);
            }
        })
        ->whereIn('id_jurnal_umum', $postedJurnal);

        $pendapatan = (clone $jurnalQuery)
            ->whereIn('id_akun', $akunPendapatan)
            ->where('debit_kredit', 'kredit')
            ->sum('nominal');

        $beban = (clone $jurnalQuery)
            ->whereIn('id_akun', $akunBeban)
            ->where('debit_kredit', 'debit')
            ->sum('nominal');

        $laba_bersih_tahun_ini = $pendapatan - $beban;

        return $laba_bersih_tahun_ini;
    }




    
    private function hitung_persediaan_perlengkapan_kantor($tahun, $filters)
    {
        // Ambil akun Persediaan Perlengkapan Kantor
        $akun = Akun::where('akun', 'Persediaan Perlengkapan Kantor')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }

    private function hitung_persediaan_perlengkapan_asrama($tahun, $filters)
    {
        // Ambil akun Persediaan Perlengkapan asrama
        $akun = Akun::where('akun', 'Persediaan Perlengkapan Asrama')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }

    private function hitung_persediaan_atk($tahun, $filters)
    {
        // Ambil akun Persediaan atk
        $akun = Akun::where('akun', 'Persediaan ATK')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }

    private function hitung_persediaan_lainnya($tahun, $filters)
    {
        // Ambil akun Persediaan lainnya
        $akun = Akun::where('akun', 'Persediaan Lainnya')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }

    private function hitung_piutang_rekanan($tahun, $filters)
    {
        // Ambil akun Piutang Rekanan
        $akun = Akun::where('akun', 'Piutang Rekanan')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }


    //
    private function hitung_piutang_kegiatan($tahun, $filters)
    {
        // Ambil akun Piutang Kegiatan
        $akun = Akun::where('akun', 'Piutang Kegiatan')->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal diambil dari master akun
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil hanya jurnal yang sudah diposting ke buku besar
        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        // Query dasar detail jurnal umum (hanya dari jurnal yang diposting)
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        // Filter unit jika ada
        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Filter divisi jika perlu
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }

        // Filter rentang tanggal jika ada
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        // Total debit
        $total_debet = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'debit')
            ->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'kredit')
            ->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini = saldo awal + mutasi (debet - kredit)
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini'  => $saldo_tahun_ini,
        ];
    }


    private function hitung_piutang_karyawan($tahun, $filters)
    {
        // Ambil akun Piutang karyawan
        $akun = Akun::where('akun', 'Piutang Karyawan')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }



    private function hitung_piutang_sumbangan($tahun, $filters)
    {
        // Ambil akun Piutang sumbangan
        $akun = Akun::where('akun', 'Piutang Sumbangan')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }


    private function hitung_piutang_lainnya($tahun, $filters)
    {
        // Ambil akun Piutang lainnya
        $akun = Akun::where('akun', 'Piutang Lainnya')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }


    private function hitung_sewa_dibayar_dimuka($tahun, $filters)
    {
        // Ambil akun Sewa Dibayar Dimuka
        $akun = Akun::where('akun', 'Sewa Dibayar Dimuka')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }


    private function hitung_tabungan_pensiun_karyawan($tahun, $filters)
    {
        // Ambil akun Tabungan Pensiun Karyawan
        $akun = Akun::where('akun', 'Tabungan Pensiun Karyawan')
            ->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal tahun lalu
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil semua transaksi jurnal umum tahun ini untuk akun tsb
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Total debit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }

    //
    private function hitung_pajak_dibayar_dimuka($tahun, $filters)
    {
        // Ambil akun Pajak Dibayar Dimuka
        $akun = Akun::where('akun', 'Pajak Dibayar Dimuka')->first();

        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;

        // Saldo awal di master akun
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        // Ambil daftar jurnal yang sudah diposting ke buku besar
        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        // Query detail jurnal umum hanya untuk jurnal yang sudah diposting
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        // Filter unit jika tersedia
        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Filter divisi jika ada
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }

        // Filter tanggal mulai jika ada
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }

        // Filter tanggal akhir jika ada
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        // Total debit
        $total_debet = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'debit')
            ->sum('detail_jurnal_umum.nominal');

        // Total kredit
        $total_kredit = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'kredit')
            ->sum('detail_jurnal_umum.nominal');

        // Hitung saldo akhir tahun ini
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }


    //
    private function hitung_hutang_jangka_pendek($tahun, $filters)
    {
        // Ambil semua akun dengan sub kategori "Kewajiban Jangka Pendek"
        $akunList = Akun::whereHas('sub_kategori_akun', function ($query) {
            $query->where('sub_kategori_akun', 'Kewajiban Jangka Pendek');
        })->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');

        // Total saldo awal dari master akun
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        // Ambil jurnal yang sudah diposting ke buku besar
        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        // Query dasar mutasi tahun ini hanya untuk jurnal yang sudah diposting
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        // Filter unit (jika ada)
        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Filter divisi (jika ada)
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }

        // Filter tanggal mulai (jika ada)
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }

        // Filter tanggal akhir (jika ada)
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        // Hitung total debit dan kredit
        $total_debet = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'debit')
            ->sum('detail_jurnal_umum.nominal');

        $total_kredit = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'kredit')
            ->sum('detail_jurnal_umum.nominal');

        // Saldo akhir = saldo awal + (debet - kredit)
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }





    //investasi
    private function hitung_aset_tetap($tahun, $filters) 
    {

        // Ambil semua akun dengan sub kategori "Kewajiban Jangka Pendek"
        $akunList = Akun::whereHas('sub_kategori_akun', function ($query) {
            $query->where('sub_kategori_akun', 'Aktiva Tetap');
        })
        ->where('akun', 'not like', 'Akumulasi Penyusutan%')
        ->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');

        // Total saldo awal = sum(debit - kredit) dari semua akun
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        // Query dasar untuk ambil mutasi tahun ini
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        // Filter berdasarkan unit (jika ada)
        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Filter berdasarkan divisi (jika ada)
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }

        // Filter tanggal mulai (jika ada)
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }

        // Filter tanggal akhir (jika ada)
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        // Hitung total debit dan kredit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir = saldo awal + (debit - kredit)
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }




    //Pendanaan
    //
    private function hitung_kewajiban_jangka_panjang($tahun, $filters)
    {
        // Ambil semua akun dengan sub kategori "Kewajiban Jangka Panjang"
        $akunList = Akun::whereHas('sub_kategori_akun', function ($query) {
            $query->where('sub_kategori_akun', 'Kewajiban Jangka Panjang');
        })->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');

        // Saldo awal dari master akun
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        // Ambil hanya jurnal yang sudah diposting ke buku besar
        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        // Query mutasi tahun ini hanya dari jurnal yang sudah diposting
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        // Filter unit (jika ada)
        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Filter divisi (jika ada)
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }

        // Filter tanggal mulai (jika ada)
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }

        // Filter tanggal akhir (jika ada)
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        // Hitung total debit
        $total_debet = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'debit')
            ->sum('detail_jurnal_umum.nominal');

        // Hitung total kredit
        $total_kredit = (clone $query)
            ->where('detail_jurnal_umum.debit_kredit', 'kredit')
            ->sum('detail_jurnal_umum.nominal');

        // Saldo akhir = saldo awal + (debit - kredit)
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }


    private function hitung_aset_neto($tahun, $filters) 
    {

        $akunList = Akun::whereHas('sub_kategori_akun.kategori_akun', function ($query) {
            $query->where('kategori_akun', 'ASET NETO');
        })->get();


        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');

        // Total saldo awal = sum(debit - kredit) dari semua akun
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        // Query dasar untuk ambil mutasi tahun ini
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        // Filter berdasarkan unit (jika ada)
        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Filter berdasarkan divisi (jika ada)
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }

        // Filter tanggal mulai (jika ada)
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }

        // Filter tanggal akhir (jika ada)
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        // Hitung total debit dan kredit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir = saldo awal + (debit - kredit)
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }



    //saldo kas
    private function hitung_saldo_kas($tahun, $filters) 
    {

        $akunList = Akun::whereHas('sub_kategori_akun', function ($query) {
            $query->whereIn('sub_kategori_akun', ['KAS', 'BANK']);
        })->get();




        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');

        // Total saldo awal = sum(debit - kredit) dari semua akun
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        // Query dasar untuk ambil mutasi tahun ini
        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        // Filter berdasarkan unit (jika ada)
        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        // Filter berdasarkan divisi (jika ada)
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }

        // Filter tanggal mulai (jika ada)
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }

        // Filter tanggal akhir (jika ada)
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        // Hitung total debit dan kredit
        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');

        // Saldo akhir = saldo awal + (debit - kredit)
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return [
            'tahun_lalu' => $saldo_awal,
            'tahun_ini' => $saldo_tahun_ini,
        ];
    }
















































}
