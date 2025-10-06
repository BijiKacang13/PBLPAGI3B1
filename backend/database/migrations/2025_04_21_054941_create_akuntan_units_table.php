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
        Schema::create('akuntan_unit', function (Blueprint $table) {
            $table->unsignedBigInteger('id_akuntan_unit')->primary(); // <-- Jadi primary key tapi bukan auto increment

            $table->string('email')->unique();;
            $table->string('telp')->unique();;

            $table->unsignedBigInteger('id_unit');
            $table->foreign('id_unit')->references('id_unit')->on('unit');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('akuntan_units');
    }
};
