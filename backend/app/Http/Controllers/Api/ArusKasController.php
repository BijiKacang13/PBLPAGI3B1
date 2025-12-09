<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Akuntan_Unit;
use App\Models\Jurnal_Umum;
use Illuminate\Http\Request;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class ArusKasController extends Controller
{
    /**
     * Get Arus Kas data
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            $id_unit = $request->unit;
            $id_divisi = $request->divisi;
            $start_date = $request->input('start_date') ?? now()->startOfYear()->format('Y-m-d');
            $end_date = $request->input('end_date') ?? now()->format('Y-m-d');
            $tahun = $request->input('tahun', date('Y'));

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

            // Hitung laba bersih
            $laba_bersih = $this->hitungLabaBersih($tahun, $filters);

            // Aktivitas operasional
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

            // Aktivitas investasi
            $aset_tetap = $this->hitung_aset_tetap($tahun, $filters);

            // Aktivitas pendanaan
            $kewajiban_jangka_panjang = $this->hitung_kewajiban_jangka_panjang($tahun, $filters);
            $aset_neto = $this->hitung_aset_neto($tahun, $filters);

            // Saldo kas
            $saldo_kas = $this->hitung_saldo_kas($tahun, $filters);

            // Format aktivitas operasional
            $items_operasional = [
                'persediaan_perlengkapan_kantor' => $persediaan_perlengkapan_kantor,
                'persediaan_perlengkapan_asrama' => $persediaan_perlengkapan_asrama,
                'persediaan_atk' => $persediaan_atk,
                'persediaan_lainnya' => $persediaan_lainnya,
                'piutang_rekanan' => $piutang_rekanan,
                'piutang_kegiatan' => $piutang_kegiatan,
                'piutang_karyawan' => $piutang_karyawan,
                'piutang_sumbangan' => $piutang_sumbangan,
                'piutang_lainnya' => $piutang_lainnya,
                'sewa_dibayar_dimuka' => $sewa_dibayar_dimuka,
                'tabungan_pensiun_karyawan' => $tabungan_pensiun_karyawan,
                'pajak_dibayar_dimuka' => $pajak_dibayar_dimuka,
                'hutang_jangka_pendek' => $hutang_jangka_pendek,
            ];

            // Hitung total aktivitas operasional
            $total_operasional = $laba_bersih;
            foreach ($items_operasional as $item) {
                $selisih = $item['tahun_lalu'] - $item['tahun_ini'];
                $total_operasional += $selisih;
            }

            // Hitung aktivitas investasi
            $selisih_aset_tetap = $aset_tetap['tahun_lalu'] - $aset_tetap['tahun_ini'];

            // Hitung aktivitas pendanaan
            $selisih_kewajiban = $kewajiban_jangka_panjang['tahun_lalu'] - $kewajiban_jangka_panjang['tahun_ini'];
            $selisih_aset_neto = $aset_neto['tahun_lalu'] - $aset_neto['tahun_ini'];
            $total_pendanaan = $selisih_kewajiban + $selisih_aset_neto;

            // Hitung ringkasan
            $kenaikan_kas = $total_operasional + $selisih_aset_tetap + $total_pendanaan;

            // Format response sesuai interface frontend
            $data = [
                'periode' => [
                    'start_date' => $start_date,
                    'end_date' => $end_date,
                ],
                'laba_bersih' => $laba_bersih,
                'aktivitas_operasional' => [
                    'items' => array_map(function ($item) {
                        return [
                            'tahun_lalu' => $item['tahun_lalu'],
                            'tahun_ini' => $item['tahun_ini'],
                        ];
                    }, $items_operasional),
                    'total' => $total_operasional,
                ],
                'aktivitas_investasi' => [
                    'selisih' => $selisih_aset_tetap,
                    'total' => $selisih_aset_tetap,
                ],
                'aktivitas_pendanaan' => [
                    'selisih_kewajiban' => $selisih_kewajiban,
                    'selisih_aset_neto' => $selisih_aset_neto,
                    'total' => $total_pendanaan,
                ],
                'ringkasan' => [
                    'kenaikan_kas' => $kenaikan_kas,
                    'saldo_kas_awal' => $saldo_kas['tahun_lalu'],
                    'saldo_kas_akhir' => $saldo_kas['tahun_ini'],
                ],
            ];

            return response()->json([
                'success' => true,
                'message' => 'Data arus kas berhasil diambil',
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown options (units and divisions)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOptions()
    {
        try {
            $units = Unit::select('id_unit', 'unit as nama_unit')->get();
            $divisis = Divisi::select('id_divisi', 'divisi as nama_divisi')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'units' => $units,
                    'divisis' => $divisis
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data options',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export to Excel
     * 
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function exportExcel(Request $request)
    {
        try {
            // Ambil data yang sama dengan index
            $indexResponse = $this->index($request);
            $indexData = json_decode($indexResponse->getContent(), true);

            if (!$indexData['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil data untuk export'
                ], 500);
            }

            $data = $indexData['data'];
            $start = $data['periode']['start_date'];
            $end = $data['periode']['end_date'];
            $tahun = date('Y', strtotime($start));

            // Generate Excel
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
            $drawing->setWorksheet($sheet);

            // Judul - rich text
            $richText = new RichText();
            $judulText = $richText->createTextRun("LAPORAN ARUS KAS YAYASAN DARUSSALAM BATAM\n");
            $judulText->getFont()->setBold(true)->setSize(14);
            $periodeText = $richText->createTextRun("Periode " . Carbon::parse($start)->translatedFormat('d F Y') . " s.d. " . Carbon::parse($end)->translatedFormat('d F Y'));
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

            $sheet->fromArray(['', 'Kenaikan/Penurunan Aset Bersih', $formatRupiah($data['laba_bersih'])], null, "A{$row}");
            $row++;

            $items_operasional_labels = [
                'persediaan_perlengkapan_kantor' => 'Persediaan Perlengkapan Kantor',
                'persediaan_perlengkapan_asrama' => 'Persediaan Perlengkapan Asrama',
                'persediaan_atk' => 'Persediaan ATK',
                'persediaan_lainnya' => 'Persediaan Lainnya',
                'piutang_rekanan' => 'Piutang Rekanan',
                'piutang_kegiatan' => 'Piutang Kegiatan',
                'piutang_karyawan' => 'Piutang Karyawan',
                'piutang_sumbangan' => 'Piutang Sumbangan',
                'piutang_lainnya' => 'Piutang Lainnya',
                'sewa_dibayar_dimuka' => 'Sewa Dibayar Dimuka',
                'tabungan_pensiun_karyawan' => 'Tabungan Pensiun Karyawan',
                'pajak_dibayar_dimuka' => 'Pajak Dibayar Dimuka',
                'hutang_jangka_pendek' => 'Hutang Jangka Pendek',
            ];

            foreach ($items_operasional_labels as $key => $label) {
                $item = $data['aktivitas_operasional']['items'][$key];
                $selisih = $item['tahun_lalu'] - $item['tahun_ini'];
                $sheet->fromArray(['', $label, $formatRupiah($selisih)], null, "A{$row}");
                $row++;
            }

            $sheet->fromArray(['', 'Kas Bersih dari Aktivitas Operasional', $formatRupiah($data['aktivitas_operasional']['total'])], null, "A{$row}");
            $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
            $row++;

            // B. Aktivitas Investasi
            $sheet->fromArray(['2', 'Aktivitas Investasi', ''], null, "A{$row}");
            $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
            $row++;

            $sheet->fromArray(['', 'Penambahan/Pengurangan Aset Tetap', $formatRupiah($data['aktivitas_investasi']['selisih'])], null, "A{$row}");
            $row++;

            $sheet->fromArray(['', 'Kas Bersih dari Aktivitas Investasi', $formatRupiah($data['aktivitas_investasi']['total'])], null, "A{$row}");
            $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
            $row++;

            // C. Aktivitas Pendanaan
            $sheet->fromArray(['3', 'Aktivitas Pendanaan', ''], null, "A{$row}");
            $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
            $row++;

            $sheet->fromArray(['', 'Kewajiban Jangka Panjang', $formatRupiah($data['aktivitas_pendanaan']['selisih_kewajiban'])], null, "A{$row}");
            $row++;
            $sheet->fromArray(['', 'Aset Neto', $formatRupiah($data['aktivitas_pendanaan']['selisih_aset_neto'])], null, "A{$row}");
            $row++;
            $sheet->fromArray(['', 'Kas Bersih dari Aktivitas Pendanaan', $formatRupiah($data['aktivitas_pendanaan']['total'])], null, "A{$row}");
            $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
            $row++;

            // Ringkasan akhir
            $sheet->fromArray(['', 'Kenaikan (Penurunan) Kas', $formatRupiah($data['ringkasan']['kenaikan_kas'])], null, "A{$row}");
            $row++;
            $sheet->fromArray(['', 'Saldo Kas Awal', $formatRupiah($data['ringkasan']['saldo_kas_awal'])], null, "A{$row}");
            $row++;
            $sheet->fromArray(['', 'Saldo Kas Akhir', $formatRupiah($data['ringkasan']['saldo_kas_akhir'])], null, "A{$row}");
            $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);

            // Border
            $sheet->getStyle("A6:C{$row}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

            // Styling tambahan
            $sheet->getStyle("C6:C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("B6:B{$row}")->getAlignment()->setWrapText(true);
            $sheet->getStyle("A6:A{$row}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                ->setVertical(Alignment::VERTICAL_CENTER);

            // Lebar kolom
            $sheet->getColumnDimension('A')->setWidth(5);
            $sheet->getColumnDimension('B')->setWidth(55);
            $sheet->getColumnDimension('C')->setWidth(38.57);

            // Output
            $fileName = 'Laporan_Arus_Kas_' . $tahun . '.xlsx';
            
            $writer = new Xlsx($spreadsheet);
            
            return response()->streamDownload(function() use ($writer) {
                $writer->save('php://output');
            }, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Cache-Control' => 'max-age=0'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ========== PRIVATE METHODS (Copy from original ArusKasController) ==========

    private function hitungLabaBersih($tahun, $filters)
    {
        $akunPendapatan = Akun::whereHas('subKategori.kategori_akun', function ($query) {
            $query->where('kategori_akun', 'PENERIMAAN DAN SUMBANGAN');
        })->pluck('id_akun');

        $akunBeban = Akun::whereHas('subKategori.kategori_akun', function ($query) {
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

        return $pendapatan - $beban;
    }

    private function hitung_persediaan_perlengkapan_kantor($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Persediaan Perlengkapan Kantor')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_persediaan_perlengkapan_asrama($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Persediaan Perlengkapan Asrama')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_persediaan_atk($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Persediaan ATK')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_persediaan_lainnya($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Persediaan Lainnya')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_piutang_rekanan($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Piutang Rekanan')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_piutang_kegiatan($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Piutang Kegiatan')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_piutang_karyawan($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Piutang Karyawan')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_piutang_sumbangan($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Piutang Sumbangan')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_piutang_lainnya($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Piutang Lainnya')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_sewa_dibayar_dimuka($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Sewa Dibayar Dimuka')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_tabungan_pensiun_karyawan($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Tabungan Pensiun Karyawan')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_pajak_dibayar_dimuka($tahun, $filters)
    {
        $akun = Akun::where('akun', 'Pajak Dibayar Dimuka')->first();
        if (!$akun) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun = $akun->id_akun;
        $saldo_awal = $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->where('detail_jurnal_umum.id_akun', $id_akun)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_hutang_jangka_pendek($tahun, $filters)
    {
        $akunList = Akun::whereHas('subKategori', function ($query) {
            $query->where('sub_kategori_akun', 'Kewajiban Jangka Pendek');
        })->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_aset_tetap($tahun, $filters)
    {
        $akunList = Akun::whereHas('subKategori', function ($query) {
            $query->where('sub_kategori_akun', 'Aktiva Tetap');
        })
        ->where('akun', 'not like', 'Akumulasi Penyusutan%')
        ->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_kewajiban_jangka_panjang($tahun, $filters)
    {
        $akunList = Akun::whereHas('subKategori', function ($query) {
            $query->where('sub_kategori_akun', 'Kewajiban Jangka Panjang');
        })->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        $postedJurnal = DB::table('buku_besar')->pluck('id_jurnal_umum');

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun)
            ->whereIn('jurnal_umum.id_jurnal_umum', $postedJurnal);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_aset_neto($tahun, $filters)
    {
        $akunList = Akun::whereHas('subKategori.kategori_akun', function ($query) {
            $query->where('kategori_akun', 'ASET NETO');
        })->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }

    private function hitung_saldo_kas($tahun, $filters)
    {
        $akunList = Akun::whereHas('subKategori', function ($query) {
            $query->whereIn('sub_kategori_akun', ['KAS', 'BANK']);
        })->get();

        if ($akunList->isEmpty()) {
            return ['tahun_ini' => 0, 'tahun_lalu' => 0];
        }

        $id_akun_list = $akunList->pluck('id_akun');
        $saldo_awal = $akunList->sum(function ($akun) {
            return $akun->saldo_awal_debit - $akun->saldo_awal_kredit;
        });

        $query = DB::table('detail_jurnal_umum')
            ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
            ->whereIn('detail_jurnal_umum.id_akun', $id_akun_list)
            ->whereYear('jurnal_umum.tanggal', $tahun);

        if (!empty($filters['id_unit'])) {
            $query->where('jurnal_umum.id_unit', $filters['id_unit']);
        }
        if (!empty($filters['id_divisi'])) {
            $query->where('jurnal_umum.id_divisi', $filters['id_divisi']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('jurnal_umum.tanggal', '<=', $filters['end_date']);
        }

        $total_debet = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'debit')->sum('detail_jurnal_umum.nominal');
        $total_kredit = (clone $query)->where('detail_jurnal_umum.debit_kredit', 'kredit')->sum('detail_jurnal_umum.nominal');
        $saldo_tahun_ini = $saldo_awal + ($total_debet - $total_kredit);

        return ['tahun_lalu' => $saldo_awal, 'tahun_ini' => $saldo_tahun_ini];
    }
}

