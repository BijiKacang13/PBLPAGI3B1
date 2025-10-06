<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kategori_Akun>
 */
class Kategori_AkunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            ['kode_akun' => 1, 'kategori_akun' => 'Aktiva'],
            ['kode_akun' => 2, 'kategori_akun' => 'Kewajiban'],
            ['kode_akun' => 3, 'kategori_akun' => 'Modal'],
            ['kode_akun' => 4, 'kategori_akun' => 'Pendapatan'],
            ['kode_akun' => 5, 'kategori_akun' => 'Beban'],

        ];
    }
}
