<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Arsip_Tahunan;
use App\Models\Jurnal_Umum;
use App\Models\Detail_Jurnal_Umum;
use App\Models\Akun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ArsipTahunanController extends Controller
{
    /**
     * GET /api/arsip-tahunan
     * Menampilkan daftar arsip per tahun
     */
    public function index()
    {
        try {
            $arsip = Arsip_Tahunan::orderBy('tahun', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $arsip
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data arsip: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/arsip-tahunan/tahun-tersedia
     * Menampilkan daftar tahun yang tersedia dari data transaksi
     */
    public function tahunTersedia()
    {
        try {
            // Cek apakah tabel arsip_tahunan sudah ada
            $tableExists = \Illuminate\Support\Facades\Schema::hasTable('arsip_tahunan');

            // Ambil tahun dari jurnal_umum
            $tahunDariTransaksi = Jurnal_Umum::selectRaw('DISTINCT YEAR(tanggal) as tahun')
                ->orderBy('tahun', 'desc')
                ->pluck('tahun')
                ->toArray();

            // Ambil tahun dari arsip (jika tabel ada)
            $tahunDariArsip = $tableExists ? Arsip_Tahunan::pluck('tahun')->toArray() : [];

            // Gabungkan dan urutkan
            $semuaTahun = array_unique(array_merge($tahunDariTransaksi, $tahunDariArsip));
            rsort($semuaTahun);

            // Tambahkan tahun sekarang jika belum ada
            $tahunSekarang = (int) date('Y');
            if (!in_array($tahunSekarang, $semuaTahun)) {
                array_unshift($semuaTahun, $tahunSekarang);
            }

            // Format dengan status
            $result = [];
            foreach ($semuaTahun as $tahun) {
                $arsip = $tableExists ? Arsip_Tahunan::where('tahun', $tahun)->first() : null;
                $jumlahTransaksi = Jurnal_Umum::whereYear('tanggal', $tahun)->count();

                $result[] = [
                    'tahun' => (int) $tahun,
                    'status' => $arsip ? $arsip->status : 'aktif',
                    'jumlah_transaksi' => $jumlahTransaksi,
                    'is_current' => $tahun == $tahunSekarang,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result,
                'tahun_aktif' => $tahunSekarang,
                'table_exists' => $tableExists
            ]);
        } catch (\Exception $e) {
            // Fallback: return current year only
            $tahunSekarang = (int) date('Y');
            return response()->json([
                'success' => true,
                'data' => [
                    [
                        'tahun' => $tahunSekarang,
                        'status' => 'aktif',
                        'jumlah_transaksi' => 0,
                        'is_current' => true,
                    ]
                ],
                'tahun_aktif' => $tahunSekarang,
                'table_exists' => false,
                'warning' => 'Tabel arsip_tahunan belum ada. Jalankan php artisan migrate.'
            ]);
        }
    }

    /**
     * GET /api/arsip-tahunan/{tahun}
     * Menampilkan detail arsip tahun tertentu
     */
    public function show($tahun)
    {
        try {
            $arsip = Arsip_Tahunan::where('tahun', $tahun)->first();

            if (!$arsip) {
                // Hitung data dari transaksi
                $data = $this->hitungRingkasanTahun($tahun);
                $data['status'] = 'aktif';
                $data['tahun'] = (int) $tahun;

                return response()->json([
                    'success' => true,
                    'data' => $data,
                    'from_archive' => false
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $arsip,
                'from_archive' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail arsip: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/arsip-tahunan/tutup-buku
     * Menutup buku tahun tertentu
     */
    public function tutupBuku(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'catatan' => 'nullable|string|max:1000',
        ]);

        $tahun = $request->tahun;
        $tahunSekarang = (int) date('Y');

        // Validasi: tidak bisa tutup tahun yang akan datang
        if ($tahun > $tahunSekarang) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menutup buku tahun yang akan datang'
            ], 400);
        }

        // Cek apakah sudah ada arsip untuk tahun ini
        $arsipExisting = Arsip_Tahunan::where('tahun', $tahun)->first();
        if ($arsipExisting && $arsipExisting->status !== 'aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Tahun ' . $tahun . ' sudah ditutup sebelumnya'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Hitung ringkasan keuangan tahun tersebut
            $ringkasan = $this->hitungRingkasanTahun($tahun);

            // Simpan atau update arsip
            $arsip = Arsip_Tahunan::updateOrCreate(
                ['tahun' => $tahun],
                [
                    'status' => 'ditutup',
                    'total_pendapatan' => $ringkasan['total_pendapatan'],
                    'total_beban' => $ringkasan['total_beban'],
                    'laba_rugi' => $ringkasan['laba_rugi'],
                    'total_aset' => $ringkasan['total_aset'],
                    'total_kewajiban' => $ringkasan['total_kewajiban'],
                    'total_ekuitas' => $ringkasan['total_ekuitas'],
                    'jumlah_transaksi' => $ringkasan['jumlah_transaksi'],
                    'tanggal_tutup_buku' => Carbon::now(),
                    'ditutup_oleh' => Auth::id(),
                    'catatan' => $request->catatan,
                ]
            );

            // Tandai semua jurnal tahun tersebut sebagai archived
            Jurnal_Umum::whereYear('tanggal', $tahun)
                ->update([
                    'is_archived' => true,
                    'tahun_anggaran' => $tahun
                ]);

            // Log aktivitas
            DB::table('log_activity')->insert([
                'id_user' => Auth::id(),
                'keterangan' => 'Menutup buku tahun ' . $tahun,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Buku tahun ' . $tahun . ' berhasil ditutup',
                'data' => $arsip
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menutup buku: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/arsip-tahunan/arsipkan
     * Mengarsipkan tahun yang sudah ditutup
     */
    public function arsipkan(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer',
        ]);

        $tahun = $request->tahun;

        $arsip = Arsip_Tahunan::where('tahun', $tahun)->first();
        if (!$arsip) {
            return response()->json([
                'success' => false,
                'message' => 'Tahun ' . $tahun . ' belum ditutup'
            ], 400);
        }

        if ($arsip->status !== 'ditutup') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya tahun dengan status "ditutup" yang dapat diarsipkan'
            ], 400);
        }

        $arsip->update(['status' => 'diarsipkan']);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ' . $tahun . ' berhasil diarsipkan',
            'data' => $arsip
        ]);
    }

    /**
     * Menghitung ringkasan keuangan tahun tertentu
     */
    private function hitungRingkasanTahun($tahun)
    {
        // Ambil ID jurnal yang sudah diposting untuk tahun ini
        $postedJurnalIds = Jurnal_Umum::where('is_posted', true)
            ->whereYear('tanggal', $tahun)
            ->pluck('id_jurnal_umum');

        // Hitung total pendapatan (kategori akun = 4)
        $totalPendapatan = Detail_Jurnal_Umum::whereIn('id_jurnal_umum', $postedJurnalIds)
            ->whereHas('akun.subKategoriAkun.kategoriAkun', function ($q) {
                $q->where('kategori_akun', 'like', '4%');
            })
            ->sum(DB::raw('kredit - debit'));

        // Hitung total beban (kategori akun = 5)
        $totalBeban = Detail_Jurnal_Umum::whereIn('id_jurnal_umum', $postedJurnalIds)
            ->whereHas('akun.subKategoriAkun.kategoriAkun', function ($q) {
                $q->where('kategori_akun', 'like', '5%');
            })
            ->sum(DB::raw('debit - kredit'));

        // Hitung total aset (kategori akun = 1)
        $totalAset = Akun::whereHas('subKategoriAkun.kategoriAkun', function ($q) {
                $q->where('kategori_akun', 'like', '1%');
            })
            ->sum(DB::raw('saldo_awal_debit - saldo_awal_kredit'))
            + Detail_Jurnal_Umum::whereIn('id_jurnal_umum', $postedJurnalIds)
                ->whereHas('akun.subKategoriAkun.kategoriAkun', function ($q) {
                    $q->where('kategori_akun', 'like', '1%');
                })
                ->sum(DB::raw('debit - kredit'));

        // Hitung total kewajiban (kategori akun = 2)
        $totalKewajiban = Akun::whereHas('subKategoriAkun.kategoriAkun', function ($q) {
                $q->where('kategori_akun', 'like', '2%');
            })
            ->sum(DB::raw('saldo_awal_kredit - saldo_awal_debit'))
            + Detail_Jurnal_Umum::whereIn('id_jurnal_umum', $postedJurnalIds)
                ->whereHas('akun.subKategoriAkun.kategoriAkun', function ($q) {
                    $q->where('kategori_akun', 'like', '2%');
                })
                ->sum(DB::raw('kredit - debit'));

        // Hitung total ekuitas (kategori akun = 3)
        $totalEkuitas = Akun::whereHas('subKategoriAkun.kategoriAkun', function ($q) {
                $q->where('kategori_akun', 'like', '3%');
            })
            ->sum(DB::raw('saldo_awal_kredit - saldo_awal_debit'))
            + Detail_Jurnal_Umum::whereIn('id_jurnal_umum', $postedJurnalIds)
                ->whereHas('akun.subKategoriAkun.kategoriAkun', function ($q) {
                    $q->where('kategori_akun', 'like', '3%');
                })
                ->sum(DB::raw('kredit - debit'));

        // Jumlah transaksi
        $jumlahTransaksi = Jurnal_Umum::whereYear('tanggal', $tahun)->count();

        return [
            'total_pendapatan' => abs($totalPendapatan),
            'total_beban' => abs($totalBeban),
            'laba_rugi' => $totalPendapatan - $totalBeban,
            'total_aset' => abs($totalAset),
            'total_kewajiban' => abs($totalKewajiban),
            'total_ekuitas' => abs($totalEkuitas),
            'jumlah_transaksi' => $jumlahTransaksi,
        ];
    }
}
