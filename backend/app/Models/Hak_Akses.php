<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Hak_Akses extends Model
{
    use HasFactory;
    protected $table = 'hak_akses';
    protected $primaryKey = 'id_hak_akses';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = ['id_akuntan_unit', 
                            'view_rapbs_akun', 'create_rapbs_akun', 'update_rapbs_akun', 
                            'view_rapbs_kegiatan', 'create_rapbs_kegiatan', 'update_rapbs_kegiatan',
                            'view_jurnal_umum', 'create_jurnal_umum', 'update_jurnal_umum', 'delete_jurnal_umum',
                            'view_buku_besar', 'create_buku_besar', 'delete_buku_besar',
                            'view_laporan_komprehensif',
                            'view_laporan_posisi_keuangan',
                            'view_laporan_arus_kas',
                            'view_laporan_perubahan_aset_neto',
                            'view_laporan_catatan_atas_laporan_keuangan',
                            'view_laporan_proyeksi_rencana_dan_realisasi_anggaran'
                            ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'view_rapbs_akun' => 'boolean',
        'create_rapbs_akun' => 'boolean',
        'update_rapbs_akun' => 'boolean',
        'view_rapbs_kegiatan' => 'boolean',
        'create_rapbs_kegiatan' => 'boolean',
        'update_rapbs_kegiatan' => 'boolean',
        'view_jurnal_umum' => 'boolean',
        'create_jurnal_umum' => 'boolean',
        'update_jurnal_umum' => 'boolean',
        'delete_jurnal_umum' => 'boolean',
        'view_buku_besar' => 'boolean',
        'create_buku_besar' => 'boolean',
        'delete_buku_besar' => 'boolean',
        'view_laporan_komprehensif' => 'boolean',
        'view_laporan_posisi_keuangan' => 'boolean',
        'view_laporan_arus_kas' => 'boolean',
        'view_laporan_perubahan_aset_neto' => 'boolean',
        'view_laporan_catatan_atas_laporan_keuangan' => 'boolean',
        'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => 'boolean',
    ];
}
