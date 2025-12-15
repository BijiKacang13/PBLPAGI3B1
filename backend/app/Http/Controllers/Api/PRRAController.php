<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
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

class PRRAController extends Controller
{
    /**
     * Get dropdown filter options (units & divisions)
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
                    'divisis' => $divisis,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil filter options',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get PRRA data (akun/kegiatan)
     */
    public function index(Request $request)
    {
        try {
            $data = $this->buildData($request);

            return response()->json([
                'success' => true,
                'message' => 'Data PRRA berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data PRRA',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export PRRA data to Excel
     */
    public function export(Request $request)
    {
        try {
            $data = $this->buildData($request);

            // Build spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(11);

            $drawing = new Drawing();
            $drawing->setName('Logo');
            $drawing->setDescription('Logo Yayasan');
            $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
            $drawing->setHeight(100);
            $drawing->setCoordinates('A1');
            $drawing->setOffsetX(10);
            $drawing->setWorksheet($sheet);

            $richText = new RichText();
            $title = $richText->createTextRun("LAPORAN PROYEKSI RENCANA REALISASI ANGGARAN YAYASAN DARUSSALAM BATAM\n");
            $title->getFont()->setBold(true)->setSize(14);
            $periode = $richText->createTextRun(
                "Periode " . Carbon::parse($data['filter']['start_date'])->translatedFormat('d F Y') .
                " s.d. " . Carbon::parse($data['filter']['end_date'])->translatedFormat('d F Y')
            );
            $periode->getFont()->setSize(10);

            $sheet->setCellValue('A1', $richText);
            $sheet->mergeCells('A1:E5');
            $sheet->getStyle('A1')->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                ->setVertical(Alignment::VERTICAL_CENTER)
                ->setWrapText(true);

            for ($i = 1; $i <= 5; $i++) {
                $sheet->getRowDimension($i)->setRowHeight(20);
            }

            $row = 7;
            $headers = ['Nama', 'Budget RAPBS', 'Realisasi', 'Selisih', 'Persentase Capaian'];
            foreach ($headers as $i => $header) {
                $col = chr(65 + $i);
                $sheet->setCellValue("{$col}{$row}", $header);
            }

            $sheet->getStyle("A{$row}:E{$row}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F81BD']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
            $row++;

            foreach ($data['grouped_data'] as $kategori => $sub) {
                $sheet->setCellValue("A{$row}", strtoupper($kategori));
                $sheet->mergeCells("A{$row}:E{$row}");
                $sheet->getStyle("A{$row}")->getFont()->setBold(true)->setSize(11);
                $sheet->getStyle("A{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('D9E1F2');
                $row++;

                foreach ($sub as $items) {
                    foreach ($items as $item) {
                        $budget = $item['budget_rapbs'] ?? 0;
                        $realisasi = $item['realisasi'] ?? 0;
                        $selisih = $item['selisih'] ?? 0;
                        $persen = $item['persentase_capaian'] ?? 0;

                        $sheet->setCellValue("A{$row}", $item['nama_akun'] ?? $item['nama_kegiatan']);
                        $sheet->setCellValue("B{$row}", $budget);
                        $sheet->setCellValue("C{$row}", $realisasi);
                        $sheet->setCellValue("D{$row}", $selisih);
                        $sheet->setCellValue("E{$row}", $persen / 100);

                        $sheet->getStyle("B{$row}:D{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
                        $sheet->getStyle("E{$row}")->getNumberFormat()->setFormatCode('0.00%');
                        $sheet->getStyle("B{$row}:E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $row++;
                    }
                }
            }

            $sheet->getStyle("A7:E" . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

            $sheet->getColumnDimension('A')->setAutoSize(true);
            $sheet->getColumnDimension('B')->setAutoSize(true);
            $sheet->getColumnDimension('C')->setAutoSize(true);
            $sheet->getColumnDimension('D')->setAutoSize(true);
            $sheet->getColumnDimension('E')->setWidth(36.5);

            $sheet->setCellValue("A{$row}", 'Sistem Informasi Akuntansi | ' . date('Y'));
            $sheet->mergeCells("A{$row}:E{$row}");
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $fileName = 'Laporan_PRRA_' . date('d-m-Y', strtotime($data['filter']['start_date'])) .
                '_sd_' . date('d-m-Y', strtotime($data['filter']['end_date'])) . '.xlsx';

            $writer = new Xlsx($spreadsheet);
            return response()->streamDownload(function () use ($writer) {
                $writer->save('php://output');
            }, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor data PRRA',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Build PRRA data shared by index/export
     */
    private function buildData(Request $request): array
    {
        $user = Auth::user();

        $berdasarkan = $request->get('berdasarkan', 'akun');
        $startDate = $request->input('start_date') ?? date('Y') . '-01-01';
        $endDate = $request->input('end_date') ?? date('Y-m-d');
        $unitId = $request->unit;
        $divisiId = $request->divisi;

        if (!$unitId && $user && $user->role === 'akuntan_unit') {
            $unitId = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
        }

        $groupedData = [];
        $totalBudget = 0;
        $totalRealisasi = 0;
        $totalSelisih = 0;

        if ($berdasarkan === 'kegiatan') {
            $results = DB::select('CALL hitung_prra_kegiatan(?, ?, ?, ?)', [
                $startDate,
                $endDate,
                $unitId,
                $divisiId,
            ]);

            $groupedData['KEGIATAN']['Semua Kegiatan'] = [];

            foreach ($results as $row) {
                $budget = (float) ($row->budget ?? 0);
                $realisasi = (float) ($row->realisasi ?? 0);
                $selisih = $budget - $realisasi;
                $persentase = $budget != 0 ? ($realisasi / $budget) * 100 : 0;

                $item = [
                    'nama_kegiatan' => $row->nama_kegiatan,
                    'budget_rapbs' => $budget,
                    'realisasi' => $realisasi,
                    'selisih' => $selisih,
                    'persentase_capaian' => $persentase,
                ];

                $groupedData['KEGIATAN']['Semua Kegiatan'][] = $item;
                $totalBudget += $budget;
                $totalRealisasi += $realisasi;
                $totalSelisih += $selisih;
            }
        } else {
            $results = DB::select('CALL hitung_komprehensif(?, ?, ?, ?)', [
                $startDate,
                $endDate,
                $unitId,
                $divisiId,
            ]);

            foreach ($results as $row) {
                $kategori = $row->kategori_akun ?? 'Lainnya';
                $subKategori = 'Lainnya';

                $realisasi = (float) ($row->total_tanpa + $row->total_dengan);
                $budget = DB::table('budget_rapbs_akun')
                    ->join('akun', 'budget_rapbs_akun.id_akun', '=', 'akun.id_akun')
                    ->where('akun.akun', $row->nama_akun)
                    ->when($unitId, fn($q) => $q->where('budget_rapbs_akun.id_unit', $unitId))
                    ->sum('budget_rapbs_akun.budget_rapbs_akun');

                $budget = (float) $budget;
                $selisih = $budget - $realisasi;
                $persentase = $budget != 0 ? ($realisasi / $budget) * 100 : 0;

                $item = [
                    'nama_akun' => $row->nama_akun,
                    'budget_rapbs' => $budget,
                    'realisasi' => $realisasi,
                    'selisih' => $selisih,
                    'persentase_capaian' => $persentase,
                ];

                $groupedData[$kategori][$subKategori][] = $item;
                $totalBudget += $budget;
                $totalRealisasi += $realisasi;
                $totalSelisih += $selisih;
            }
        }

        return [
            'grouped_data' => $groupedData,
            'total_budget' => $totalBudget,
            'total_realisasi' => $totalRealisasi,
            'total_selisih' => $totalSelisih,
            'filter' => [
                'berdasarkan' => $berdasarkan,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'unit' => $unitId ? (int) $unitId : null,
                'divisi' => $divisiId ? (int) $divisiId : null,
            ],
        ];
    }
}




