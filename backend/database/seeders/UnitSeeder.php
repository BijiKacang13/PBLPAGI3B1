<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $unit = [
            ['kode_unit' => 'U1', 'unit' => 'Yayasan'],
            ['kode_unit' => 'U2', 'unit' => 'TPA'],
            ['kode_unit' => 'U3', 'unit' => 'PGRA'],
            ['kode_unit' => 'U4', 'unit' => 'SDIT1'],
            ['kode_unit' => 'U5', 'unit' => 'SDIT2'],
            ['kode_unit' => 'U6', 'unit' => 'SMPIT'],
            ['kode_unit' => 'U7', 'unit' => 'SMKIT'],
            ['kode_unit' => 'U8', 'unit' => 'ASMA'],
            ['kode_unit' => 'U9', 'unit' => 'SMAIT'],
        ];

        foreach ($unit as $data) {
            Unit::create($data);
        }
    }
}
