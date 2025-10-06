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
        Schema::create('akun', function (Blueprint $table) {
            $table->bigIncrements('id_akun');
            $table->string('kode_akun')->unique();
            $table->string('akun');
            $table->biginteger('saldo_awal_debit');
            $table->biginteger('saldo_awal_kredit');
            // $table->biginteger('budget_rapbs');

            $table->unsignedBigInteger('id_sub_kategori_akun');
            $table->foreign('id_sub_kategori_akun')->references('id_sub_kategori_akun')->on('sub_kategori_akun');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('akun');
    }
};
