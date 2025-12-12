<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Akuntan_Unit;
use App\Models\Akuntan_Divisi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
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
    /**
     * Get laporan perubahan aset neto data
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            // Validasi input
            $validated = $request->validate([
                'tanggal_mulai' => 'nullable|date',
                'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
                'unit' => 'nullable|integer',
                'divisi' => 'nullable|integer',
            ]);

            $start = $request->input('tanggal_mulai') ?? date('Y') . '-01-01';
            $end = $request->input('tanggal_selesai') ?? date('Y-m-d');

            $id_unit = $request->has('unit') && $request->unit ? (int)$request->unit : null;
            $id_divisi = $request->has('divisi') && $request->divisi ? (int)$request->divisi : null;

            // Set default unit/divisi dari role user
            if (!$id_unit && $user->role === 'akuntan_unit') {
                $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
            }

            if (!$id_divisi && $user->role === 'akuntan_divisi') {
                $id_divisi = Divisi::where('id_akuntan_divisi', $user->id_user)->value('id_divisi');
            }

            // Ambil akun ASET NETO DENGAN & TANPA PEMBATASAN
            try {
                $akunDengan = Akun::whereHas('subKategori.kategori_akun', function($q) {
                    $q->where('kategori_akun', 'ASET NETO');
                })->whereHas('subKategori', function($q) {
                    $q->where('sub_kategori_akun', 'Dengan Pembatasan');
                })->first();

                $akunTanpa = Akun::whereHas('subKategori.kategori_akun', function($q) {
                    $q->where('kategori_akun', 'ASET NETO');
                })->whereHas('subKategori', function($q) {
                    $q->where('sub_kategori_akun', 'Tanpa Pembatasan');
                })->first();
            } catch (\Exception $e) {
                \Log::error('Error fetching akun: ' . $e->getMessage());
                $akunDengan = null;
                $akunTanpa = null;
            }

            // Hitung data
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

            // Panggil stored procedure untuk kenaikan berjalan
            try {
                $results = DB::select('CALL hitung_kenaikan_aset_neto(?, ?, ?, ?)', [
                    $start,
                    $end,
                    $id_unit,
                    $id_divisi
                ]);

                if (empty($results)) {
                    \Log::warning('Stored procedure hitung_kenaikan_aset_neto returned empty result');
                    $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = 0;
                    $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = 0;
                } else {
                    $hasil = $results[0];
                    $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = $hasil->terikat ?? 0;
                    $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = $hasil->tidak_terikat ?? 0;
                }

            } catch (\Exception $e) {
                \Log::error('Gagal hitung aset neto via procedure: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
                // Jangan return error, set default values saja
                $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = 0;
                $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = 0;
            }

            // Hitung saldo akhir
            $data['dengan_pembatasan']['saldo_akhir'] =
                $data['dengan_pembatasan']['saldo_awal'] +
                $data['dengan_pembatasan']['kenaikan_periode_berjalan'];

            $data['tanpa_pembatasan']['saldo_akhir'] =
                $data['tanpa_pembatasan']['saldo_awal'] +
                $data['tanpa_pembatasan']['kenaikan_periode_berjalan'];

            $total_saldo_akhir = $data['dengan_pembatasan']['saldo_akhir'] + $data['tanpa_pembatasan']['saldo_akhir'];

            // Return JSON response
            return response()->json([
                'success' => true,
                'data' => [
                    'report_data' => $data,
                    'total_saldo_akhir' => $total_saldo_akhir,
                    'start' => $start,
                    'end' => $end,
                    'id_unit' => $id_unit,
                    'id_divisi' => $id_divisi,
                    'user' => [
                        'role' => $user->role,
                        'id_unit' => $user->role === 'akuntan_unit' ? $id_unit : null,
                    ]
                ],
                'message' => 'Data berhasil dimuat'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in PerubahanAsetNetoController: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat data',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan pada server'
            ], 500);
        }
    }

    /**
     * Get units list
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUnits()
    {
        try {
            $units = Unit::select('id_unit', 'unit')->get();
            
            return response()->json([
                'success' => true,
                'data' => $units
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data unit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get divisi list
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDivisi()
    {
        try {
            $divisis = Divisi::select('id_divisi', 'divisi')->get();
            
            return response()->json([
                'success' => true,
                'data' => $divisis
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data divisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export to Excel
     * 
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
     */
    public function exportExcel(Request $request)   
    {
        try {
            $user = Auth::user();

            $start = $request->input('tanggal_mulai') ?? date('Y') . '-01-01';
            $end = $request->input('tanggal_selesai') ?? date('Y-m-d');

            $id_unit = $request->has('unit') && $request->unit ? (int)$request->unit : null;
            $id_divisi = $request->has('divisi') && $request->divisi ? (int)$request->divisi : null;

            if (!$id_unit && $user->role === 'akuntan_unit') {
                $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
            }

            if (!$id_divisi && $user->role === 'akuntan_divisi') {
                $id_divisi = Divisi::where('id_akuntan_divisi', $user->id_user)->value('id_divisi');
            }

            // Ambil akun
            try {
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
            } catch (\Exception $e) {
                \Log::error('Error fetching akun in exportExcel: ' . $e->getMessage());
                $akunDengan = null;
                $akunTanpa = null;
            }

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

            try {
                $results = DB::select('CALL hitung_kenaikan_aset_neto(?, ?, ?, ?)', [
                    $start,
                    $end,
                    $id_unit,
                    $id_divisi
                ]);

                if (!empty($results)) {
                    $hasil = $results[0];
                    $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = $hasil->terikat ?? 0;
                    $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = $hasil->tidak_terikat ?? 0;
                } else {
                    $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = 0;
                    $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = 0;
                }
            } catch (\Exception $e) {
                \Log::error('Gagal hitung aset neto via procedure in exportExcel: ' . $e->getMessage());
                $data['dengan_pembatasan']['kenaikan_periode_berjalan'] = 0;
                $data['tanpa_pembatasan']['kenaikan_periode_berjalan'] = 0;
            }

            $data['dengan_pembatasan']['saldo_akhir'] =
                $data['dengan_pembatasan']['saldo_awal'] +
                $data['dengan_pembatasan']['kenaikan_periode_berjalan'];

            $data['tanpa_pembatasan']['saldo_akhir'] =
                $data['tanpa_pembatasan']['saldo_awal'] +
                $data['tanpa_pembatasan']['kenaikan_periode_berjalan'];

            $total_saldo_akhir = $data['dengan_pembatasan']['saldo_akhir'] + $data['tanpa_pembatasan']['saldo_akhir'];

            return $this->generateExcel($data, $total_saldo_akhir, $start, $end);

        } catch (\Exception $e) {
            \Log::error('Error exporting excel: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Excel file
     */
    private function generateExcel($data, $total_saldo_akhir, $tanggal_mulai, $tanggal_selesai)
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
        $drawing->setWorksheet($sheet);

        // Judul dengan RichText
        $richText = new RichText();
        $judul = $richText->createTextRun("LAPORAN PERUBAHAN ASET NETO YAYASAN DARUSSALAM BATAM\n");
        $judul->getFont()->setBold(true)->setSize(14);

        $periode = $richText->createTextRun("Periode " .
            Carbon::parse($tanggal_mulai)->translatedFormat('d F Y') .
            " s.d. " .
            Carbon::parse($tanggal_selesai)->translatedFormat('d F Y'));
        $periode->getFont()->setSize(10);

        $sheet->setCellValue('A1', $richText);
        $sheet->mergeCells('A1:B4');
        $sheet->getStyle('A1')->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true);

        for ($i = 1; $i <= 4; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }

        $row = 5;

        // Header bagian 1
        $sheet->setCellValue("A{$row}", 'Aset Neto Dengan Pembatasan Sumber Daya');
        $sheet->mergeCells("A{$row}:B{$row}");
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C6EFCE']],
        ]);
        $row++;

        // Data bagian 1
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

        // Header bagian 2
        $sheet->setCellValue("A{$row}", 'Aset Neto Tanpa Pembatasan Sumber Daya');
        $sheet->mergeCells("A{$row}:B{$row}");
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF2CC']],
        ]);
        $row++;

        // Data bagian 2
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

        // Total saldo akhir
        $sheet->setCellValue("A{$row}", 'Total Saldo Akhir Aset Neto');
        $sheet->setCellValue("B{$row}", $total_saldo_akhir);
        $sheet->getStyle("A{$row}:B{$row}")->getFont()->setBold(true);
        $sheet->getStyle("B{$row}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Kolom width
        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setWidth(52.0);

        // Footer
        $row += 2;
        $sheet->setCellValue("A{$row}", 'Sistem Informasi Akuntansi | ' . date('Y'));
        $sheet->mergeCells("A{$row}:B{$row}");
        $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Border
        $lastDataRow = $row - 3;
        $sheet->getStyle("A6:B{$lastDataRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // Alignment
        $sheet->getStyle("A6:A{$lastDataRow}")->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_LEFT)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true);
        $sheet->getStyle("B6:B{$lastDataRow}")->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_RIGHT)
            ->setVertical(Alignment::VERTICAL_CENTER);

        // Output
        $fileName = 'Perubahan_Aset_Neto_' . date('d-m-Y', strtotime($tanggal_mulai)) . '_' . date('d-m-Y', strtotime($tanggal_selesai)) . '.xlsx';
        
        $writer = new Xlsx($spreadsheet);
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment;filename=\"{$fileName}\"");
        header('Cache-Control: max-age=0');
        
        $writer->save('php://output');
    }
}