<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\AkunSeeder;
use Database\Seeders\UnitSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\DivisiSeeder;
use Database\Seeders\HakAksesSeeder;
use Database\Seeders\KegiatanSeeder;
use Database\Seeders\AkuntanUnitSeeder;
use Database\Seeders\AuditorSeeder;
use Database\Seeders\KategoriAkunSeeder;
use Database\Seeders\AkuntanDivisiSeeder;
use Database\Seeders\JenisTransaksiSeeder;
use Database\Seeders\BudgetRapbsAkunSeeder;
use Database\Seeders\SaldoAkhirTahunSeeder;
use Database\Seeders\SubKategoriAkunSeeder;
use Database\Seeders\KomprehensifAkhirTahunSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UnitSeeder::class);
        $this->call(DivisiSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(AkuntanUnitSeeder::class);
        $this->call(AuditorSeeder::class);
        $this->call(HakAksesSeeder::class);
        $this->call(KategoriAkunSeeder::class);
        $this->call(SubKategoriAkunSeeder::class);
        $this->call(AkunSeeder::class);
        $this->call(KegiatanSeeder::class);
    }
}
