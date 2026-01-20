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
        // Tabel untuk menyimpan metadata arsip tahunan
        Schema::create('arsip_tahunan', function (Blueprint $table) {
            $table->id('id_arsip');
            $table->year('tahun')->unique();
            $table->enum('status', ['aktif', 'ditutup', 'diarsipkan'])->default('aktif');
            $table->decimal('total_pendapatan', 20, 2)->default(0);
            $table->decimal('total_beban', 20, 2)->default(0);
            $table->decimal('laba_rugi', 20, 2)->default(0);
            $table->decimal('total_aset', 20, 2)->default(0);
            $table->decimal('total_kewajiban', 20, 2)->default(0);
            $table->decimal('total_ekuitas', 20, 2)->default(0);
            $table->integer('jumlah_transaksi')->default(0);
            $table->date('tanggal_tutup_buku')->nullable();
            $table->unsignedBigInteger('ditutup_oleh')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // Tambah kolom tahun_anggaran dan is_archived di jurnal_umum
        Schema::table('jurnal_umum', function (Blueprint $table) {
            $table->year('tahun_anggaran')->nullable()->after('tanggal');
            $table->boolean('is_archived')->default(false)->after('tahun_anggaran');
            $table->index('tahun_anggaran');
            $table->index('is_archived');
        });

        // Update existing data: set tahun_anggaran from tanggal
        DB::statement("UPDATE jurnal_umum SET tahun_anggaran = YEAR(tanggal) WHERE tahun_anggaran IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jurnal_umum', function (Blueprint $table) {
            $table->dropIndex(['tahun_anggaran']);
            $table->dropIndex(['is_archived']);
            $table->dropColumn(['tahun_anggaran', 'is_archived']);
        });

        Schema::dropIfExists('arsip_tahunan');
    }
};
