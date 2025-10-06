<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // posisi keuangan
        DB::unprepared("
            DROP PROCEDURE IF EXISTS hitung_neraca;

            CREATE PROCEDURE hitung_neraca(
                IN p_start_date DATE,
                IN p_end_date DATE,
                IN p_id_unit INT,
                IN p_id_divisi INT
            )
            BEGIN
                CREATE TEMPORARY TABLE temp_neraca_result (
                    id_akun INT,
                    saldo_akhir DECIMAL(15,2),
                    periode_lalu DECIMAL(15,2),
                    kategori VARCHAR(50)
                );

                INSERT INTO temp_neraca_result
                SELECT 
                    a.id_akun,
                    CASE 
                        WHEN ka.kategori_akun = 'AKTIVA' THEN
                            (a.saldo_awal_debit + COALESCE(mutasi.debit, 0)) - 
                            (a.saldo_awal_kredit + COALESCE(mutasi.kredit, 0))
                        ELSE
                            (a.saldo_awal_kredit + COALESCE(mutasi.kredit, 0)) - 
                            (a.saldo_awal_debit + COALESCE(mutasi.debit, 0))
                    END,
                    CASE 
                        WHEN ka.kategori_akun = 'AKTIVA' THEN
                            a.saldo_awal_debit - a.saldo_awal_kredit
                        ELSE
                            a.saldo_awal_kredit - a.saldo_awal_debit
                    END,
                    ka.kategori_akun
                FROM akun a
                JOIN sub_kategori_akun ska ON a.id_sub_kategori_akun = ska.id_sub_kategori_akun
                JOIN kategori_akun ka ON ska.id_kategori_akun = ka.id_kategori_akun
                LEFT JOIN (
                    SELECT 
                        dju.id_akun,
                        SUM(CASE WHEN dju.debit_kredit = 'debit' THEN dju.nominal ELSE 0 END) AS debit,
                        SUM(CASE WHEN dju.debit_kredit = 'kredit' THEN dju.nominal ELSE 0 END) AS kredit
                    FROM detail_jurnal_umum dju
                    JOIN jurnal_umum ju ON dju.id_jurnal_umum = ju.id_jurnal_umum
                    WHERE EXISTS (
                        SELECT 1 FROM buku_besar bb
                        WHERE bb.id_jurnal_umum = ju.id_jurnal_umum
                    )
                    AND ju.tanggal BETWEEN p_start_date AND p_end_date
                    AND (p_id_unit IS NULL OR ju.id_unit = p_id_unit)
                    AND (p_id_divisi IS NULL OR ju.id_divisi = p_id_divisi)
                    GROUP BY dju.id_akun
                ) mutasi ON a.id_akun = mutasi.id_akun

                WHERE ka.kategori_akun IN ('AKTIVA', 'KEWAJIBAN', 'ASET NETO');

                SELECT * FROM temp_neraca_result;
                DROP TEMPORARY TABLE temp_neraca_result;
            END;
        ");

        //komrpe
        DB::unprepared("
            DROP PROCEDURE IF EXISTS hitung_komprehensif;

            CREATE PROCEDURE hitung_komprehensif(
                IN p_tanggal_mulai DATE,
                IN p_tanggal_selesai DATE,
                IN p_id_unit INT,
                IN p_id_divisi INT
            )
            BEGIN
                SELECT 
                    akun.kode_akun,
                    akun.akun AS nama_akun,
                    ska.kode_sub_kategori_akun,
                    ska.sub_kategori_akun,
                    kategori_akun.kategori_akun,

                    COALESCE(SUM(CASE 
                        WHEN dju.jenis_transaksi = 'tidak terikat' 
                            AND dju.debit_kredit = 
                                CASE 
                                    WHEN kategori_akun.kategori_akun = 'PENERIMAAN DAN SUMBANGAN' THEN 'kredit'
                                    ELSE 'debit'
                                END
                    THEN dju.nominal ELSE 0 END), 0) AS total_tanpa,

                    COALESCE(SUM(CASE 
                        WHEN dju.jenis_transaksi = 'terikat' 
                            AND dju.debit_kredit = 
                                CASE 
                                    WHEN kategori_akun.kategori_akun = 'PENERIMAAN DAN SUMBANGAN' THEN 'kredit'
                                    ELSE 'debit'
                                END
                    THEN dju.nominal ELSE 0 END), 0) AS total_dengan,

                    CASE 
                        WHEN kategori_akun.kategori_akun = 'PENERIMAAN DAN SUMBANGAN' 
                        THEN COALESCE(akun.saldo_awal_kredit, 0)
                        ELSE COALESCE(akun.saldo_awal_debit, 0)
                    END AS saldo_awal

                FROM akun
                JOIN sub_kategori_akun ska ON akun.id_sub_kategori_akun = ska.id_sub_kategori_akun
                JOIN kategori_akun ON ska.id_kategori_akun = kategori_akun.id_kategori_akun
                LEFT JOIN (
                    SELECT 
                        dju.id_akun, dju.nominal, dju.debit_kredit, ju.jenis_transaksi
                    FROM detail_jurnal_umum dju
                    JOIN jurnal_umum ju ON ju.id_jurnal_umum = dju.id_jurnal_umum
                    WHERE ju.tanggal BETWEEN p_tanggal_mulai AND p_tanggal_selesai
                        AND EXISTS (SELECT 1 FROM buku_besar bb WHERE bb.id_jurnal_umum = ju.id_jurnal_umum)
                        AND (p_id_unit IS NULL OR ju.id_unit = p_id_unit)
                        AND (p_id_divisi IS NULL OR ju.id_divisi = p_id_divisi)
                ) dju ON akun.id_akun = dju.id_akun

                WHERE kategori_akun.kategori_akun IN ('PENERIMAAN DAN SUMBANGAN', 'BEBAN')

                GROUP BY 
                    akun.id_akun, akun.kode_akun, akun.akun,
                    ska.kode_sub_kategori_akun, ska.sub_kategori_akun,
                    kategori_akun.kategori_akun,
                    akun.saldo_awal_kredit, akun.saldo_awal_debit

                ORDER BY 
                    kategori_akun.kategori_akun,
                    ska.kode_sub_kategori_akun,
                    akun.kode_akun;
            END;


        ");

        //prra kegiatan
        DB::unprepared("
            DROP PROCEDURE IF EXISTS hitung_prra_kegiatan;

            CREATE PROCEDURE hitung_prra_kegiatan(
                IN p_tanggal_mulai DATE,
                IN p_tanggal_selesai DATE,
                IN p_id_unit INT,
                IN p_id_divisi INT
            )
            BEGIN
                SELECT 
                    k.id_kegiatan,
                    k.kegiatan AS nama_kegiatan,
                    
                    -- Total realisasi dari jurnal umum dan detail
                    COALESCE(SUM(CASE 
                        WHEN dju.debit_kredit = 'debit' THEN dju.nominal 
                        ELSE 0 
                    END), 0) AS realisasi,

                    -- Budget RAPBS dari tabel budget_rapbs_kegiatan
                    COALESCE((
                        SELECT SUM(budget_rapbs_kegiatan)
                        FROM budget_rapbs_kegiatan brk
                        WHERE brk.id_kegiatan = k.id_kegiatan
                        AND (p_id_unit IS NULL OR brk.id_unit = p_id_unit)
                    ), 0) AS budget

                FROM kegiatan k
                LEFT JOIN jurnal_umum ju ON ju.id_kegiatan = k.id_kegiatan
                    AND ju.tanggal BETWEEN p_tanggal_mulai AND p_tanggal_selesai
                    AND (p_id_unit IS NULL OR ju.id_unit = p_id_unit)
                    AND (p_id_divisi IS NULL OR ju.id_divisi = p_id_divisi)
                    AND EXISTS (
                        SELECT 1 FROM buku_besar bb WHERE bb.id_jurnal_umum = ju.id_jurnal_umum
                    )
                LEFT JOIN detail_jurnal_umum dju ON dju.id_jurnal_umum = ju.id_jurnal_umum

                GROUP BY k.id_kegiatan, k.kegiatan
                ORDER BY k.kegiatan;
            END;
        ");

        // buku besar
        DB::unprepared("
            DROP PROCEDURE IF EXISTS laporan_buku_besar;
            CREATE PROCEDURE laporan_buku_besar(
                IN akun_id_param INT,
                IN start_date_param DATE,
                IN end_date_param DATE,
                IN id_unit_param INT,
                IN id_divisi_param INT
            )
            BEGIN
                SELECT 
                    ju.tanggal,
                    ju.no_bukti,
                    ju.keterangan,
                    dju.nominal,
                    dju.debit_kredit,
                    a.kode_akun,
                    a.akun AS akun,
                    u.unit AS unit,
                    d.divisi AS divisi,
                    ju.kode_sumbangan,
                    ju.kode_ph,
                    ju.id_jurnal_umum
                FROM detail_jurnal_umum dju
                JOIN jurnal_umum ju ON ju.id_jurnal_umum = dju.id_jurnal_umum
                JOIN buku_besar bb ON bb.id_jurnal_umum = ju.id_jurnal_umum -- hanya yang sudah diposting
                JOIN akun a ON a.id_akun = dju.id_akun
                LEFT JOIN unit u ON u.id_unit = ju.id_unit
                LEFT JOIN divisi d ON d.id_divisi = ju.id_divisi
                WHERE dju.id_akun = akun_id_param
                    AND ju.tanggal BETWEEN start_date_param AND end_date_param
                    AND (id_unit_param IS NULL OR ju.id_unit = id_unit_param)
                    AND (id_divisi_param IS NULL OR ju.id_divisi = id_divisi_param)
                ORDER BY ju.tanggal, ju.no_bukti;
            END;
        ");

        // aset neto
        DB::unprepared("
            DROP PROCEDURE IF EXISTS hitung_kenaikan_aset_neto;

            CREATE PROCEDURE hitung_kenaikan_aset_neto(
                IN start_date DATE,
                IN end_date DATE,
                IN unit_id BIGINT,
                IN divisi_id BIGINT
            )
            BEGIN
                DECLARE pendapatan_terikat BIGINT DEFAULT 0;
                DECLARE beban_terikat BIGINT DEFAULT 0;
                DECLARE pendapatan_tidak_terikat BIGINT DEFAULT 0;
                DECLARE beban_tidak_terikat BIGINT DEFAULT 0;
                DECLARE saldo_awal_pendapatan BIGINT DEFAULT 0;
                DECLARE saldo_awal_beban BIGINT DEFAULT 0;
                DECLARE total_raw BIGINT DEFAULT 0;
                DECLARE proporsi_terikat DECIMAL(10,4) DEFAULT 0;
                DECLARE proporsi_tidak_terikat DECIMAL(10,4) DEFAULT 0;
                DECLARE kenaikan_terikat BIGINT DEFAULT 0;
                DECLARE kenaikan_tidak_terikat BIGINT DEFAULT 0;

                -- Pendapatan Terikat
                SELECT SUM(dju.nominal) INTO pendapatan_terikat
                FROM detail_jurnal_umum dju
                JOIN jurnal_umum ju ON ju.id_jurnal_umum = dju.id_jurnal_umum
                JOIN akun a ON a.id_akun = dju.id_akun
                JOIN sub_kategori_akun sa ON sa.id_sub_kategori_akun = a.id_sub_kategori_akun
                JOIN kategori_akun ka ON ka.id_kategori_akun = sa.id_kategori_akun
                WHERE ju.jenis_transaksi = 'Terikat'
                AND ju.tanggal BETWEEN start_date AND end_date
                AND ka.kategori_akun = 'PENERIMAAN DAN SUMBANGAN'
                AND dju.debit_kredit = 'kredit'
                AND (unit_id IS NULL OR ju.id_unit = unit_id)
                AND (divisi_id IS NULL OR ju.id_divisi = divisi_id)
                AND EXISTS (
                    SELECT 1 FROM buku_besar bb WHERE bb.id_jurnal_umum = ju.id_jurnal_umum
                );

                -- Beban Terikat
                SELECT SUM(dju.nominal) INTO beban_terikat
                FROM detail_jurnal_umum dju
                JOIN jurnal_umum ju ON ju.id_jurnal_umum = dju.id_jurnal_umum
                JOIN akun a ON a.id_akun = dju.id_akun
                JOIN sub_kategori_akun sa ON sa.id_sub_kategori_akun = a.id_sub_kategori_akun
                JOIN kategori_akun ka ON ka.id_kategori_akun = sa.id_kategori_akun
                WHERE ju.jenis_transaksi = 'Terikat'
                AND ju.tanggal BETWEEN start_date AND end_date
                AND ka.kategori_akun = 'BEBAN'
                AND dju.debit_kredit = 'debit'
                AND (unit_id IS NULL OR ju.id_unit = unit_id)
                AND (divisi_id IS NULL OR ju.id_divisi = divisi_id)
                AND EXISTS (
                    SELECT 1 FROM buku_besar bb WHERE bb.id_jurnal_umum = ju.id_jurnal_umum
                );

                -- Pendapatan Tidak Terikat
                SELECT SUM(dju.nominal) INTO pendapatan_tidak_terikat
                FROM detail_jurnal_umum dju
                JOIN jurnal_umum ju ON ju.id_jurnal_umum = dju.id_jurnal_umum
                JOIN akun a ON a.id_akun = dju.id_akun
                JOIN sub_kategori_akun sa ON sa.id_sub_kategori_akun = a.id_sub_kategori_akun
                JOIN kategori_akun ka ON ka.id_kategori_akun = sa.id_kategori_akun
                WHERE ju.jenis_transaksi = 'Tidak Terikat'
                AND ju.tanggal BETWEEN start_date AND end_date
                AND ka.kategori_akun = 'PENERIMAAN DAN SUMBANGAN'
                AND dju.debit_kredit = 'kredit'
                AND (unit_id IS NULL OR ju.id_unit = unit_id)
                AND (divisi_id IS NULL OR ju.id_divisi = divisi_id)
                AND EXISTS (
                    SELECT 1 FROM buku_besar bb WHERE bb.id_jurnal_umum = ju.id_jurnal_umum
                );

                -- Beban Tidak Terikat
                SELECT SUM(dju.nominal) INTO beban_tidak_terikat
                FROM detail_jurnal_umum dju
                JOIN jurnal_umum ju ON ju.id_jurnal_umum = dju.id_jurnal_umum
                JOIN akun a ON a.id_akun = dju.id_akun
                JOIN sub_kategori_akun sa ON sa.id_sub_kategori_akun = a.id_sub_kategori_akun
                JOIN kategori_akun ka ON ka.id_kategori_akun = sa.id_kategori_akun
                WHERE ju.jenis_transaksi = 'Tidak Terikat'
                AND ju.tanggal BETWEEN start_date AND end_date
                AND ka.kategori_akun = 'BEBAN'
                AND dju.debit_kredit = 'debit'
                AND (unit_id IS NULL OR ju.id_unit = unit_id)
                AND (divisi_id IS NULL OR ju.id_divisi = divisi_id)
                AND EXISTS (
                    SELECT 1 FROM buku_besar bb WHERE bb.id_jurnal_umum = ju.id_jurnal_umum
                );

                -- Saldo Awal Pendapatan
                SELECT SUM(a.saldo_awal_kredit) INTO saldo_awal_pendapatan
                FROM akun a
                JOIN sub_kategori_akun sa ON sa.id_sub_kategori_akun = a.id_sub_kategori_akun
                JOIN kategori_akun ka ON ka.id_kategori_akun = sa.id_kategori_akun
                WHERE ka.kategori_akun = 'PENERIMAAN DAN SUMBANGAN';

                -- Saldo Awal Beban
                SELECT SUM(a.saldo_awal_debit) INTO saldo_awal_beban
                FROM akun a
                JOIN sub_kategori_akun sa ON sa.id_sub_kategori_akun = a.id_sub_kategori_akun
                JOIN kategori_akun ka ON ka.id_kategori_akun = sa.id_kategori_akun
                WHERE ka.kategori_akun = 'BEBAN';

                -- Hitung proporsi
                SET total_raw = pendapatan_terikat + pendapatan_tidak_terikat;

                IF total_raw > 0 THEN
                    SET proporsi_terikat = pendapatan_terikat / total_raw;
                    SET proporsi_tidak_terikat = pendapatan_tidak_terikat / total_raw;
                END IF;

                -- Hitung kenaikan
                SET kenaikan_terikat = pendapatan_terikat - beban_terikat + 
                    (saldo_awal_pendapatan * proporsi_terikat) - (saldo_awal_beban * proporsi_terikat);

                SET kenaikan_tidak_terikat = pendapatan_tidak_terikat - beban_tidak_terikat + 
                    (saldo_awal_pendapatan * proporsi_tidak_terikat) - (saldo_awal_beban * proporsi_tidak_terikat);

                -- Output hasil
                SELECT kenaikan_terikat AS terikat, kenaikan_tidak_terikat AS tidak_terikat;
            END;
        ");


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('all_procedure');
    }
};
