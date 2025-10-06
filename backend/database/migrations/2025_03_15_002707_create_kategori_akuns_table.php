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
        Schema::create('kategori_akun', function (Blueprint $table) {
            $table->bigIncrements('id_kategori_akun');
            $table->string('kode_kategori_akun')->unique();
            $table->string('kategori_akun');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori_akuns');
    }
};
