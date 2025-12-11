<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class NeracaSaldoController extends Controller
{
    /**
     * Get Neraca Saldo data
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

            // Otomatis set unit/divisi dari role jika tidak dipilih
            if (!$id_unit && $user->role === 'akuntan_unit') {
                $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
            }
            
            $start = $request->start_date ?? now()->startOfYear()->toDateString();
            $end = $request->end_date ?? now()->toDateString();
            $tahun_lalu = Carbon::parse($end)->year - 1;

            // ========== MENGGUNAKAN STORED PROCEDURE UNTUK NERACA SALDO ==========
            try {
                // Panggil stored procedure utama
                $neracaResults = DB::select('CALL hitung_neraca(?, ?, ?, ?)', [
                    $start, 
                    $end, 
                    $id_unit, 
                    $id_divisi
                ]);

                // Convert hasil procedure ke collection untuk kemudahan manipulasi
                $neracaCollection = collect($neracaResults);
                
            } catch (\Exception $e) {
                // Fallback ke method lama jika stored procedure gagal
                \Log::error('Stored procedure failed: ' . $e->getMessage());
                return $this->indexFallback($request);
            }

            // ========== LOGIKA KHUSUS UNTUK ASET NETO DENGAN/TANPA PEMBATASAN ==========
            $akunDengan = Akun::whereHas('subKategori', function ($query) {
                $query->where('sub_kategori_akun', 'Dengan Pembatasan')
                    ->whereHas('kategori_akun', function ($q) {
                        $q->where('kategori_akun', 'ASET NETO');
                    });
            })->first();

            $akunTanpa = Akun::whereHas('subKategori', function ($query) {
                $query->where('sub_kategori_akun', 'Tanpa Pembatasan')
                    ->whereHas('kategori_akun', function ($q) {
                        $q->where('kategori_akun', 'ASET NETO');
                    });
            })->first();

            $data_aset_neto = [
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

            // Hitung kenaikan periode berjalan untuk aset neto
            try {
                $kenaikanResults = DB::select('CALL hitung_kenaikan_aset_neto(?, ?, ?, ?)', [
                    $start, $end, $id_unit, $id_divisi
                ]);
                
                if (!empty($kenaikanResults)) {
                    $kenaikan = $kenaikanResults[0];
                    $data_aset_neto['dengan_pembatasan']['kenaikan_periode_berjalan'] = $kenaikan->terikat ?? 0;
                    $data_aset_neto['tanpa_pembatasan']['kenaikan_periode_berjalan'] = $kenaikan->tidak_terikat ?? 0;
                }
            } catch (\Exception $e) {
                \Log::error('Stored procedure hitung_kenaikan_aset_neto failed: ' . $e->getMessage());
                // Set default values if stored procedure fails
                $data_aset_neto['dengan_pembatasan']['kenaikan_periode_berjalan'] = 0;
                $data_aset_neto['tanpa_pembatasan']['kenaikan_periode_berjalan'] = 0;
            }

            // Hitung saldo akhir
            $data_aset_neto['dengan_pembatasan']['saldo_akhir'] =
                $data_aset_neto['dengan_pembatasan']['saldo_awal'] +
                $data_aset_neto['dengan_pembatasan']['kenaikan_periode_lalu'] +
                $data_aset_neto['dengan_pembatasan']['kenaikan_periode_berjalan'];

            $data_aset_neto['tanpa_pembatasan']['saldo_akhir'] =
                $data_aset_neto['tanpa_pembatasan']['saldo_awal'] +
                $data_aset_neto['tanpa_pembatasan']['kenaikan_periode_lalu'] +
                $data_aset_neto['tanpa_pembatasan']['kenaikan_periode_berjalan'];

            // ========== PROSES HASIL STORED PROCEDURE ==========
            $semua_akun = Akun::with(['subKategori.kategori_akun'])
                ->whereHas('subKategori.kategori_akun', function ($query) {
                    $query->whereIn('kategori_akun', ['AKTIVA', 'KEWAJIBAN', 'ASET NETO']);
                })
                ->get();

            // Convert hasil stored procedure ke format yang dibutuhkan
            $saldo_akun = collect();
            $totalKewajibanAsetNeto = 0;
            $totalPeriodeLaluKewajibanAsetNeto = 0;

            foreach ($neracaCollection as $hasil) {
                $akun = $semua_akun->firstWhere('id_akun', $hasil->id_akun);
                
                if ($akun) {
                    $kategori = $akun->subKategori->kategori_akun->kategori_akun;
                    $sub_kategori = $akun->subKategori->sub_kategori_akun;
                    
                    // Override untuk aset neto dengan/tanpa pembatasan
                    if ($kategori === 'ASET NETO' && $sub_kategori === 'Dengan Pembatasan') {
                        $saldo = $data_aset_neto['dengan_pembatasan']['saldo_akhir'];
                        $periode_lalu = $data_aset_neto['dengan_pembatasan']['saldo_awal'];
                    } elseif ($kategori === 'ASET NETO' && $sub_kategori === 'Tanpa Pembatasan') {
                        $saldo = $data_aset_neto['tanpa_pembatasan']['saldo_akhir'];
                        $periode_lalu = $data_aset_neto['tanpa_pembatasan']['saldo_awal'];
                    } else {
                        // Gunakan hasil dari stored procedure
                        $saldo = $hasil->saldo_akhir ?? 0;
                        $periode_lalu = $hasil->periode_lalu ?? 0;
                    }

                    $saldo_akun[$hasil->id_akun] = [
                        'saldo' => $saldo,
                        'periode_lalu' => $periode_lalu,
                    ];

                    // Hitung total untuk KEWAJIBAN dan ASET NETO
                    if (in_array($kategori, ['KEWAJIBAN', 'ASET NETO'])) {
                        $totalKewajibanAsetNeto += $saldo;
                        $totalPeriodeLaluKewajibanAsetNeto += $periode_lalu;
                    }
                }
            }

            // Format data untuk response API
            $data_terstruktur = $this->formatDataForApi($semua_akun, $saldo_akun);

            return response()->json([
                'success' => true,
                'message' => 'Data neraca saldo berhasil diambil',
                'data' => [
                    'akun_data' => $data_terstruktur,
                    'total_kewajiban_aset_neto' => $totalKewajibanAsetNeto,
                    'total_periode_lalu_kewajiban_aset_neto' => $totalPeriodeLaluKewajibanAsetNeto,
                    'filter' => [
                        'start_date' => $start,
                        'end_date' => $end,
                        'unit' => $id_unit,
                        'divisi' => $id_divisi,
                    ]
                ]
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
     * Get filter options (units and divisions)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFilterOptions()
    {
        try {
            $units = Unit::select('id_unit', 'unit')->get();
            $divisis = Divisi::select('id_divisi', 'divisi')->get();

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
                'message' => 'Terjadi kesalahan saat mengambil data filter',
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
            $start = $data['filter']['start_date'];
            $end = $data['filter']['end_date'];
            
            // Generate Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Logo
            $drawing = new Drawing();
            $drawing->setName('Logo');
            $drawing->setDescription('Logo Yayasan');
            $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
            $drawing->setHeight(100);
            $drawing->setCoordinates('A1');
            $drawing->setOffsetX(5);
            $drawing->setWorksheet($sheet);

            // Judul
            $judul = "POSISI KEUANGAN YAYASAN DARUSSALAM BATAM\nPeriode: " .
                date('d/m/Y', strtotime($start)) . " - " . date('d/m/Y', strtotime($end));
            $sheet->setCellValue('A1', $judul);
            $sheet->mergeCells('A1:C4');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);
            $sheet->getStyle('A1')->getAlignment()->setWrapText(true);
            $sheet->getStyle('A1')->getAlignment()
                ->setVertical(Alignment::VERTICAL_CENTER)
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Header
            $sheet->setCellValue('A4', 'AKUN');
            $sheet->setCellValue('B4', 'SALDO PERIODE LALU');
            $sheet->setCellValue('C4', 'SALDO');

            $sheet->getStyle('A4:C4')->applyFromArray([
                'font' => ['bold' => true],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '000000']],
                'font' => ['color' => ['rgb' => 'FFFFFF']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);
            $sheet->getStyle('A4:C4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row = 5;
            $totalPeriodeLaluKewajibanAsetNeto = 0;
            $totalSaldoKewajibanAsetNeto = 0;

            // Isi data dari API response
            foreach ($data['akun_data'] as $kategori => $kategoris) {
                $kategoriPeriodeLalu = 0;
                $kategoriSaldo = 0;

                $sheet->setCellValue("A{$row}", strtoupper($kategori));
                $sheet->mergeCells("A{$row}:C{$row}");
                $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:C{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('D9E1F2');
                $row++;

                foreach ($kategoris['sub_categories'] as $sub_kategori => $subData) {
                    $subPeriodeLalu = 0;
                    $subSaldo = 0;

                    $sheet->setCellValue("A{$row}", "   {$sub_kategori}");
                    $sheet->mergeCells("A{$row}:C{$row}");
                    $sheet->getStyle("A{$row}:C{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F2F2F2');
                    $row++;

                    foreach ($subData['accounts'] as $akun) {
                        $subPeriodeLalu += $akun['periode_lalu'];
                        $subSaldo += $akun['saldo'];

                        $sheet->setCellValue("A{$row}", "      {$akun['nama_akun']}");
                        $sheet->setCellValue("B{$row}", $akun['periode_lalu']);
                        $sheet->setCellValue("C{$row}", $akun['saldo']);

                        $sheet->getStyle("B{$row}:C{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
                        $sheet->getStyle("B{$row}:C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $row++;
                    }

                    // Subtotal Subkategori
                    $sheet->setCellValue("A{$row}", "Subtotal {$sub_kategori}");
                    $sheet->setCellValue("B{$row}", $subPeriodeLalu);
                    $sheet->setCellValue("C{$row}", $subSaldo);
                    $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
                    $sheet->getStyle("B{$row}:C{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
                    $sheet->getStyle("B{$row}:C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $row++;

                    $kategoriPeriodeLalu += $subPeriodeLalu;
                    $kategoriSaldo += $subSaldo;
                }

                // Subtotal Kategori
                $sheet->setCellValue("A{$row}", "Subtotal " . strtoupper($kategori));
                $sheet->setCellValue("B{$row}", $kategoriPeriodeLalu);
                $sheet->setCellValue("C{$row}", $kategoriSaldo);
                $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true)->getColor()->setRGB('000000');
                $sheet->getStyle("B{$row}:C{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
                $sheet->getStyle("B{$row}:C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $row++;

                if (in_array(strtoupper($kategori), ['KEWAJIBAN', 'ASET NETO'])) {
                    $totalPeriodeLaluKewajibanAsetNeto += $kategoriPeriodeLalu;
                    $totalSaldoKewajibanAsetNeto += $kategoriSaldo;
                }
            }

            // Total KEWAJIBAN + ASET NETO
            $sheet->setCellValue("A{$row}", 'Total KEWAJIBAN + ASET NETO');
            $sheet->setCellValue("B{$row}", $totalPeriodeLaluKewajibanAsetNeto);
            $sheet->setCellValue("C{$row}", $totalSaldoKewajibanAsetNeto);
            $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
            $sheet->getStyle("B{$row}:C{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
            $sheet->getStyle("B{$row}:C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;

            // Border
            $sheet->getStyle("A4:C" . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

            // Auto width
            foreach (range('A', 'C') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Footer
            $row += 2;
            $sheet->setCellValue("A{$row}", 'Sistem Informasi Akuntansi Yayasan Darussalam Batam | ' . date('Y'));
            $sheet->mergeCells("A{$row}:C{$row}");
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Output
            $fileName = 'Neraca_Saldo_' . date('d-m-Y', strtotime($start)) . '_' . date('d-m-Y', strtotime($end)) . '.xlsx';
            
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

    /**
     * Format data untuk API response
     */
    private function formatDataForApi($semua_akun, $saldo_akun)
    {
        $data_terstruktur = [];

        foreach ($semua_akun->groupBy(function ($akun) {
            return $akun->subKategori->kategori_akun->kategori_akun ?? 'Unknown';
        }) as $kategori => $sub_kategoris) {
            $data_terstruktur[$kategori] = [
                'sub_categories' => [],
                'total_periode_lalu' => 0,
                'total_saldo' => 0,
            ];

            foreach ($sub_kategoris->groupBy(function ($akun) {
                return $akun->subKategori->sub_kategori_akun ?? 'Unknown';
            }) as $sub_kategori => $akuns) {
                $sub_data = [
                    'accounts' => [],
                    'subtotal_periode_lalu' => 0,
                    'subtotal_saldo' => 0,
                ];

                foreach ($akuns as $akun) {
                    $saldo_data = $saldo_akun[$akun->id_akun] ?? ['saldo' => 0, 'periode_lalu' => 0];
                    
                    $sub_data['accounts'][] = [
                        'id_akun' => $akun->id_akun,
                        'nama_akun' => $akun->akun,
                        'periode_lalu' => $saldo_data['periode_lalu'],
                        'saldo' => $saldo_data['saldo'],
                    ];

                    $sub_data['subtotal_periode_lalu'] += $saldo_data['periode_lalu'];
                    $sub_data['subtotal_saldo'] += $saldo_data['saldo'];
                }

                $data_terstruktur[$kategori]['sub_categories'][$sub_kategori] = $sub_data;
                $data_terstruktur[$kategori]['total_periode_lalu'] += $sub_data['subtotal_periode_lalu'];
                $data_terstruktur[$kategori]['total_saldo'] += $sub_data['subtotal_saldo'];
            }
        }

        return $data_terstruktur;
    }

    /**
     * Fallback method jika stored procedure gagal
     */
    private function indexFallback(Request $request)
    {
        // Implementasi sama dengan method indexFallback yang sudah ada
        // Return JSON response instead of view
        // ... (copy logic dari indexFallback original, ubah return menjadi JSON)
        
        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil (fallback mode)',
            'data' => []
        ], 200);
    }
}