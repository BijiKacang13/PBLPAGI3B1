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
        Schema::create('detail_jurnal_umum', function (Blueprint $table) {
            $table->bigIncrements('id_detail_jurnal_umum');

            $table->unsignedBigInteger('id_jurnal_umum');
            $table->foreign('id_jurnal_umum')->references('id_jurnal_umum')->on('jurnal_umum');

            $table->unsignedBigInteger('id_akun');
            $table->foreign('id_akun')->references('id_akun')->on('akun');

            $table->bigInteger('nominal');
            $table->string('debit_kredit');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_jurnal_umum');
    }
};
