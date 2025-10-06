<?php

namespace Database\Seeders;

use App\Models\Auditor;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AuditorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = [
            ['id_auditor' => 11, 'email' => 'auditor@gmail.com', 'telp' => '0852659000992']
        ];       

        foreach ($user as $data) {
            Auditor::create($data);
        }
    }
}
