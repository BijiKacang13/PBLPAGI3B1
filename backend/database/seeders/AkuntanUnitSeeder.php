<?php

namespace Database\Seeders;

use App\Models\Akuntan_Unit;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AkuntanUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = [
            ['id_akuntan_unit' => 2, 'email' => 'unit_yayasan@gmail.com', 'telp' => '085265900091', 'id_unit' => '1'],
            ['id_akuntan_unit' => 3, 'email' => 'unit_tpa@gmail.com', 'telp' => '085265900092', 'id_unit' => '2'],
            ['id_akuntan_unit' => 4, 'email' => 'unit_pgra@gmail.com', 'telp' => '085265900093', 'id_unit' => '3'],
            ['id_akuntan_unit' => 5, 'email' => 'unit_sdit1@gmail.com', 'telp' => '085265900094', 'id_unit' => '4'],
            ['id_akuntan_unit' => 6, 'email' => 'unit_sdit2@gmail.com', 'telp' => '085265900095', 'id_unit' => '5'],
            ['id_akuntan_unit' => 7, 'email' => 'unit_smpit@gmail.com', 'telp' => '085265900096', 'id_unit' => '6'],
            ['id_akuntan_unit' => 8, 'email' => 'unit_smkit@gmail.com', 'telp' => '085265900097', 'id_unit' => '7'],
            ['id_akuntan_unit' => 9, 'email' => 'unit_asma@gmail.com', 'telp' => '085265900098', 'id_unit' => '8'],
            ['id_akuntan_unit' => 10, 'email' => 'unit_smait@gmail.com', 'telp' => '085265900099', 'id_unit' => '9'],
        ];       

        foreach ($user as $data) {
            Akuntan_Unit::create($data);
        }
    }
}
