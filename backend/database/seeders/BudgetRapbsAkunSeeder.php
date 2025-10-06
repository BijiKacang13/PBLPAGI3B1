<?php

namespace Database\Seeders;

use App\Models\Akun;
use App\Models\Budget_Rapbs_Akun;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class BudgetRapbsAkunSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $budget_rapbs_akun = [
            // --------------------------------------AKTIVA
            // Kas
            ['id_akun' => '1', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '2', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '3', 'id_unit' => 2, 'budget_rapbs_akun' => 0],

            // Bank
            ['id_akun' => '4', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '5', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '6', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '7', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '8', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '9', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '10', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '11', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '12', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '13', 'id_unit' => 2, 'budget_rapbs_akun' => 0],

            // Persediaan
            ['id_akun' => '14', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '15', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '16', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '17', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            
            // Piutang
            ['id_akun' => '18', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '19', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '20', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '21', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '22', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            
            // Aset Lancar Lainnya
            ['id_akun' => '23', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '24', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '25', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '26', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            
            // Aktiva Tetap
            ['id_akun' => '27', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '28', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '29', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '30', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '31', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '32', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '33', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '34', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '35', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '36', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '37', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '38', 'id_unit' => 2, 'budget_rapbs_akun' => 0],








            // --------------------------------------KEWAJIBAN
            // Kewajiban Jangka Pendek
            ['id_akun' => '39', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '40', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '41', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '42', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '43', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '44', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '45', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '46', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '47', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '48', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '49', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '50', 'id_unit' => 2, 'budget_rapbs_akun' => 0],

            // Kewajiban Jangka Panjang
            ['id_akun' => '51', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '52', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '53', 'id_unit' => 2, 'budget_rapbs_akun' => 0],

            









            // --------------------------------------ASET NETO
            ['id_akun' => '54', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '55', 'id_unit' => 2, 'budget_rapbs_akun' => 0],











            // --------------------------------------PENERIMAAN DAN SUMBANGAN
            // Penerimaan dan Sumbangan Pendidikan
            ['id_akun' => '56', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '57', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '58', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '59', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '60', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '61', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '62', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '63', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '64', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '65', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '66', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '67', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '68', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '69', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '70', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '71', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '72', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '73', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '74', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '75', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '76', 'id_unit' => 2, 'budget_rapbs_akun' => 0],


            // Penerimaan dan Sumbangan Non Pendidikan
            ['id_akun' => '77', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '78', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '79', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '80', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '81', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '82', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '83', 'id_unit' => 2, 'budget_rapbs_akun' => 0],









            // --------------------------------------BEBAN
            //Beban Operasional
            ['id_akun' => '84', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '85', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '86', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '87', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '88', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '89', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '90', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '91', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '92', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '93', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '94', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '95', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '96', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '97', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '98', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '99', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '100', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '101', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '102', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '103', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '104', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '105', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '106', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '107', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '108', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '109', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '110', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '111', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '112', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '113', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '114', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '115', 'id_unit' => 2, 'budget_rapbs_akun' => 0],

            //Beban Non Operasional
            ['id_akun' => '116', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '117', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '118', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '119', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '120', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '121', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '122', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '123', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
            ['id_akun' => '124', 'id_unit' => 2, 'budget_rapbs_akun' => 0],
        ];

        foreach ($budget_rapbs_akun as $data) {
            Budget_Rapbs_Akun::create($data);
        }
    }
}
