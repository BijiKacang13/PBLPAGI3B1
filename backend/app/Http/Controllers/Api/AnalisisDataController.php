<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalisisDataController extends Controller
{
    /**
     * Endpoint utama analisis data keuangan
     */
    public function index(Request $request)
    {
        // Ambil tahun dari query param, default = tahun sekarang
        $tahun = $request->get('tahun', date('Y'));

        /**
         * =========================
         * LAPORAN KOMPREHENSIF
         * =========================
         */

        // Total Penerimaan dan Sumbangan
        $pendapatan = $this->totalByKategori(
            'PENERIMAAN DAN SUMBANGAN',
            $tahun
        );

        // Total Beban
        $beban = $this->totalByKategori(
            'BEBAN',
            $tahun
        );

        // Laba Bersih
        $labaBersih = $pendapatan - $beban;

        /**
         * =========================
         * LAPORAN NERACA
         * =========================
         */

        // Total Aktiva
        $totalAktiva = $this->totalByKategori(
            'AKTIVA',
            $tahun
        );

        // Total Kewajiban
        $totalKewajiban = $this->totalByKategori(
            'KEWAJIBAN',
            $tahun
        );

        // Total Aset Neto (Modal)
        $asetNeto = $this->totalByKategori(
            'ASET NETO',
            $tahun
        );

        /**
         * =========================
         * RESPONSE API
         * =========================
         */
        return response()->json([
            'tahun' => (int) $tahun,

            'laporan_komprehensif' => [
                'pendapatan_dan_sumbangan' => $pendapatan,
                'beban' => $beban,
                'laba_bersih' => $labaBersih,
            ],

            'neraca' => [
                'aktiva' => $totalAktiva,
                'kewajiban' => $totalKewajiban,
                'aset_neto' => $asetNeto,
            ],
        ]);
    }

    /**
     * =====================================================
     * HELPER FUNCTION
     * =====================================================
     * Menghitung total nominal berdasarkan:
     * - kategori akun
     * - tahun jurnal
     *
     * @param string $kategoriAkun
     * @param int $tahun
     * @return float|int
     */
    private function totalByKategori(string $kategoriAkun, int $tahun)
    {
        return Detail_Jurnal_Umum::whereHas(
            'akun.subKategori.kategori_akun',
            function ($query) use ($kategoriAkun) {
                $query->where('kategori_akun', $kategoriAkun);
            }
        )
        ->whereHas(
            'jurnal_umum',
            function ($query) use ($tahun) {
                $query->whereYear('tanggal', $tahun);
            }
        )
        ->sum(DB::raw("
            CASE
                WHEN debit_kredit = 'debit' THEN nominal
                ELSE -nominal
            END
        "));
    }
}
