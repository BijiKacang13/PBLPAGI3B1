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
        Schema::create('sub_kategori_akun', function (Blueprint $table) {
            $table->bigIncrements('id_sub_kategori_akun');
            $table->string('kode_sub_kategori_akun')->unique();;
            $table->string('sub_kategori_akun');

            $table->unsignedBigInteger('id_kategori_akun');
            $table->foreign('id_kategori_akun')->references('id_kategori_akun')->on('kategori_akun');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};