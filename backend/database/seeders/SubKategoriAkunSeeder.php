<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sub_Kategori_Akun;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SubKategoriAkunSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sub_kategori_akun = [
            // ['kode_sub_kategori_akun' => '1-1100', 'sub_kategori_akun' => 'Aktiva Lancar', 'id_kategori_akun' => 1],
            ['kode_sub_kategori_akun' => '1-1100', 'sub_kategori_akun' => 'Kas', 'id_kategori_akun' => 1],
            ['kode_sub_kategori_akun' => '1-1200', 'sub_kategori_akun' => 'Bank', 'id_kategori_akun' => 1],
            ['kode_sub_kategori_akun' => '1-1300', 'sub_kategori_akun' => 'Persediaan', 'id_kategori_akun' => 1],
            ['kode_sub_kategori_akun' => '1-1400', 'sub_kategori_akun' => 'Piutang', 'id_kategori_akun' => 1],
            ['kode_sub_kategori_akun' => '1-1500', 'sub_kategori_akun' => 'Aset Lancar Lainnya', 'id_kategori_akun' => 1],
            ['kode_sub_kategori_akun' => '1-1600', 'sub_kategori_akun' => 'Aktiva Tetap', 'id_kategori_akun' => 1],
            
            
            ['kode_sub_kategori_akun' => '2-1000', 'sub_kategori_akun' => 'Kewajiban Jangka Pendek', 'id_kategori_akun' => 2],
            ['kode_sub_kategori_akun' => '2-2000', 'sub_kategori_akun' => 'Kewajiban Jangka Panjang', 'id_kategori_akun' => 2],
            
            
            ['kode_sub_kategori_akun' => '3-1000', 'sub_kategori_akun' => 'Dengan Pembatasan', 'id_kategori_akun' => 3],
            ['kode_sub_kategori_akun' => '3-0001', 'sub_kategori_akun' => 'Tanpa Pembatasan', 'id_kategori_akun' => 3],
            
            
            ['kode_sub_kategori_akun' => '4-1000', 'sub_kategori_akun' => 'Penerimaan dan Sumbangan Pendidikan', 'id_kategori_akun' => 4],
            ['kode_sub_kategori_akun' => '4-2000', 'sub_kategori_akun' => 'Penerimaan dan Sumbangan Non Pendidikan', 'id_kategori_akun' => 4],
            
            
            ['kode_sub_kategori_akun' => '5-1000', 'sub_kategori_akun' => 'Beban Operasional', 'id_kategori_akun' => 5],
            ['kode_sub_kategori_akun' => '5-2000', 'sub_kategori_akun' => 'Beban Non Operasional', 'id_kategori_akun' => 5],
            

        ];

        foreach ($sub_kategori_akun as $data) {
            Sub_Kategori_Akun::create($data); 
        }
    }
}
