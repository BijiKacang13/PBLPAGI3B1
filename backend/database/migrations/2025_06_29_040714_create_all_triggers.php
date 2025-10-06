<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        // Kategori akun --------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_kategori_akun
            AFTER INSERT ON kategori_akun
            FOR EACH ROW
            BEGIN
            IF @current_user_id IS NOT NULL THEN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menambah Kategori Akun: ', NEW.kode_kategori_akun, ' - ', NEW.kategori_akun),
                    NOW(),
                    NOW()
                );
            END IF;
            END
        ");

        DB::unprepared("
            CREATE TRIGGER after_update_kategori_akun
            AFTER UPDATE ON kategori_akun
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Mengubah Kategori Akun: ', OLD.kode_kategori_akun, ' - ', OLD.kategori_akun,
                        ' menjadi ', NEW.kode_kategori_akun, ' - ', NEW.kategori_akun),
                    NOW(),
                    NOW()
                );
            END
        ");

        DB::unprepared("
            CREATE TRIGGER after_delete_kategori_akun
            AFTER DELETE ON kategori_akun
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menghapus Kategori Akun: ', OLD.kode_kategori_akun, ' - ', OLD.kategori_akun),
                    NOW(),
                    NOW()
                );
            END
        ");






        //Sub Kategori akun --------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_sub_kategori_akun
            AFTER INSERT ON sub_kategori_akun
            FOR EACH ROW
            BEGIN
            IF @current_user_id IS NOT NULL THEN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menambah Sub Kategori Akun: ', NEW.kode_sub_kategori_akun, ' - ', NEW.sub_kategori_akun),
                    NOW(),
                    NOW()
                );
            END IF;
            END 
        ");

        DB::unprepared("
            CREATE TRIGGER after_update_sub_kategori_akun
            AFTER UPDATE ON sub_kategori_akun
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT(
                        'Mengubah Sub Kategori Akun: ',
                        OLD.kode_sub_kategori_akun, ' - ', OLD.sub_kategori_akun,
                        ' menjadi ',
                        NEW.kode_sub_kategori_akun, ' - ', NEW.sub_kategori_akun
                    ),
                    NOW(),
                    NOW()
                );
            END 
        ");
        

        DB::unprepared("
            CREATE TRIGGER after_delete_sub_kategori_akun
            AFTER DELETE ON sub_kategori_akun
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menghapus Sub Kategori Akun: ', OLD.kode_sub_kategori_akun, ' - ', OLD.sub_kategori_akun),
                    NOW(),
                    NOW()
                );
            END 
        ");




        //Akun --------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_akun
            AFTER INSERT ON akun
            FOR EACH ROW
            BEGIN
            IF @current_user_id IS NOT NULL THEN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT(
                        'Menambah Akun: ',
                        NEW.kode_akun, ' - ', NEW.akun,
                        ' | Saldo Awal (D: ', NEW.saldo_awal_debit,
                        ', K: ', NEW.saldo_awal_kredit, ')'
                    ),
                    NOW(),
                    NOW()
                );
            END IF;
            END 
        ");
        DB::unprepared("
            CREATE TRIGGER after_update_akun
            AFTER UPDATE ON akun
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT(
                        'Mengubah Akun: ',
                        OLD.kode_akun, ' - ', OLD.akun,
                        ' | Saldo Awal (D: ', OLD.saldo_awal_debit, ', K: ', OLD.saldo_awal_kredit, ')',
                        ' menjadi ',
                        NEW.kode_akun, ' - ', NEW.akun,
                        ' | Saldo Awal (D: ', NEW.saldo_awal_debit, ', K: ', NEW.saldo_awal_kredit, ')'
                    ),
                    NOW(),
                    NOW()
                );
            END 
        ");
        DB::unprepared("
            CREATE TRIGGER after_delete_akun
            AFTER DELETE ON akun
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT(
                        'Menghapus Akun: ',
                        OLD.kode_akun, ' - ', OLD.akun,
                        ' | Saldo Awal (D: ', OLD.saldo_awal_debit,
                        ', K: ', OLD.saldo_awal_kredit, ')'
                    ),
                    NOW(),
                    NOW()
                );
            END 
        ");




        //RAPBS Akun --------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_budget_rapbs_akun
            AFTER INSERT ON budget_rapbs_akun
            FOR EACH ROW
            BEGIN
                DECLARE kodeAkun VARCHAR(255);
                DECLARE namaAkun VARCHAR(255);
                DECLARE namaUnit VARCHAR(255);

                -- Ambil dari tabel akun
                SELECT kode_akun, akun INTO kodeAkun, namaAkun
                FROM akun WHERE id_akun = NEW.id_akun;

                -- Ambil dari tabel unit (Bukan dari budget_rapbs_akun!)
                SELECT unit INTO namaUnit
                FROM unit WHERE id_unit = NEW.id_unit;

                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menambah Budget RAPBS: ', kodeAkun, ' - ', namaAkun,
                        ' untuk Unit ', namaUnit,
                        ' = Rp', FORMAT(NEW.budget_rapbs_akun, 0)),
                    NOW(), NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_update_budget_rapbs_akun
            AFTER UPDATE ON budget_rapbs_akun
            FOR EACH ROW
            BEGIN
                DECLARE kodeAkun VARCHAR(255);
                DECLARE namaAkun VARCHAR(255);
                DECLARE namaUnit VARCHAR(255);

                -- Ambil info akun
                SELECT kode_akun, akun INTO kodeAkun, namaAkun
                FROM akun WHERE id_akun = NEW.id_akun;

                -- Ambil info unit
                SELECT unit INTO namaUnit
                FROM unit WHERE id_unit = NEW.id_unit;

                -- Simpan log perubahan
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT(
                        'Mengubah Budget RAPBS: ', kodeAkun, ' - ', namaAkun,
                        ' untuk Unit ', namaUnit,
                        ' dari Rp', FORMAT(OLD.budget_rapbs_akun, 0),
                        ' menjadi Rp', FORMAT(NEW.budget_rapbs_akun, 0)
                    ),
                    NOW(), NOW()
                );
            END
        ");





        // RAPBS Kegiatan ------------------------------------------------------------------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_budget_rapbs_kegiatan
            AFTER INSERT ON budget_rapbs_kegiatan
            FOR EACH ROW
            BEGIN
                DECLARE kodeKegiatan VARCHAR(255);
                DECLARE namaKegiatan VARCHAR(255);
                DECLARE namaUnit VARCHAR(255);

                -- Ambil info kegiatan
                SELECT kode_kegiatan, kegiatan INTO kodeKegiatan, namaKegiatan
                FROM kegiatan WHERE id_kegiatan = NEW.id_kegiatan;

                -- Ambil info unit
                SELECT unit INTO namaUnit
                FROM unit WHERE id_unit = NEW.id_unit;

                -- Insert log aktivitas
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT(
                        'Menambah Budget RAPBS Kegiatan: ', kodeKegiatan, ' - ', namaKegiatan,
                        ' untuk Unit ', namaUnit,
                        ' = Rp', FORMAT(NEW.budget_rapbs_kegiatan, 0)
                    ),
                    NOW(), NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_update_budget_rapbs_kegiatan
            AFTER UPDATE ON budget_rapbs_kegiatan
            FOR EACH ROW
            BEGIN
                DECLARE kodeKegiatan VARCHAR(255);
                DECLARE namaKegiatan VARCHAR(255);
                DECLARE namaUnit VARCHAR(255);

                -- Ambil info kegiatan
                SELECT kode_kegiatan, kegiatan INTO kodeKegiatan, namaKegiatan
                FROM kegiatan WHERE id_kegiatan = NEW.id_kegiatan;

                -- Ambil info unit
                SELECT unit INTO namaUnit
                FROM unit WHERE id_unit = NEW.id_unit;

                -- Insert log aktivitas perubahan
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT(
                        'Mengubah Budget RAPBS Kegiatan: ', kodeKegiatan, ' - ', namaKegiatan,
                        ' untuk Unit ', namaUnit,
                        ' dari Rp', FORMAT(OLD.budget_rapbs_kegiatan, 0),
                        ' menjadi Rp', FORMAT(NEW.budget_rapbs_kegiatan, 0)
                    ),
                    NOW(), NOW()
                );
            END
        ");



        // CALK ------------------------------------------------------------------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_calk
            AFTER INSERT ON calk
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menambahkan CALK: ', NEW.keterangan),
                    NOW(), NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_update_calk
            AFTER UPDATE ON calk
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Mengubah CALK: ', OLD.keterangan, ' → ', NEW.keterangan),
                    NOW(), NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_delete_calk
            AFTER DELETE ON calk
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menghapus CALK: ', OLD.keterangan),
                    NOW(), NOW()
                );
            END
        ");



        // SOP ------------------------------------------------------------------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_sop
            AFTER INSERT ON sop
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menambahkan SOP: ', NEW.keterangan),
                    NOW(), NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_update_sop
            AFTER UPDATE ON sop
            FOR EACH ROW
            BEGIN
                IF OLD.keterangan != NEW.keterangan THEN
                    INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                    VALUES (
                        @current_user_id,
                        CONCAT('Mengubah SOP: ', OLD.keterangan, ' → ', NEW.keterangan),
                        NOW(), NOW()
                    );
                END IF;
            END;
        ");
        DB::unprepared("
            CREATE TRIGGER after_delete_sop
            AFTER DELETE ON sop
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menghapus SOP: ', OLD.keterangan),
                    NOW(), NOW()
                );
            END
        ");



        // Jurnal Umum ------------------------------------------------------------------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_jurnal
            AFTER INSERT ON jurnal_umum
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menambah Jurnal: ', NEW.no_bukti, ' - ', NEW.keterangan),
                    NOW(),
                    NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_update_jurnal
            AFTER UPDATE ON jurnal_umum
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Memperbarui Jurnal: ', NEW.no_bukti, ' - ', NEW.keterangan),
                    NOW(),
                    NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_delete_jurnal
            AFTER DELETE ON jurnal_umum
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menghapus Jurnal: ', OLD.no_bukti, ' - ', OLD.keterangan),
                    NOW(),
                    NOW()
                );
            END
        ");



        // User -----------------------------------------------------------------------------------------------------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_user
            AFTER INSERT ON user
            FOR EACH ROW
            BEGIN
            IF @current_user_id IS NOT NULL THEN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menambah Pengguna: ', NEW.nama, ' (', NEW.username, ')'),
                    NOW(),
                    NOW()
                );
            END IF;
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_update_user
            AFTER UPDATE ON user
            FOR EACH ROW
            BEGIN
                -- Hanya log jika ada perubahan data penting (bukan remember_token)
                IF (OLD.username != NEW.username OR 
                    OLD.nama != NEW.nama OR 
                    OLD.role != NEW.role OR 
                    OLD.password != NEW.password) THEN
                    
                    INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                    VALUES (
                        COALESCE(@current_user_id, NEW.id_user),
                        CONCAT('Mengubah Pengguna: ', NEW.nama, ' (', NEW.username, ')'),
                        NOW(),
                        NOW()
                    );
                END IF;
            END
        ");
        DB::unprepared("
            CREATE TRIGGER after_delete_user
            AFTER DELETE ON user
            FOR EACH ROW
            BEGIN
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Menghapus Pengguna: ', OLD.nama, ' (', OLD.username, ')'),
                    NOW(),
                    NOW()
                );
            END
        ");



        // Buku Besar -----------------------------------------------------------------------------------------------------------------------------------------
        DB::unprepared("
            CREATE TRIGGER after_insert_buku_besar
            AFTER INSERT ON buku_besar
            FOR EACH ROW
            BEGIN
                DECLARE v_no_bukti VARCHAR(50);
                DECLARE v_keterangan TEXT;
                -- Ambil data dari jurnal_umum berdasarkan ID
                SELECT no_bukti, keterangan
                INTO v_no_bukti, v_keterangan
                FROM jurnal_umum
                WHERE id_jurnal_umum = NEW.id_jurnal_umum;
                -- Masukkan log aktivitas
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Memposting: ', v_no_bukti, ' - ', v_keterangan),
                    NOW(),
                    NOW()
                );
            END
        ");
        DB::unprepared("
            CREATE TRIGGER trg_after_delete_buku_besar
            AFTER DELETE ON buku_besar
            FOR EACH ROW
            BEGIN
                DECLARE v_no_bukti VARCHAR(50);
                DECLARE v_keterangan TEXT;
                -- Ambil no_bukti dan keterangan dari jurnal_umum berdasarkan id_jurnal_umum yang dihapus
                SELECT no_bukti, keterangan
                INTO v_no_bukti, v_keterangan
                FROM jurnal_umum
                WHERE id_jurnal_umum = OLD.id_jurnal_umum;
                -- Simpan ke log_activity
                INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                VALUES (
                    @current_user_id,
                    CONCAT('Un-Posting : ', v_no_bukti, ' - ', v_keterangan),
                    NOW(),
                    NOW()
                );
            END
        ");

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('all_triggers');
    }
};
