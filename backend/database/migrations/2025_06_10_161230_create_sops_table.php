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

    Schema::create('sop', function (Blueprint $table) {
        $table->bigIncrements('id_sop');
        $table->integer('urutan')->default(0);
        $table->string('keterangan');               
        $table->string('file')->unique();           
        $table->timestamps();                       
    });

    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sops');
    }
};
