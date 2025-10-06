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
        Schema::create('hak_akses', function (Blueprint $table) {
            $table->bigIncrements('id_hak_akses');

            $table->unsignedBigInteger('id_akuntan_unit');
            $table->foreign('id_akuntan_unit')->references('id_akuntan_unit')->on('akuntan_unit');

            $table->boolean('view_rapbs_akun');
            $table->boolean('create_rapbs_akun');
            $table->boolean('update_rapbs_akun');

            $table->boolean('view_rapbs_kegiatan');
            $table->boolean('create_rapbs_kegiatan');
            $table->boolean('update_rapbs_kegiatan');

            $table->boolean('view_jurnal_umum');
            $table->boolean('create_jurnal_umum');
            $table->boolean('update_jurnal_umum');
            $table->boolean('delete_jurnal_umum');

            $table->boolean('view_buku_besar');
            $table->boolean('create_buku_besar');
            $table->boolean('delete_buku_besar');
            
            $table->boolean('view_laporan_komprehensif');
            $table->boolean('view_laporan_posisi_keuangan');
            $table->boolean('view_laporan_arus_kas');
            $table->boolean('view_laporan_perubahan_aset_neto');
            $table->boolean('view_laporan_catatan_atas_laporan_keuangan');
            $table->boolean('view_laporan_proyeksi_rencana_dan_realisasi_anggaran');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hak__akses');
    }
};
