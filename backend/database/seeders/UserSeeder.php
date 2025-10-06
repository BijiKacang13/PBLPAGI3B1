<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = [
            ['nama' => 'Nasyith Aditya', 'username' => 'admin', 'password' => Hash::make(12345678), 'role' => 'admin'],

            ['nama' => 'Unit Yayasan', 'username' => 'unit_yayasan', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit TPA', 'username' => 'unit_tpa', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit PGRA', 'username' => 'unit_pgra', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit SDIT1', 'username' => 'unit_sdit1', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit SDIT2', 'username' => 'unit_sdit2', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit SMPIT', 'username' => 'unit_smpit', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit SMKIT', 'username' => 'unit_smkit', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit ASMA', 'username' => 'unit_asma', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],
            ['nama' => 'Unit SMAIT', 'username' => 'unit_smait', 'password' => Hash::make(12345678), 'role' => 'akuntan_unit'],

            ['nama' => "Auditor", 'username' => 'auditor', 'password' => Hash::make(12345678), 'role' => 'auditor'],
        ];       

        foreach ($user as $data) {
            User::create($data);
        }
    }
}
