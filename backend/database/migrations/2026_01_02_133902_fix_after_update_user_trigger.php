<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fix: Trigger after_update_user harus menggunakan @current_user_id saja,
     * TANPA fallback ke NEW.id_user agar log aktivitas mencatat user yang 
     * melakukan perubahan (admin), bukan user yang diubah.
     */
    public function up(): void
    {
        // Drop trigger lama
        DB::unprepared("DROP TRIGGER IF EXISTS after_update_user");

        // Buat trigger baru tanpa fallback ke NEW.id_user
        DB::unprepared("
            CREATE TRIGGER after_update_user
            AFTER UPDATE ON user
            FOR EACH ROW
            BEGIN
                -- Hanya log jika ada perubahan data penting (bukan remember_token)
                -- dan jika @current_user_id sudah di-set
                IF (@current_user_id IS NOT NULL) AND
                   (OLD.username != NEW.username OR 
                    OLD.nama != NEW.nama OR 
                    OLD.role != NEW.role OR 
                    OLD.password != NEW.password) THEN
                    
                    INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                    VALUES (
                        @current_user_id,
                        CONCAT('Mengubah Pengguna: ', NEW.nama, ' (', NEW.username, ')'),
                        NOW(),
                        NOW()
                    );
                END IF;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan trigger ke versi dengan fallback
        DB::unprepared("DROP TRIGGER IF EXISTS after_update_user");
        
        DB::unprepared("
            CREATE TRIGGER after_update_user
            AFTER UPDATE ON user
            FOR EACH ROW
            BEGIN
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
    }
};
