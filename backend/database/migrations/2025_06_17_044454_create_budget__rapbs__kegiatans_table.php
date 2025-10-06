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
        Schema::create('budget_rapbs_kegiatan', function (Blueprint $table) {
            $table->bigIncrements('id_budget_rapbs_kegiatan');
            $table->unsignedBigInteger('id_kegiatan');
            $table->unsignedBigInteger('id_unit'); // jika unit-specific
            $table->bigInteger('budget_rapbs_kegiatan')->default(0);

            $table->timestamps();

            $table->foreign('id_kegiatan')->references('id_kegiatan')->on('kegiatan')->onDelete('cascade');
            $table->foreign('id_unit')->references('id_unit')->on('unit')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget__rapbs__kegiatans');
    }
};
