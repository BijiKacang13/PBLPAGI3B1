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
        Schema::create('jurnal_umum', function (Blueprint $table) {
            $table->bigIncrements('id_jurnal_umum');
            $table->date('tanggal');
            $table->string('no_bukti')->unique();;
            $table->string('keterangan');
            $table->string('jenis_transaksi');

            $table->unsignedBigInteger('id_unit');
            $table->foreign('id_unit')->references('id_unit')->on('unit');

            $table->unsignedBigInteger('id_divisi');
            $table->foreign('id_divisi')->references('id_divisi')->on('divisi');

            $table->unsignedBigInteger('id_kegiatan')->nullable();
            $table->foreign('id_kegiatan')->references('id_kegiatan')->on('kegiatan');

            $table->unsignedBigInteger('id_sumber_anggaran')->nullable();
            $table->foreign('id_sumber_anggaran')->references('id_akun')->on('akun');

            $table->string('kode_sumbangan')->nullable();
            $table->string('kode_ph')->nullable();
            $table->timestamps();


            $table->index('tanggal');
            $table->index('id_unit');
            $table->index('id_divisi');
            $table->index('id_kegiatan'); 
            $table->index('id_sumber_anggaran');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jurnal_umum');
    }
};
