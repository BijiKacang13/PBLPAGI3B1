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
        Schema::create('budget_rapbs_akun', function (Blueprint $table) {
            $table->bigIncrements('id_budget_rapbs_akun');
            $table->unsignedBigInteger('id_akun');
            $table->unsignedBigInteger('id_unit'); // jika unit-specific
            $table->bigInteger('budget_rapbs_akun')->default(0);

            $table->timestamps();

            $table->foreign('id_akun')->references('id_akun')->on('akun')->onDelete('cascade');
            $table->foreign('id_unit')->references('id_unit')->on('unit')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget__rapbs__akuns');
    }
};
