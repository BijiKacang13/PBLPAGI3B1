<?php

namespace Database\Seeders;
use App\Models\Akun;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AkunSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $akun = [

            // --------------------------------------AKTIVA
            // Kas
            ['kode_akun' => '1-1101', 'akun' => 'Kas Tunai', 'id_sub_kategori_akun' => 1, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1102', 'akun' => 'Kas Kecil', 'id_sub_kategori_akun' => 1, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1103', 'akun' => 'Kas Lainnya', 'id_sub_kategori_akun' => 1, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],

            // Bank
            ['kode_akun' => '1-1201', 'akun' => 'Bank BSI 1', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1202', 'akun' => 'Bank BSI 2', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1203', 'akun' => 'Bank BSI 3', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1205', 'akun' => 'Bank BSI 4', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1204', 'akun' => 'Bank Lainnya', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1206', 'akun' => 'Bank BSI 5', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1207', 'akun' => 'Bank BSI 6', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1208', 'akun' => 'Bank BSI 7', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1209', 'akun' => 'Bank BSI 8', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1210', 'akun' => 'Bank BSI 9', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],

            // Persediaan
            ['kode_akun' => '1-1301', 'akun' => 'Persediaan Perlengkapan Kantor', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1302', 'akun' => 'Persediaan Perlengkapan Asrama', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1303', 'akun' => 'Persediaan ATK', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1304', 'akun' => 'Persediaan Lainnya', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            
            // Piutang
            ['kode_akun' => '1-1401', 'akun' => 'Piutang Rekanan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1402', 'akun' => 'Piutang Kegiatan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1403', 'akun' => 'Piutang Karyawan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1404', 'akun' => 'Piutang Sumbangan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1405', 'akun' => 'Piutang Lainnya', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            
            // Aset Lancar Lainnya
            ['kode_akun' => '1-1501', 'akun' => 'Sewa Dibayar Dimuka', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1502', 'akun' => 'Tabungan Pensiun Karyawan', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1503', 'akun' => 'Pajak Dibayar Dimuka', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1504', 'akun' => 'Beban Dibayar Dimuka', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            
            // Aktiva Tetap
            ['kode_akun' => '1-1601', 'akun' => 'Tanah', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1602', 'akun' => 'Bangunan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1603', 'akun' => 'Bangunan Dalam Proses', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1604', 'akun' => 'Inventaris Kantor', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1605', 'akun' => 'Peralatan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1606', 'akun' => 'Kendaraan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1607', 'akun' => 'Aktiva Tetap Lainnya', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1608', 'akun' => 'Akumulasi Penyusutan Bangunan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1609', 'akun' => 'Akumulasi Penyusutan Inventaris', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1610', 'akun' => 'Akumulasi Penyusutan Peralatan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1611', 'akun' => 'Akumulasi Penyusutan Kendaraan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '1-1612', 'akun' => 'Akumulasi Penyusutan Aktiva Tetap Lainnya', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],




            // --------------------------------------KEWAJIBAN
            // Kewajiban Jangka Pendek
            ['kode_akun' => '2-1100', 'akun' => 'Hutang Gaji', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1101', 'akun' => 'Hutang Listrik', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1102', 'akun' => 'Hutang Telepon', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1103', 'akun' => 'Hutang Air', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1104', 'akun' => 'Hutang Tabungan Pensiun Karyawan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1105', 'akun' => 'Hutang BPJS', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1106', 'akun' => 'Hutang Pajak Penghasilan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1107', 'akun' => 'Hutang ZIS', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1108', 'akun' => 'Sumbangan Diterima Dimuka', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1109', 'akun' => 'Hutang Rekanan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1110', 'akun' => 'Hutang Kegiatan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-1111', 'akun' => 'Hutang Lancar Lainnya', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],

            // Kewajiban Jangka Panjang
            ['kode_akun' => '2-2100', 'akun' => 'Hutang Bank', 'id_sub_kategori_akun' => 8, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-2101', 'akun' => 'Hutang Koperasi', 'id_sub_kategori_akun' => 8, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '2-2102', 'akun' => 'Hutang Pihak Ketiga Lainnya', 'id_sub_kategori_akun' => 8, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],

            


            // --------------------------------------ASET NETO
            ['kode_akun' => '3-1000', 'akun' => 'Dengan Pembatasan', 'id_sub_kategori_akun' => 9, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '3-0001', 'akun' => 'Tanpa Pembatasan', 'id_sub_kategori_akun' => 10, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],




            // --------------------------------------PENERIMAAN DAN SUMBANGAN
            // Penerimaan dan Sumbangan Pendidikan
            ['kode_akun' => '4-1100', 'akun' => 'Sumbangan SPP', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1101', 'akun' => 'Sumbangan Komite/POM', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1102', 'akun' => 'Sumbangan Sarana Belajar', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1103', 'akun' => 'Sumbangan Pembangunan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1104', 'akun' => 'Sumbangan Keg. Pemantapan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1105', 'akun' => 'Sumbangan Keg. Perpisahan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1106', 'akun' => 'Sumbangan DANA BOS/BOP', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1107', 'akun' => 'Sumbangan Kegiatan USBN', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1108', 'akun' => 'Sumbangan Kegiatan UNBK', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1109', 'akun' => 'Sumbangan Kegiatan UKK', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1110', 'akun' => 'Sumbangan Kegiatan Prakerin', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1111', 'akun' => 'Sumbangan Keg. Boarding', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1112', 'akun' => 'Sumbangan Penitipan Anak', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1113', 'akun' => 'Sumbangan Hibah, Wakaf Pendidikan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1114', 'akun' => 'Penerimaan Buku', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1115', 'akun' => 'Penerimaan Seragam', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1116', 'akun' => 'Penerimaan PPDB', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1117', 'akun' => 'Penerimaan Catering', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1118', 'akun' => 'Penerimaan Transportasi', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1119', 'akun' => 'Penerimaan Lainnya', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-1120', 'akun' => 'Sumbangan Dana Pendidikan Lainnya', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],

            // Penerimaan dan Sumbangan Non Pendidikan
            ['kode_akun' => '4-2100', 'akun' => 'Sumbangan Hibah, Wakaf Non Pendidikan', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-2101', 'akun' => 'Sumbangan Penggalangan Dana', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-2102', 'akun' => 'Sumbangan ZIS', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-2103', 'akun' => 'Sumbangan SPP Rumah Tahfizh', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-2104', 'akun' => 'Penerimaan Bagi Hasil Bank', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '4-2105', 'akun' => 'Penerimaan Sumbangan Non Pendidikan Lainnya', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],




            // --------------------------------------BEBAN
            //Beban Operasional
            ['kode_akun' => '5-1100', 'akun' => 'Beban Gaji', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1101', 'akun' => 'Beban Honorarium', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1102', 'akun' => 'Beban Tunjangan Hari Raya (THR)', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1103', 'akun' => 'Beban Transport', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1103a', 'akun' => 'Beban BBM', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1104', 'akun' => 'Beban ATK dan Kesekretariatan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1105', 'akun' => 'Beban Keg Siswa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1106', 'akun' => 'Beban Penyusutan Bangunan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1107', 'akun' => 'Beban Penyusutan Inventaris Kantor', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1109', 'akun' => 'Beban Penyusutan Kendaraan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1108', 'akun' => 'Beban Penyusutan Peralatan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1110', 'akun' => 'Beban Listrik, Air, & Telepon', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1111', 'akun' => 'Beban Internet dan Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1112', 'akun' => 'Beban Konsumsi', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1112a', 'akun' => 'Beban Kerumahtanggaan Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1113', 'akun' => 'Beban BPJS', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1114', 'akun' => 'Beban Perbaikan Asset', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1115', 'akun' => 'Biaya Pembangunan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1116', 'akun' => 'Beban Perjalanan Dinas', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1117', 'akun' => 'Beban Dokumentasi, Publikasi & Kehumasan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1118', 'akun' => 'Beban Pelatihan Karyawan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1119', 'akun' => 'Beban Ekstrakulikuler dan Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1119a', 'akun' => 'Beban Expedisi', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1120', 'akun' => 'Pengeluaran Buku', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1121', 'akun' => 'Pengeluaran Seragam Siswa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1122', 'akun' => 'Pengeluaran Catering', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1123', 'akun' => 'Pengeluaran Transportasi Siswa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1124', 'akun' => 'Pengeluaran Dana BOS/BOP', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1124a', 'akun' => 'Pengeluaran Dana Komite', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1125', 'akun' => 'Beban Operasional Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1126', 'akun' => 'Beban Sewa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-1127', 'akun' => 'Beban Asuransi', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],

            //Beban Non Operasional
            ['kode_akun' => '5-2100', 'akun' => 'Beban administrasi Bank', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2100a', 'akun' => 'Beban adm Pinjaman Bank/Lembaga lainnya', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2101', 'akun' => 'Beban Koran Majalah dll', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2102', 'akun' => 'Beban Perawatan Taman', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2103', 'akun' => 'Beban Taawun', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2104', 'akun' => 'Beban Foto Copy', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2105', 'akun' => 'Beban Pajak Penghasilan', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2106', 'akun' => 'Beban Pajak Kendaraan', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2107', 'akun' => 'Beban PBB', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0],
            ['kode_akun' => '5-2108', 'akun' => 'Beban Non Operasional Lainnya', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0]
            
            























            // ['kode_akun' => '1-1101', 'akun' => 'Kas Tunai', 'id_sub_kategori_akun' => 1, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1102', 'akun' => 'Kas Kecil', 'id_sub_kategori_akun' => 1, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1103', 'akun' => 'Kas Lainnya', 'id_sub_kategori_akun' => 1, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],

            // // Bank
            // ['kode_akun' => '1-1201', 'akun' => 'Bank BSI 1', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1202', 'akun' => 'Bank BSI 2', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1203', 'akun' => 'Bank BSI 3', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1205', 'akun' => 'Bank BSI 4', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1204', 'akun' => 'Bank Lainnya', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1206', 'akun' => 'Bank BSI 5', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1207', 'akun' => 'Bank BSI 6', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1208', 'akun' => 'Bank BSI 7', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1209', 'akun' => 'Bank BSI 8', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1210', 'akun' => 'Bank BSI 9', 'id_sub_kategori_akun' => 2, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],

            // // Persediaan
            // ['kode_akun' => '1-1301', 'akun' => 'Persediaan Perlengkapan Kantor', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1302', 'akun' => 'Persediaan Perlengkapan Asrama', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1303', 'akun' => 'Persediaan ATK', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1304', 'akun' => 'Persediaan Lainnya', 'id_sub_kategori_akun' => 3, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            
            // // Piutang
            // ['kode_akun' => '1-1401', 'akun' => 'Piutang Rekanan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1402', 'akun' => 'Piutang Kegiatan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1403', 'akun' => 'Piutang Karyawan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1404', 'akun' => 'Piutang Sumbangan', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1405', 'akun' => 'Piutang Lainnya', 'id_sub_kategori_akun' => 4, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            
            // // Aset Lancar Lainnya
            // ['kode_akun' => '1-1501', 'akun' => 'Sewa Dibayar Dimuka', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1502', 'akun' => 'Tabungan Pensiun Karyawan', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1503', 'akun' => 'Pajak Dibayar Dimuka', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1504', 'akun' => 'Beban Dibayar Dimuka', 'id_sub_kategori_akun' => 5, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            
            // // Aktiva Tetap
            // ['kode_akun' => '1-1601', 'akun' => 'Tanah', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1602', 'akun' => 'Bangunan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1603', 'akun' => 'Bangunan Dalam Proses', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1604', 'akun' => 'Inventaris Kantor', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1605', 'akun' => 'Peralatan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1606', 'akun' => 'Kendaraan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1607', 'akun' => 'Aktiva Tetap Lainnya', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1608', 'akun' => 'Akumulasi Penyusutan Bangunan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1609', 'akun' => 'Akumulasi Penyusutan Inventaris', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1610', 'akun' => 'Akumulasi Penyusutan Peralatan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1611', 'akun' => 'Akumulasi Penyusutan Kendaraan', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '1-1612', 'akun' => 'Akumulasi Penyusutan Aktiva Tetap Lainnya', 'id_sub_kategori_akun' => 6, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],




            // // --------------------------------------KEWAJIBAN
            // // Kewajiban Jangka Pendek
            // ['kode_akun' => '2-1100', 'akun' => 'Hutang Gaji', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1101', 'akun' => 'Hutang Listrik', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1102', 'akun' => 'Hutang Telepon', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1103', 'akun' => 'Hutang Air', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1104', 'akun' => 'Hutang Tabungan Pensiun Karyawan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1105', 'akun' => 'Hutang BPJS', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1106', 'akun' => 'Hutang Pajak Penghasilan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1107', 'akun' => 'Hutang ZIS', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1108', 'akun' => 'Sumbangan Diterima Dimuka', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1109', 'akun' => 'Hutang Rekanan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1110', 'akun' => 'Hutang Kegiatan', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-1111', 'akun' => 'Hutang Lancar Lainnya', 'id_sub_kategori_akun' => 7, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],

            // // Kewajiban Jangka Panjang
            // ['kode_akun' => '2-2100', 'akun' => 'Hutang Bank', 'id_sub_kategori_akun' => 8, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-2101', 'akun' => 'Hutang Koperasi', 'id_sub_kategori_akun' => 8, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '2-2102', 'akun' => 'Hutang Pihak Ketiga Lainnya', 'id_sub_kategori_akun' => 8, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],

            


            // // --------------------------------------ASET NETO
            // ['kode_akun' => '3-1000', 'akun' => 'Dengan Pembatasan', 'id_sub_kategori_akun' => 9, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '3-0001', 'akun' => 'Tanpa Pembatasan', 'id_sub_kategori_akun' => 10, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],




            // // --------------------------------------PENERIMAAN DAN SUMBANGAN
            // // Penerimaan dan Sumbangan Pendidikan
            // ['kode_akun' => '4-1100', 'akun' => 'Sumbangan SPP', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1101', 'akun' => 'Sumbangan Komite/POM', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1102', 'akun' => 'Sumbangan Sarana Belajar', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1103', 'akun' => 'Sumbangan Pembangunan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1104', 'akun' => 'Sumbangan Keg. Pemantapan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1105', 'akun' => 'Sumbangan Keg. Perpisahan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1106', 'akun' => 'Sumbangan DANA BOS/BOP', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1107', 'akun' => 'Sumbangan Kegiatan USBN', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1108', 'akun' => 'Sumbangan Kegiatan UNBK', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1109', 'akun' => 'Sumbangan Kegiatan UKK', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1110', 'akun' => 'Sumbangan Kegiatan Prakerin', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1111', 'akun' => 'Sumbangan Keg. Boarding', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1112', 'akun' => 'Sumbangan Penitipan Anak', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1113', 'akun' => 'Sumbangan Hibah, Wakaf Pendidikan', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1114', 'akun' => 'Penerimaan Buku', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1115', 'akun' => 'Penerimaan Seragam', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1116', 'akun' => 'Penerimaan PPDB', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1117', 'akun' => 'Penerimaan Catering', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1118', 'akun' => 'Penerimaan Transportasi', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1119', 'akun' => 'Penerimaan Lainnya', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-1120', 'akun' => 'Sumbangan Dana Pendidikan Lainnya', 'id_sub_kategori_akun' => 11, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],

            // // Penerimaan dan Sumbangan Non Pendidikan
            // ['kode_akun' => '4-2100', 'akun' => 'Sumbangan Hibah, Wakaf Non Pendidikan', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-2101', 'akun' => 'Sumbangan Penggalangan Dana', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-2102', 'akun' => 'Sumbangan ZIS', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-2103', 'akun' => 'Sumbangan SPP Rumah Tahfizh', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-2104', 'akun' => 'Penerimaan Bagi Hasil Bank', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '4-2105', 'akun' => 'Penerimaan Sumbangan Non Pendidikan Lainnya', 'id_sub_kategori_akun' => 12, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],




            // // --------------------------------------BEBAN
            // //Beban Operasional
            // ['kode_akun' => '5-1100', 'akun' => 'Beban Gaji', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1101', 'akun' => 'Beban Honorarium', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1102', 'akun' => 'Beban Tunjangan Hari Raya (THR)', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1103', 'akun' => 'Beban Transport', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1103a', 'akun' => 'Beban BBM', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1104', 'akun' => 'Beban ATK dan Kesekretariatan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1105', 'akun' => 'Beban Keg Siswa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1106', 'akun' => 'Beban Penyusutan Bangunan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1107', 'akun' => 'Beban Penyusutan Inventaris Kantor', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1109', 'akun' => 'Beban Penyusutan Kendaraan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1108', 'akun' => 'Beban Penyusutan Peralatan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1110', 'akun' => 'Beban Listrik, Air, & Telepon', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1111', 'akun' => 'Beban Internet dan Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1112', 'akun' => 'Beban Konsumsi', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1112a', 'akun' => 'Beban Kerumahtanggaan Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1113', 'akun' => 'Beban BPJS', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1114', 'akun' => 'Beban Perbaikan Asset', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1115', 'akun' => 'Biaya Pembangunan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1116', 'akun' => 'Beban Perjalanan Dinas', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1117', 'akun' => 'Beban Dokumentasi, Publikasi & Kehumasan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1118', 'akun' => 'Beban Pelatihan Karyawan', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1119', 'akun' => 'Beban Ekstrakulikuler dan Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1119a', 'akun' => 'Beban Expedisi', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1120', 'akun' => 'Pengeluaran Buku', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1121', 'akun' => 'Pengeluaran Seragam Siswa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1122', 'akun' => 'Pengeluaran Catering', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1123', 'akun' => 'Pengeluaran Transportasi Siswa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1124', 'akun' => 'Pengeluaran Dana BOS/BOP', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1124a', 'akun' => 'Pengeluaran Dana Komite', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1125', 'akun' => 'Beban Operasional Lainnya', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1126', 'akun' => 'Beban Sewa', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-1127', 'akun' => 'Beban Asuransi', 'id_sub_kategori_akun' => 13, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],

            // //Beban Non Operasional
            // ['kode_akun' => '5-2100', 'akun' => 'Beban administrasi Bank', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2100a', 'akun' => 'Beban adm Pinjaman Bank/Lembaga lainnya', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2101', 'akun' => 'Beban Koran Majalah dll', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2102', 'akun' => 'Beban Perawatan Taman', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2103', 'akun' => 'Beban Taawun', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2104', 'akun' => 'Beban Foto Copy', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2105', 'akun' => 'Beban Pajak Penghasilan', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2106', 'akun' => 'Beban Pajak Kendaraan', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2107', 'akun' => 'Beban PBB', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2],
            // ['kode_akun' => '5-2108', 'akun' => 'Beban Non Operasional Lainnya', 'id_sub_kategori_akun' => 14, 'saldo_awal_debit' => 0, 'saldo_awal_kredit' => 0, 'budget_rapbs' => 0, 'id_unit' => 2]
            
            






            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
        ];

        foreach ($akun as $data) {
            Akun::create($data); 
        }
    }
}
