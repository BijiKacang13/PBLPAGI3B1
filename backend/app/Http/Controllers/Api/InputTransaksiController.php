<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Jurnal_Umum;
use App\Models\Detail_Jurnal_Umum;
use App\Models\Buku_Besar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class InputTransaksiController extends Controller
{
    public function formData()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Cek apakah tabel ada dan bisa diakses
            $unit = DB::table('unit')
                ->select('id_unit', 'kode_unit', 'unit')
                ->get();

            $divisi = DB::table('divisi')
                ->select('id_divisi', 'divisi')
                ->get();

            $kegiatan = DB::table('kegiatan')
                ->select('id_kegiatan', 'kode_kegiatan', 'kegiatan')
                ->get();

            $akun = DB::table('akun')
                ->select('id_akun', 'kode_akun', 'akun')
                ->get();

            $sumberAnggaran = DB::table('akun')
                ->select('id_akun', 'kode_akun', 'akun')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'role' => $user->role ?? null,
                    ],
                    'unit' => $unit,
                    'divisi' => $divisi,
                    'kegiatan' => $kegiatan,
                    'akun' => $akun,
                    'sumber_anggaran' => $sumberAnggaran,
                ]
            ], 200);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error in formData: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Database error',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);

        } catch (\Exception $e) {
            Log::error('Error in formData: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'tanggal' => 'required|date',
                'keterangan' => 'required|string',
                'jenis_transaksi' => 'required|in:Terikat,Tidak Terikat',
                'id_unit' => 'required|integer',
                'id_divisi' => 'required|integer',
                'id_kegiatan' => 'required|integer',
                'id_sumber_anggaran' => 'required|integer',
                'id_akun' => 'required|array|min:1',
                'id_akun.*' => 'required|integer',
                'debit' => 'required|array',
                'debit.*' => 'nullable|numeric|min:0',
                'kredit' => 'required|array',
                'kredit.*' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Cek apakah jumlah array sama
            if (count($request->id_akun) !== count($request->debit) || 
                count($request->id_akun) !== count($request->kredit)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah akun, debit, dan kredit tidak sesuai'
                ], 400);
            }

            DB::statement('SET @current_user_id = ?', [Auth::id()]);
            DB::beginTransaction();

            // Hitung total debit dan kredit
            $totalDebit = 0;
            $totalKredit = 0;

            foreach ($request->debit as $d) {
                // Handle string dengan pemisah ribuan
                $cleanValue = (float) preg_replace('/[^0-9.]/', '', $d);
                $totalDebit += $cleanValue;
            }

            foreach ($request->kredit as $k) {
                $cleanValue = (float) preg_replace('/[^0-9.]/', '', $k);
                $totalKredit += $cleanValue;
            }

            // Validasi balance
            if (abs($totalDebit - $totalKredit) > 0.01) { // Toleransi floating point
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => "Total debit (Rp " . number_format($totalDebit, 0, ',', '.') . 
                                ") dan kredit (Rp " . number_format($totalKredit, 0, ',', '.') . 
                                ") tidak seimbang"
                ], 400);
            }

            // Cek apakah minimal ada 1 debit dan 1 kredit yang tidak 0
            $hasDebit = false;
            $hasKredit = false;

            foreach ($request->debit as $d) {
                if ((float) preg_replace('/[^0-9.]/', '', $d) > 0) {
                    $hasDebit = true;
                    break;
                }
            }

            foreach ($request->kredit as $k) {
                if ((float) preg_replace('/[^0-9.]/', '', $k) > 0) {
                    $hasKredit = true;
                    break;
                }
            }

            if (!$hasDebit || !$hasKredit) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi harus memiliki minimal 1 debit dan 1 kredit'
                ], 400);
            }

            // Generate no_bukti (format: 0000001)
            $lastNumber = (int) Jurnal_Umum::max(DB::raw('CAST(no_bukti AS UNSIGNED)'));
            $noBukti = str_pad($lastNumber + 1, 7, '0', STR_PAD_LEFT);

            // Simpan HEADER JURNAL menggunakan Eloquent Model
            $jurnal = Jurnal_Umum::create([
                'tanggal' => $request->tanggal,
                'no_bukti' => $noBukti,
                'keterangan' => $request->keterangan,
                'jenis_transaksi' => $request->jenis_transaksi,
                'id_unit' => $request->id_unit,
                'id_divisi' => $request->id_divisi,
                'id_kegiatan' => $request->id_kegiatan,
                'id_sumber_anggaran' => $request->id_sumber_anggaran,
                'kode_sumbangan' => $request->kode_sumbangan ?? '',
                'kode_ph' => $request->kode_ph ?? '',
            ]);

            $jurnalId = $jurnal->id_jurnal_umum;

            // Simpan DETAIL JURNAL (nominal + debit_kredit)
            foreach ($request->id_akun as $i => $akunId) {
                $debitValue = (int) preg_replace('/\D/', '', $request->debit[$i]) ?: 0;
                $kreditValue = (int) preg_replace('/\D/', '', $request->kredit[$i]) ?: 0;

                // Insert debit entry if amount > 0
                if ($debitValue > 0) {
                    Detail_Jurnal_Umum::create([
                        'id_jurnal_umum' => $jurnalId,
                        'id_akun' => $akunId,
                        'nominal' => $debitValue,
                        'debit_kredit' => 'debit',
                    ]);
                }

                // Insert kredit entry if amount > 0
                if ($kreditValue > 0) {
                    Detail_Jurnal_Umum::create([
                        'id_jurnal_umum' => $jurnalId,
                        'id_akun' => $akunId,
                        'nominal' => $kreditValue,
                        'debit_kredit' => 'kredit',
                    ]);
                }
            }

            DB::commit();

            Log::info('Transaksi berhasil disimpan', [
                'jurnal_id' => $jurnalId,
                'user_id' => Auth::id(),
                'total_debit' => $totalDebit,
                'total_kredit' => $totalKredit,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'data' => [
                    'jurnal_id' => $jurnalId,
                    'total_debit' => $totalDebit,
                    'total_kredit' => $totalKredit,
                ]
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            Log::error('Database error in store: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Database error saat menyimpan transaksi',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in store: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan transaksi',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file_excel' => 'required|mimes:xlsx,xls|max:10240' // Max 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file_excel');
            
            // Load Excel file using PhpSpreadsheet
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            // Skip header row
            array_shift($rows);
            
            $successCount = 0;
            $failedRows = [];
            $user = Auth::user();
            
            // Get lookup tables
            $units = DB::table('unit')->pluck('id_unit', 'unit')->toArray();
            $divisis = DB::table('divisi')->pluck('id_divisi', 'divisi')->toArray();
            $kegiatans = DB::table('kegiatan')->get()->keyBy('kode_kegiatan');
            $akuns = DB::table('akun')->get()->keyBy('kode_akun');
            
            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2; // +2 because we skipped header and arrays are 0-indexed
                
                // Skip empty rows
                if (empty(array_filter($row))) {
                    Log::info("Import: Skipping empty row $rowNumber");
                    continue;
                }
                
                Log::info("Import: Processing row $rowNumber", ['row' => $row]);
                
                try {
                    // Parse row data (based on template structure)
                    // A=0:Tanggal, B=1:Keterangan, C=2:Jenis, D=3:Unit, E=4:Divisi, 
                    // F=5:Kegiatan, G=6:SumberAnggaran, H=7:KodeSumbangan, I=8:KodePH,
                    // J=9:AkunDebit, K=10:AkunKredit, L=11:Nominal
                    
                    $tanggalRaw = $row[0] ?? null;
                    $keterangan = $row[1] ?? null;
                    $jenisTransaksi = $row[2] ?? null;
                    $unitName = $row[3] ?? null;
                    $divisiName = $row[4] ?? null;
                    $kegiatanRaw = $row[5] ?? null;
                    $sumberAnggaranRaw = $row[6] ?? null;
                    $kodeSumbangan = $row[7] ?? null;
                    $kodePh = $row[8] ?? null;
                    $akunDebitRaw = $row[9] ?? null;
                    $akunKreditRaw = $row[10] ?? null;
                    $nominalRaw = $row[11] ?? 0;
                    
                    // Validate required fields
                    if (empty($tanggalRaw) || empty($keterangan)) {
                        $failedRows[] = "Baris $rowNumber: Tanggal dan Keterangan wajib diisi";
                        continue;
                    }
                    
                    // Parse date (support various formats)
                    $tanggal = $this->parseDate($tanggalRaw);
                    if (!$tanggal) {
                        $failedRows[] = "Baris $rowNumber: Format tanggal tidak valid";
                        continue;
                    }
                    
                    // Lookup Unit ID
                    $idUnit = $units[$unitName] ?? null;
                    if (!$idUnit && $unitName) {
                        // Try case-insensitive match
                        foreach ($units as $name => $id) {
                            if (strtolower(trim($name)) === strtolower(trim($unitName))) {
                                $idUnit = $id;
                                break;
                            }
                        }
                    }
                    
                    // Lookup Divisi ID
                    $idDivisi = $divisis[$divisiName] ?? null;
                    if (!$idDivisi && $divisiName) {
                        foreach ($divisis as $name => $id) {
                            if (strtolower(trim($name)) === strtolower(trim($divisiName))) {
                                $idDivisi = $id;
                                break;
                            }
                        }
                    }
                    
                    // Parse Kegiatan (format: "kode | nama")
                    $idKegiatan = null;
                    if ($kegiatanRaw) {
                        $kodeKegiatan = trim(explode('|', $kegiatanRaw)[0]);
                        if (isset($kegiatans[$kodeKegiatan])) {
                            $idKegiatan = $kegiatans[$kodeKegiatan]->id_kegiatan;
                        }
                    }
                    
                    // Parse Sumber Anggaran (format: "kode | nama")
                    $idSumberAnggaran = null;
                    if ($sumberAnggaranRaw) {
                        $kodeAkun = trim(explode('|', $sumberAnggaranRaw)[0]);
                        if (isset($akuns[$kodeAkun])) {
                            $idSumberAnggaran = $akuns[$kodeAkun]->id_akun;
                        }
                    }
                    
                    // Parse nominal
                    $nominal = $this->parseNominal($nominalRaw);
                    
                    // Parse Akun Debit - try multiple strategies
                    $idAkunDebit = null;
                    if ($akunDebitRaw) {
                        $idAkunDebit = $this->findAkunId($akunDebitRaw, $akuns);
                    }
                    
                    // Parse Akun Kredit - try multiple strategies
                    $idAkunKredit = null;
                    if ($akunKreditRaw) {
                        $idAkunKredit = $this->findAkunId($akunKreditRaw, $akuns);
                    }
                    
                    // Validate at least one akun
                    if (!$idAkunDebit && !$idAkunKredit) {
                        $debugMsg = "Baris $rowNumber: Akun tidak ditemukan.";
                        if ($akunDebitRaw) $debugMsg .= " Debit='$akunDebitRaw'";
                        if ($akunKreditRaw) $debugMsg .= " Kredit='$akunKreditRaw'";
                        $failedRows[] = $debugMsg;
                        continue;
                    }
                    
                    // Generate no_bukti
                    $lastJurnal = Jurnal_Umum::orderBy('id_jurnal_umum', 'desc')->first();
                    $lastNumber = $lastJurnal ? intval(substr($lastJurnal->no_bukti ?? '0000000', -7)) : 0;
                    $noBukti = str_pad($lastNumber + 1 + $successCount, 7, '0', STR_PAD_LEFT);
                    
                    DB::beginTransaction();
                    
                    // Set MySQL session variable for trigger (log_activity)
                    DB::statement('SET @current_user_id = ?', [Auth::id()]);
                    
                    // Create Jurnal Umum
                    $jurnal = Jurnal_Umum::create([
                        'tanggal' => $tanggal,
                        'no_bukti' => $noBukti,
                        'keterangan' => $keterangan,
                        'jenis_transaksi' => $jenisTransaksi,
                        'id_unit' => $idUnit,
                        'id_divisi' => $idDivisi,
                        'id_kegiatan' => $idKegiatan,
                        'id_sumber_anggaran' => $idSumberAnggaran,
                        'kode_sumbangan' => $kodeSumbangan,
                        'kode_ph' => $kodePh,
                    ]);
                    
                    // Create Detail entries
                    if ($idAkunDebit && $nominal > 0) {
                        Detail_Jurnal_Umum::create([
                            'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                            'id_akun' => $idAkunDebit,
                            'nominal' => $nominal,
                            'debit_kredit' => 'debit',
                        ]);
                    }
                    
                    if ($idAkunKredit && $nominal > 0) {
                        Detail_Jurnal_Umum::create([
                            'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                            'id_akun' => $idAkunKredit,
                            'nominal' => $nominal,
                            'debit_kredit' => 'kredit',
                        ]);
                    }
                    
                    // Auto-posting to Buku Besar
                    Buku_Besar::firstOrCreate(['id_jurnal_umum' => $jurnal->id_jurnal_umum]);
                    
                    DB::commit();
                    $successCount++;
                    
                } catch (\Exception $e) {
                    DB::rollBack();
                    $failedRows[] = "Baris $rowNumber: " . $e->getMessage();
                    Log::error("Import row $rowNumber error: " . $e->getMessage());
                }
            }
            
            $message = "$successCount transaksi berhasil diimport.";
            if (count($failedRows) > 0) {
                $message .= " " . count($failedRows) . " baris gagal.";
            }
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'success_count' => $successCount,
                    'failed_count' => count($failedRows),
                    'failed_rows' => array_slice($failedRows, 0, 10) // Show first 10 errors
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in import: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal import Excel: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
    
    private function parseDate($value)
    {
        if (empty($value)) return null;
        
        // If it's a numeric (Excel serial date)
        if (is_numeric($value)) {
            try {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        }
        
        // Try parsing as date string
        $formats = ['d-m-Y', 'd/m/Y', 'Y-m-d', 'd-M-Y', 'd M Y'];
        foreach ($formats as $format) {
            $date = \DateTime::createFromFormat($format, $value);
            if ($date) {
                return $date->format('Y-m-d');
            }
        }
        
        // Try strtotime
        $timestamp = strtotime($value);
        if ($timestamp) {
            return date('Y-m-d', $timestamp);
        }
        
        return null;
    }
    
  
    private function parseNominal($value)
    {
        if (empty($value)) return 0;
        
        // Remove non-numeric characters except dots and commas
        $cleaned = preg_replace('/[^0-9.,]/', '', $value);
        
        // Handle Indonesian format (1.000.000 or 1,000,000)
        if (substr_count($cleaned, '.') > 1) {
            $cleaned = str_replace('.', '', $cleaned);
        }
        if (substr_count($cleaned, ',') > 1) {
            $cleaned = str_replace(',', '', $cleaned);
        }
        
        // Replace comma with dot for decimal
        $cleaned = str_replace(',', '.', $cleaned);
        
        return floatval($cleaned);
    }
   
    private function findAkunId($rawValue, $akuns)
    {
        if (empty($rawValue)) return null;
        
        $rawValue = trim($rawValue);
        
        // Log for debugging
        Log::debug("findAkunId: Looking for '$rawValue'");
        
        // Strategy 1: Direct lookup by kode_akun
        if (isset($akuns[$rawValue])) {
            Log::debug("findAkunId: Found direct match for '$rawValue'");
            return $akuns[$rawValue]->id_akun;
        }
        
        // Strategy 2: Extract code from "kode | nama" or "kode|nama" format
        if (strpos($rawValue, '|') !== false) {
            $parts = explode('|', $rawValue);
            $code = trim($parts[0]);
            
            // Normalize the code (remove extra spaces)
            $code = preg_replace('/\s+/', '', $code);
            
            if (isset($akuns[$code])) {
                Log::debug("findAkunId: Found from pipe format: '$code'");
                return $akuns[$code]->id_akun;
            }
            
            // Try with original spacing
            $code = trim($parts[0]);
            if (isset($akuns[$code])) {
                Log::debug("findAkunId: Found from pipe format with spaces: '$code'");
                return $akuns[$code]->id_akun;
            }
        }
        
        // Strategy 3: Extract code that looks like account code (e.g., "1-1201", "4-1100")
        // Also handle hyphens that might be special characters
        $normalizedValue = str_replace(['–', '—', '−'], '-', $rawValue); // Replace special dashes
        
        if (preg_match('/(\d+)\s*[-–—−]\s*(\d+)/', $normalizedValue, $matches)) {
            $code = $matches[1] . '-' . $matches[2];
            Log::debug("findAkunId: Extracted code pattern: '$code'");
            
            if (isset($akuns[$code])) {
                Log::debug("findAkunId: Found from regex: '$code'");
                return $akuns[$code]->id_akun;
            }
        }
        
        // Strategy 4: Try each akun code with flexible matching
        foreach ($akuns as $kode => $akun) {
            // Check if the raw value starts with or contains the kode
            if (stripos($rawValue, $kode) === 0 || stripos($rawValue, $kode . ' ') !== false) {
                Log::debug("findAkunId: Found partial match with kode '$kode'");
                return $akun->id_akun;
            }
        }
        
        // Strategy 5: Try matching by name (case-insensitive)
        foreach ($akuns as $akun) {
            if (stripos($rawValue, $akun->akun) !== false || stripos($akun->akun, $rawValue) !== false) {
                Log::debug("findAkunId: Found by name match: '{$akun->akun}'");
                return $akun->id_akun;
            }
        }
        
        Log::warning("findAkunId: No match found for '$rawValue'");
        return null;
    }
}