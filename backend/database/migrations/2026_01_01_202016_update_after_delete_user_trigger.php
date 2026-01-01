<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing trigger
        DB::unprepared("DROP TRIGGER IF EXISTS after_delete_user");

        // Create new trigger with NULL check
        DB::unprepared("
            CREATE TRIGGER after_delete_user
            AFTER DELETE ON user
            FOR EACH ROW
            BEGIN
                -- Only insert log if current_user_id is set and not NULL
                IF @current_user_id IS NOT NULL THEN
                    INSERT INTO log_activity (id_user, keterangan, created_at, updated_at)
                    VALUES (
                        @current_user_id,
                        CONCAT('Menghapus Pengguna: ', OLD.nama, ' (', OLD.username, ')'),
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
        // Drop the trigger
        DB::unprepared("DROP TRIGGER IF EXISTS after_delete_user");
        
        // Recreate original trigger
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
    }
};
