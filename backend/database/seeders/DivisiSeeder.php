<?php

namespace Database\Seeders;

use App\Models\Divisi;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DivisiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategori_akun = [
            ['divisi' => 'Kurikulum'],
            ['divisi' => 'Kesiswaan'],
            ['divisi' => "Qur'an"],
            ['divisi' => "Umum"],
        ];

        foreach ($kategori_akun as $data) {
            Divisi::create($data);
        }
    }
}
