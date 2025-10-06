<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Kegiatan;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class PRRAController extends Controller
{
    

    public function index(Request $request)
    {
        $user = Auth::user();

        $berdasarkan = $request->get('berdasarkan', 'akun');
        $startDate = $request->input('start_date') ?? date('Y') . '-01-01';
        $endDate = $request->input('end_date') ?? date('Y-m-d');
        $unitId = $request->unit;
        $divisiId = $request->divisi;

        if (!$unitId && $user->role === 'akuntan_unit') {
            $unitId = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value('id_unit');
        }

        $groupedData = [];

        if ($berdasarkan === 'kegiatan') {
            try {
                $results = DB::select('CALL hitung_prra_kegiatan(?, ?, ?, ?)', [
                    $startDate,
                    $endDate,
                    $unitId,
                    $divisiId
                ]);

                $groupedData['KEGIATAN']['Semua Kegiatan'] = [];

                foreach ($results as $row) {
                    $groupedData['KEGIATAN']['Semua Kegiatan'][] = (object)[
                        'nama_kegiatan' => $row->nama_kegiatan,
                        'budget_rapbs' => $row->budget,
                        'realisasi' => $row->realisasi,
                        'selisih' => $row->budget - $row->realisasi,
                    ];
                }
            } catch (\Exception $e) {
                \Log::error('Error hitung_prra_kegiatan: ' . $e->getMessage());
                $groupedData['ERROR'] = ['Gagal memuat data kegiatan dari prosedur.'];
            }
        }
        else {
            try {
                $results = DB::select('CALL hitung_komprehensif(?, ?, ?, ?)', [
                    $startDate,
                    $endDate,
                    $unitId,
                    $divisiId
                ]);

                foreach ($results as $row) {
                    $kategori = $row->kategori_akun;
                    $subKategori = 'Lainnya'; // Jika ingin diganti dari relasi bisa, tapi prosedur belum sediakan

                    $totalRealisasi = (float)$row->total_tanpa + (float)$row->total_dengan;

                    // Ambil budget dari tabel RAPBS
                    $budget = DB::table('budget_rapbs_akun')
                        ->join('akun', 'budget_rapbs_akun.id_akun', '=', 'akun.id_akun')
                        ->where('akun.akun', $row->nama_akun)
                        ->when($unitId, fn($q) => $q->where('budget_rapbs_akun.id_unit', $unitId))
                        ->sum('budget_rapbs_akun');

                    $groupedData[$kategori][$subKategori][] = (object)[
                        'nama_akun' => $row->nama_akun,
                        'budget_rapbs' => $budget,
                        'realisasi' => $totalRealisasi,
                        'selisih' => $budget - $totalRealisasi,
                    ];
                }

            } catch (\Exception $e) {
                \Log::error('Error panggil prosedur hitung_komprehensif: ' . $e->getMessage());
                // fallback atau error response (opsional)
                $groupedData['ERROR'] = ['Gagal memuat data akun dari stored procedure.'];
            }
        }

        // Jika ada permintaan export
        if ($request->has('export_excel')) {
            return $this->exportExcel($groupedData, $berdasarkan, $startDate, $endDate);
        }

        $units = Unit::all();
        $divisis = Divisi::all();

        return view('prra', compact('groupedData', 'berdasarkan', 'units', 'divisis', 'unitId', 'divisiId'));
    }




    private function exportExcel($groupedData, $berdasarkan, $start, $end)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set default font
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(11);

        // 🖼️ Sisipkan logo
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo Yayasan');
        $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
        $drawing->setHeight(100);
        $drawing->setCoordinates('A1');
        $drawing->setOffsetX(10);
        $drawing->setWorksheet($sheet);

        // 📌 Header judul dan periode (RichText)
        $richText = new RichText();
        $judulText = $richText->createTextRun("LAPORAN PROYEKSI RENCANA REALISASI ANGGARAN YAYASAN DARUSSALAM BATAM\n");
        $judulText->getFont()->setBold(true)->setSize(14);
        $periodeText = $richText->createTextRun("Periode " . Carbon::parse($start)->translatedFormat('d F Y') . " s.d. " . Carbon::parse($end)->translatedFormat('d F Y'));
        $periodeText->getFont()->setSize(10);

        $sheet->setCellValue('A1', $richText);
        $sheet->mergeCells('A1:E5');
        $sheet->getStyle('A1')->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true);

        for ($i = 1; $i <= 5; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }

        // 🔠 Header tabel
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

        // 📊 Isi data
        foreach ($groupedData as $kategori => $sub) {
            $sheet->setCellValue("A{$row}", strtoupper($kategori));
            $sheet->mergeCells("A{$row}:E{$row}");
            $sheet->getStyle("A{$row}")->getFont()->setBold(true)->setSize(11);
            $sheet->getStyle("A{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('D9E1F2');
            $row++;

            foreach ($sub as $subKategori => $items) {
                foreach ($items as $item) {
                    $budget = $item->budget_rapbs ?? 0;
                    $realisasi = $item->realisasi ?? 0;
                    $selisih = $item->selisih ?? 0;
                    $persen = $budget != 0 ? ($realisasi / $budget) * 100 : 0;

                    $sheet->setCellValue("A{$row}", $item->nama_akun ?? $item->nama_kegiatan);
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

        // 🔲 Border seluruh data
        $sheet->getStyle("A7:E" . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // 📐 Lebar kolom
        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);
        $sheet->getColumnDimension('C')->setAutoSize(true);
        $sheet->getColumnDimension('D')->setAutoSize(true);
        $sheet->getColumnDimension('E')->setWidth(36.5); // Kurang lebih 250px


        
        // 📄 Footer info
        $sheet->setCellValue("A{$row}", 'Sistem Informasi Akuntansi | ' . date('Y'));
        $sheet->mergeCells("A{$row}:E{$row}");
        $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // 📥 Output
        $fileName = 'Laporan_PRRA_' . date('d-m-Y', strtotime($start)) . '_sd_' . date('d-m-Y', strtotime($end)) . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"{$fileName}\"");
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }





}
