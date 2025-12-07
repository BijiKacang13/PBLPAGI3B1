<?php

namespace App\Http\Controllers\Api;

use App\Models\Unit;
use App\Models\Akuntan_Unit;
use App\Models\Divisi;
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
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class LaporanKomprehensifController extends Controller
{
    /**
     * Get laporan komprehensif data
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            $id_unit = $request->input('id_unit');
            $id_divisi = $request->input('id_divisi');

            // Auto-set id_unit jika user adalah akuntan_unit
            if (!$id_unit && $user->role === 'akuntan_unit') {
                $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
            }

            $tanggal_mulai = $request->input('tanggal_mulai') ?? date('Y') . '-01-01';
            $tanggal_selesai = $request->input('tanggal_selesai') ?? date('Y-m-d');

            // Validasi tanggal
            if (strtotime($tanggal_mulai) > strtotime($tanggal_selesai)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai'
                ], 400);
            }

            $pendapatan_all = [];
            $beban_all = [];

            try {
                // Coba gunakan stored procedure
                $results = DB::select('CALL hitung_komprehensif(?, ?, ?, ?)', [
                    $tanggal_mulai,
                    $tanggal_selesai,
                    $id_unit,
                    $id_divisi
                ]);

                foreach ($results as $row) {
                    $saldo_awal = (float) $row->saldo_awal;
                    $total_tanpa = (float) $row->total_tanpa;
                    $total_dengan = (float) $row->total_dengan;
                    $total = $total_tanpa + $total_dengan + $saldo_awal;

                    $data = [
                        'akun' => $row->nama_akun,
                        'total_tanpa' => $total_tanpa,
                        'total_dengan' => $total_dengan,
                        'total' => $total,
                    ];

                    $sub = $row->sub_kategori_akun ?? '-';
                    if ($row->kategori_akun === 'PENERIMAAN DAN SUMBANGAN') {
                        if (!isset($pendapatan_all[$sub])) {
                            $pendapatan_all[$sub] = [];
                        }
                        $pendapatan_all[$sub][] = $data;
                    } else {
                        if (!isset($beban_all[$sub])) {
                            $beban_all[$sub] = [];
                        }
                        $beban_all[$sub][] = $data;
                    }
                }

            } catch (\Exception $e) {
                // Fallback ke query manual jika stored procedure gagal
                \Log::error('Stored procedure error: ' . $e->getMessage());

                $akunList = DB::table('akun')
                    ->join('sub_kategori_akun', 'akun.id_sub_kategori_akun', '=', 'sub_kategori_akun.id_sub_kategori_akun')
                    ->join('kategori_akun', 'sub_kategori_akun.id_kategori_akun', '=', 'kategori_akun.id_kategori_akun')
                    ->whereIn('kategori_akun.kategori_akun', ['PENERIMAAN DAN SUMBANGAN', 'BEBAN'])
                    ->select(
                        'akun.id_akun',
                        'akun.akun AS nama_akun',
                        'kategori_akun.kategori_akun',
                        'sub_kategori_akun.sub_kategori_akun',
                        'akun.saldo_awal_debit',
                        'akun.saldo_awal_kredit'
                    )
                    ->get();

                $getTotal = function ($akun_id, $jenis_transaksi, $tanggal_mulai, $tanggal_selesai, $isPendapatan) use ($id_unit, $id_divisi) {
                    $query = DB::table('detail_jurnal_umum')
                        ->join('jurnal_umum', 'detail_jurnal_umum.id_jurnal_umum', '=', 'jurnal_umum.id_jurnal_umum')
                        ->whereExists(function ($q) {
                            $q->select(DB::raw(1))
                                ->from('buku_besar')
                                ->whereColumn('buku_besar.id_jurnal_umum', 'jurnal_umum.id_jurnal_umum');
                        })
                        ->where('detail_jurnal_umum.id_akun', $akun_id)
                        ->where('jurnal_umum.jenis_transaksi', $jenis_transaksi)
                        ->whereBetween('jurnal_umum.tanggal', [$tanggal_mulai, $tanggal_selesai]);

                    if ($id_unit) {
                        $query->where('jurnal_umum.id_unit', $id_unit);
                    }

                    if ($id_divisi) {
                        $query->where('jurnal_umum.id_divisi', $id_divisi);
                    }

                    return $query
                        ->where('detail_jurnal_umum.debit_kredit', $isPendapatan ? 'kredit' : 'debit')
                        ->sum('detail_jurnal_umum.nominal');
                };

                foreach ($akunList as $akun) {
                    $isPendapatan = $akun->kategori_akun === 'PENERIMAAN DAN SUMBANGAN';

                    $total_tanpa  = $getTotal($akun->id_akun, 'tidak terikat', $tanggal_mulai, $tanggal_selesai, $isPendapatan);
                    $total_dengan = $getTotal($akun->id_akun, 'terikat', $tanggal_mulai, $tanggal_selesai, $isPendapatan);

                    $saldo_awal = $isPendapatan
                        ? ($akun->saldo_awal_kredit ?? 0)
                        : ($akun->saldo_awal_debit ?? 0);

                    $data = [
                        'akun' => $akun->nama_akun,
                        'total_tanpa' => $total_tanpa,
                        'total_dengan' => $total_dengan,
                        'total' => $total_tanpa + $total_dengan + $saldo_awal,
                    ];

                    $sub = $akun->sub_kategori_akun;
                    if ($isPendapatan) {
                        if (!isset($pendapatan_all[$sub])) {
                            $pendapatan_all[$sub] = [];
                        }
                        $pendapatan_all[$sub][] = $data;
                    } else {
                        if (!isset($beban_all[$sub])) {
                            $beban_all[$sub] = [];
                        }
                        $beban_all[$sub][] = $data;
                    }
                }
            }

            // Hitung total
            $total_pendapatan = $total_pendapatan_terikat = $total_pendapatan_all = 0;
            foreach ($pendapatan_all as $akuns) {
                foreach ($akuns as $item) {
                    $total_pendapatan += $item['total_tanpa'];
                    $total_pendapatan_terikat += $item['total_dengan'];
                    $total_pendapatan_all += $item['total'];
                }
            }

            $total_beban = $total_beban_terikat = $total_beban_all = 0;
            foreach ($beban_all as $akuns) {
                foreach ($akuns as $item) {
                    $total_beban += $item['total_tanpa'];
                    $total_beban_terikat += $item['total_dengan'];
                    $total_beban_all += $item['total'];
                }
            }

            $kenaikan_penghasilan_komprehensif = $total_pendapatan_all - $total_beban_all;

            return response()->json([
                'success' => true,
                'data' => [
                    'pendapatan_all' => $pendapatan_all,
                    'beban_all' => $beban_all,
                    'summary' => [
                        'total_pendapatan' => $total_pendapatan,
                        'total_pendapatan_terikat' => $total_pendapatan_terikat,
                        'total_pendapatan_all' => $total_pendapatan_all,
                        'total_beban' => $total_beban,
                        'total_beban_terikat' => $total_beban_terikat,
                        'total_beban_all' => $total_beban_all,
                        'kenaikan_penghasilan_komprehensif' => $kenaikan_penghasilan_komprehensif,
                    ],
                    'filters' => [
                        'tanggal_mulai' => $tanggal_mulai,
                        'tanggal_selesai' => $tanggal_selesai,
                        'id_unit' => $id_unit,
                        'id_divisi' => $id_divisi,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in LaporanKomprehensifController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown options (units & divisions)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOptions()
    {
        try {
            $units = Unit::select('id_unit', DB::raw('unit as nama_unit'))->get();
            $divisis = Divisi::select('id_divisi', DB::raw('divisi as nama_divisi'))->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'units' => $units,
                    'divisis' => $divisis,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getOptions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data options',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export laporan to Excel
     * 
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function exportExcel(Request $request)
    {
        try {
            $user = Auth::user();

            $id_unit = $request->input('id_unit');
            $id_divisi = $request->input('id_divisi');

            if (!$id_unit && $user->role === 'akuntan_unit') {
                $id_unit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
            }

            $tanggal_mulai = $request->input('tanggal_mulai') ?? date('Y') . '-01-01';
            $tanggal_selesai = $request->input('tanggal_selesai') ?? date('Y-m-d');

            // Get data (sama seperti method index)
            $pendapatan_all = [];
            $beban_all = [];

            try {
                $results = DB::select('CALL hitung_komprehensif(?, ?, ?, ?)', [
                    $tanggal_mulai,
                    $tanggal_selesai,
                    $id_unit,
                    $id_divisi
                ]);

                foreach ($results as $row) {
                    $saldo_awal = (float) $row->saldo_awal;
                    $total_tanpa = (float) $row->total_tanpa;
                    $total_dengan = (float) $row->total_dengan;
                    $total = $total_tanpa + $total_dengan + $saldo_awal;

                    $data = (object) [
                        'akun' => $row->nama_akun,
                        'total_tanpa' => $total_tanpa,
                        'total_dengan' => $total_dengan,
                        'total' => $total,
                    ];

                    $sub = $row->sub_kategori_akun ?? '-';
                    if ($row->kategori_akun === 'PENERIMAAN DAN SUMBANGAN') {
                        $pendapatan_all[$sub][] = $data;
                    } else {
                        $beban_all[$sub][] = $data;
                    }
                }

            } catch (\Exception $e) {
                \Log::error('Stored procedure error: ' . $e->getMessage());
                // Implementasi fallback sama seperti di method index
                // ... (copy code fallback dari method index)
            }

            // Hitung total
            $total_pendapatan = $total_pendapatan_terikat = $total_pendapatan_all = 0;
            foreach ($pendapatan_all as $akuns) {
                foreach ($akuns as $item) {
                    $total_pendapatan += $item->total_tanpa;
                    $total_pendapatan_terikat += $item->total_dengan;
                    $total_pendapatan_all += $item->total;
                }
            }

            $total_beban = $total_beban_terikat = $total_beban_all = 0;
            foreach ($beban_all as $akuns) {
                foreach ($akuns as $item) {
                    $total_beban += $item->total_tanpa;
                    $total_beban_terikat += $item->total_dengan;
                    $total_beban_all += $item->total;
                }
            }

            $kenaikan_penghasilan_komprehensif = $total_pendapatan_all - $total_beban_all;

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

            // Header
            $judul = "LAPORAN KOMPREHENSIF YAYASAN DARUSSALAM BATAM\nPeriode: " .
                    date('d/m/Y', strtotime($tanggal_mulai)) . " - " . date('d/m/Y', strtotime($tanggal_selesai));
            $sheet->setCellValue('A1', $judul);
            $sheet->mergeCells('A1:D4');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);
            $sheet->getStyle('A1')->getAlignment()->setWrapText(true);
            $sheet->getStyle('A1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Header tabel
            $sheet->setCellValue('A6', 'Akun');
            $sheet->setCellValue('B6', 'Tanpa Pembatasan');
            $sheet->setCellValue('C6', 'Dengan Pembatasan');
            $sheet->setCellValue('D6', 'Jumlah (Rp)');

            $sheet->getStyle('A6:D6')->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '000000']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);

            $row = 7;

            // PENDAPATAN
            $sheet->setCellValue("A{$row}", 'Pendapatan');
            $sheet->mergeCells("A{$row}:D{$row}");
            $sheet->getStyle("A{$row}")->getFont()->setBold(true);
            $sheet->getStyle("A{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDDDDD');
            $row++;

            foreach ($pendapatan_all as $items) {
                foreach ($items as $item) {
                    $sheet->setCellValue("A{$row}", '   ' . $item->akun);
                    $sheet->setCellValue("B{$row}", $item->total_tanpa);
                    $sheet->setCellValue("C{$row}", $item->total_dengan);
                    $sheet->setCellValue("D{$row}", $item->total);
                    $sheet->getStyle("B{$row}:D{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
                    $sheet->getStyle("B{$row}:D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $row++;
                }
            }

            $sheet->setCellValue("A{$row}", 'Total Pendapatan');
            $sheet->setCellValue("B{$row}", $total_pendapatan);
            $sheet->setCellValue("C{$row}", $total_pendapatan_terikat);
            $sheet->setCellValue("D{$row}", $total_pendapatan_all);
            $sheet->getStyle("A{$row}:D{$row}")->getFont()->setBold(true);
            $sheet->getStyle("B{$row}:D{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
            $sheet->getStyle("B{$row}:D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;

            // BEBAN
            $sheet->setCellValue("A{$row}", 'Beban');
            $sheet->mergeCells("A{$row}:D{$row}");
            $sheet->getStyle("A{$row}")->getFont()->setBold(true);
            $sheet->getStyle("A{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDDDDD');
            $row++;

            foreach ($beban_all as $items) {
                foreach ($items as $item) {
                    $sheet->setCellValue("A{$row}", '   ' . $item->akun);
                    $sheet->setCellValue("B{$row}", $item->total_tanpa);
                    $sheet->setCellValue("C{$row}", $item->total_dengan);
                    $sheet->setCellValue("D{$row}", $item->total);
                    $sheet->getStyle("B{$row}:D{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
                    $sheet->getStyle("B{$row}:D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $row++;
                }
            }

            $sheet->setCellValue("A{$row}", 'Total Beban');
            $sheet->setCellValue("B{$row}", $total_beban);
            $sheet->setCellValue("C{$row}", $total_beban_terikat);
            $sheet->setCellValue("D{$row}", $total_beban_all);
            $sheet->getStyle("A{$row}:D{$row}")->getFont()->setBold(true);
            $sheet->getStyle("B{$row}:D{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
            $sheet->getStyle("B{$row}:D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;

            // KENAIKAN/PENURUNAN
            $sheet->setCellValue("A{$row}", 'KENAIKAN (PENURUNAN) PENGHASILAN KOMPREHENSIF');
            $sheet->setCellValue("D{$row}", $kenaikan_penghasilan_komprehensif);
            $sheet->getStyle("A{$row}:D{$row}")->getFont()->setBold(true);
            $sheet->getStyle("A{$row}:D{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('C6EFCE');
            $sheet->getStyle("D{$row}")->getNumberFormat()->setFormatCode('#,##0;(#,##0)');
            $sheet->getStyle("D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            // BORDER
            $sheet->getStyle("A6:D{$row}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

            // AUTOSIZE
            foreach (range('A', 'D') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // FOOTER
            $row += 2;
            $sheet->setCellValue("A{$row}", 'Sistem Informasi Akuntansi Yayasan Darussalam Batam | ' . date('Y'));
            $sheet->mergeCells("A{$row}:D{$row}");
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Save to temp file
            $fileName = 'Laporan_Komprehensif_' . date('d-m-Y', strtotime($tanggal_mulai)) . '_' . date('d-m-Y', strtotime($tanggal_selesai)) . '.xlsx';
            $tempFile = tempnam(sys_get_temp_dir(), 'excel_');
            
            $writer = new Xlsx($spreadsheet);
            $writer->save($tempFile);

            return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            \Log::error('Error exporting Excel: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}