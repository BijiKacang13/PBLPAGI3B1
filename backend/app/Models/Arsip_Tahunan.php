<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Arsip_Tahunan extends Model
{
    use HasFactory;

    protected $table = 'arsip_tahunan';
    protected $primaryKey = 'id_arsip';

    protected $fillable = [
        'tahun',
        'status',
        'total_pendapatan',
        'total_beban',
        'laba_rugi',
        'total_aset',
        'total_kewajiban',
        'total_ekuitas',
        'jumlah_transaksi',
        'tanggal_tutup_buku',
        'ditutup_oleh',
        'catatan',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'total_pendapatan' => 'decimal:2',
        'total_beban' => 'decimal:2',
        'laba_rugi' => 'decimal:2',
        'total_aset' => 'decimal:2',
        'total_kewajiban' => 'decimal:2',
        'total_ekuitas' => 'decimal:2',
        'jumlah_transaksi' => 'integer',
        'tanggal_tutup_buku' => 'date',
    ];

    /**
     * Relasi ke user yang menutup buku
     */
    public function penutup()
    {
        return $this->belongsTo(User::class, 'ditutup_oleh');
    }

    /**
     * Scope untuk tahun aktif
     */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope untuk tahun yang sudah diarsipkan
     */
    public function scopeDiarsipkan($query)
    {
        return $query->where('status', 'diarsipkan');
    }

    /**
     * Scope untuk tahun yang sudah ditutup
     */
    public function scopeDitutup($query)
    {
        return $query->whereIn('status', ['ditutup', 'diarsipkan']);
    }
}
