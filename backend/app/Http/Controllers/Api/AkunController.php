<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Akun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;


class AkunController extends Controller
{
    // =========================================================
    // GET /api/akun
    // =========================================================
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Akun::with('subKategori')
            ->select(
                'id_akun',
                'kode_akun',
                'akun',
                'saldo_awal_debit',
                'saldo_awal_kredit',
                'id_sub_kategori_akun'
            );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_akun', 'like', "%$search%")
                  ->orWhere('akun', 'like', "%$search%");
            });
        }

        $data = $query->orderBy('kode_akun')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $data
        ]);
    }

    // =========================================================
    // POST /api/akun
    // =========================================================
    public function store(Request $request)
    {
        DB::statement('SET @current_user_id = ?', [auth()->id()]);

        $request->merge([
            'saldo_awal_debit'  => str_replace('.', '', $request->saldo_awal_debit),
            'saldo_awal_kredit' => str_replace('.', '', $request->saldo_awal_kredit),
        ]);

        $validated = $request->validate([
            'id_sub_kategori_akun' => 'required|exists:sub_kategori_akun,id_sub_kategori_akun',
            'kode_akun'            => 'required|string|max:255|unique:akun,kode_akun',
            'akun'                 => 'required|string|max:255',
            'saldo_awal_debit'     => 'required|numeric',
            'saldo_awal_kredit'    => 'required|numeric',
        ]);

        $akun = Akun::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun berhasil dibuat.',
            'data'    => $akun
        ], 201);
    }

    // =========================================================
    // PUT /api/akun/{id}
    // =========================================================
    public function update(Request $request, $id)
    {
        DB::statement('SET @current_user_id = ?', [auth()->id()]);

        $request->merge([
            'saldo_awal_debit'  => str_replace('.', '', $request->saldo_awal_debit),
            'saldo_awal_kredit' => str_replace('.', '', $request->saldo_awal_kredit),
        ]);

        $validated = $request->validate([
            'id_sub_kategori_akun' => 'required|exists:sub_kategori_akun,id_sub_kategori_akun',
            'kode_akun'            => 'required|string|max:255|unique:akun,kode_akun,' . $id . ',id_akun',
            'akun'                 => 'required|string|max:255|unique:akun,akun,' . $id . ',id_akun',
            'saldo_awal_debit'     => 'required|numeric',
            'saldo_awal_kredit'    => 'required|numeric',
        ]);

        $akun = Akun::findOrFail($id);
        $akun->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun berhasil diperbarui.',
            'data'    => $akun
        ]);
    }

    // =========================================================
    // DELETE /api/akun/{id}
    // =========================================================
    public function destroy($id)
    {
        DB::statement('SET @current_user_id = ?', [auth()->id()]);
        
        $akun = Akun::findOrFail($id);
        $akun->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun berhasil dihapus.'
        ]);
    }

    // =========================================================
    // POST /api/akun/import
    // =========================================================
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        try {
            DB::statement('SET @current_user_id = ?', [auth()->id()]);
            
            $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
            $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

            $createdCount = 0;
            $updatedCount = 0;
            $skippedCount = 0;
            $failedCount = 0;
            $failedRows = [];
            $isFirstRow = true;

            DB::transaction(function () use ($rows, &$createdCount, &$updatedCount, &$skippedCount, &$failedCount, &$failedRows, &$isFirstRow) {
                foreach ($rows as $index => $row) {
                    // Skip header row (first row)
                    if ($isFirstRow) {
                        $isFirstRow = false;
                        continue;
                    }

                    // Template format: A=SubKategori, B=KodeAkun, C=NamaAkun, D=SaldoDebit, E=SaldoKredit
                    $subKategoriInput = trim($row['A'] ?? '');
                    $kodeAkun = trim($row['B'] ?? '');
                    $namaAkun = trim($row['C'] ?? '');
                    
                    // Skip empty rows
                    if (empty($kodeAkun)) {
                        continue;
                    }
                    
                    // Handle numeric values
                    $saldoDebitRaw = $row['D'] ?? null;
                    $saldoKreditRaw = $row['E'] ?? null;
                    
                    // Parse saldo values - handle various formats
                    $saldoDebit = null;
                    $saldoKredit = null;
                    
                    if ($saldoDebitRaw !== null && $saldoDebitRaw !== '' && $saldoDebitRaw !== '-' && trim($saldoDebitRaw) !== '-') {
                        if (is_numeric($saldoDebitRaw)) {
                            $saldoDebit = (float) $saldoDebitRaw;
                        } else {
                            $cleaned = preg_replace('/[^0-9]/', '', $saldoDebitRaw);
                            $saldoDebit = $cleaned !== '' ? (float) $cleaned : null;
                        }
                    }
                    
                    if ($saldoKreditRaw !== null && $saldoKreditRaw !== '' && $saldoKreditRaw !== '-' && trim($saldoKreditRaw) !== '-') {
                        if (is_numeric($saldoKreditRaw)) {
                            $saldoKredit = (float) $saldoKreditRaw;
                        } else {
                            $cleaned = preg_replace('/[^0-9]/', '', $saldoKreditRaw);
                            $saldoKredit = $cleaned !== '' ? (float) $cleaned : null;
                        }
                    }

                    // Check if account already exists
                    $existingAkun = Akun::where('kode_akun', $kodeAkun)->first();

                    if ($existingAkun) {
                        // Account exists - only update if saldo values are provided and different
                        $needsUpdate = false;
                        $updateData = [];
                        
                        if ($saldoDebit !== null && $existingAkun->saldo_awal_debit != $saldoDebit) {
                            $updateData['saldo_awal_debit'] = $saldoDebit;
                            $needsUpdate = true;
                        }
                        
                        if ($saldoKredit !== null && $existingAkun->saldo_awal_kredit != $saldoKredit) {
                            $updateData['saldo_awal_kredit'] = $saldoKredit;
                            $needsUpdate = true;
                        }
                        
                        if ($needsUpdate) {
                            $existingAkun->update($updateData);
                            $updatedCount++;
                        } else {
                            $skippedCount++;
                        }
                    } else {
                        // Account doesn't exist - create new
                        if (empty($namaAkun)) {
                            $failedCount++;
                            $failedRows[] = "Baris $index: Nama akun kosong untuk akun baru";
                            continue;
                        }

                        // Find sub kategori
                        $subKategori = null;
                        
                        if (!empty($subKategoriInput)) {
                            $subKategori = DB::table('sub_kategori_akun')
                                ->where('sub_kategori_akun', 'like', '%' . $subKategoriInput . '%')
                                ->first();
                                
                            if (!$subKategori) {
                                $subKategori = DB::table('sub_kategori_akun')
                                    ->where('kode_sub_kategori_akun', $subKategoriInput)
                                    ->first();
                            }
                        }
                        
                        if (!$subKategori) {
                            $subKategori = DB::table('sub_kategori_akun')->first();
                        }
                        
                        if (!$subKategori) {
                            $failedCount++;
                            $failedRows[] = "Baris $index: Sub kategori tidak ditemukan";
                            continue;
                        }

                        Akun::create([
                            'kode_akun' => $kodeAkun,
                            'akun' => $namaAkun,
                            'id_sub_kategori_akun' => $subKategori->id_sub_kategori_akun,
                            'saldo_awal_debit' => $saldoDebit ?? 0,
                            'saldo_awal_kredit' => $saldoKredit ?? 0,
                        ]);
                        $createdCount++;
                    }
                }
            });

            $totalSuccess = $createdCount + $updatedCount;
            $message = "Import selesai: ";
            $details = [];
            
            if ($createdCount > 0) $details[] = "$createdCount akun baru";
            if ($updatedCount > 0) $details[] = "$updatedCount diupdate";
            if ($skippedCount > 0) $details[] = "$skippedCount tidak berubah";
            if ($failedCount > 0) $details[] = "$failedCount gagal";
            
            $message .= implode(', ', $details);

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'success_count' => $totalSuccess,
                    'created_count' => $createdCount,
                    'updated_count' => $updatedCount,
                    'skipped_count' => $skippedCount,
                    'failed_count' => $failedCount,
                    'failed_rows' => $failedRows
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Import Akun Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal import: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================================================
    // GET /api/akun/export
    // =========================================================
    public function exportExcel()
    {
        $akuns = Akun::with('subKategori')->orderBy('kode_akun')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $sheet->setCellValue('A1', 'Kode Akun');
        $sheet->setCellValue('B1', 'Nama Akun');
        $sheet->setCellValue('C1', 'Kode Sub Kategori');
        $sheet->setCellValue('D1', 'Saldo Awal Debit');
        $sheet->setCellValue('E1', 'Saldo Awal Kredit');

        // Style header
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);

        // Data
        $row = 2;
        foreach ($akuns as $akun) {
            $sheet->setCellValue('A' . $row, $akun->kode_akun);
            $sheet->setCellValue('B' . $row, $akun->akun);
            $sheet->setCellValue('C' . $row, $akun->subKategori->kode_sub_kategori_akun ?? '');
            $sheet->setCellValue('D' . $row, $akun->saldo_awal_debit);
            $sheet->setCellValue('E' . $row, $akun->saldo_awal_kredit);
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = 'Data_Akun_' . date('Y-m-d_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
