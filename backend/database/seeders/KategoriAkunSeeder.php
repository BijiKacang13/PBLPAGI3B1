<?php

namespace Database\Seeders;

use App\Models\Kategori_Akun;
use Illuminate\Database\Seeder;

class KategoriAkunSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategori_akun = [
            ['kode_kategori_akun' => '1-0000', 'kategori_akun' => 'AKTIVA'],
            ['kode_kategori_akun' => '2-0000', 'kategori_akun' => 'KEWAJIBAN'],
            ['kode_kategori_akun' => '3-0000', 'kategori_akun' => 'ASET NETO'],
            ['kode_kategori_akun' => '4-0000', 'kategori_akun' => 'PENERIMAAN DAN SUMBANGAN'],
            ['kode_kategori_akun' => '5-0000', 'kategori_akun' => 'BEBAN'],
        ];

        foreach ($kategori_akun as $data) {
            Kategori_Akun::create($data);
        }

    }
}
