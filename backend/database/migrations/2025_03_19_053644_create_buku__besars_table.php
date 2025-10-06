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
        Schema::create('buku_besar', function (Blueprint $table) {
            $table->bigIncrements('id_buku_besar');

            $table->unsignedBigInteger('id_jurnal_umum');
            $table->foreign('id_jurnal_umum')->references('id_jurnal_umum')->on('jurnal_umum');

            $table->timestamps();


            $table->index('id_jurnal_umum');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buku_besar');
    }
};
