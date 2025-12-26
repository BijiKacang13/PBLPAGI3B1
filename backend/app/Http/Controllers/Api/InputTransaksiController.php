<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class InputTransaksiController extends Controller
{
    /**
     * ===========================
     * GET FORM DATA
     * ===========================
     */
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

    /**
     * ===========================
     * STORE JURNAL UMUM
     * ===========================
     */
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

            // Simpan HEADER JURNAL
            $jurnalId = DB::table('jurnal_umum')->insertGetId([
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan,
                'jenis_transaksi' => $request->jenis_transaksi,
                'id_unit' => $request->id_unit,
                'id_divisi' => $request->id_divisi,
                'id_kegiatan' => $request->id_kegiatan,
                'id_sumber_anggaran' => $request->id_sumber_anggaran,
                'created_by' => Auth::id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Simpan DETAIL JURNAL
            foreach ($request->id_akun as $i => $akunId) {
                $debitValue = (float) preg_replace('/[^0-9.]/', '', $request->debit[$i]);
                $kreditValue = (float) preg_replace('/[^0-9.]/', '', $request->kredit[$i]);

                DB::table('detail_jurnal_umum')->insert([
                    'id_jurnal_umum' => $jurnalId,
                    'id_akun' => $akunId,
                    'debit' => $debitValue,
                    'kredit' => $kreditValue,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
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

    /**
     * ===========================
     * IMPORT EXCEL
     * ===========================
     */
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

            // TODO: Implement Excel import logic
            
            return response()->json([
                'success' => true,
                'message' => 'Import Excel berhasil (stub - belum diimplementasi)'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in import: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal import Excel',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}