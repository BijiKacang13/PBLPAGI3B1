<?php

namespace App\Models;

use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Kegiatan;
use App\Models\Buku_Besar;
use App\Models\Jenis_Transaksi;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Jurnal_Umum extends Model
{
    use HasFactory;
    protected $table = 'jurnal_umum';
    protected $primaryKey = 'id_jurnal_umum';

    protected $fillable = ['tanggal', 'no_bukti', 'keterangan', 'jenis_transaksi', 'id_unit', 'id_divisi', 'id_kegiatan', 'id_sumber_anggaran', 'kode_sumbangan', 'kode_ph'];


    // public function jenis_transaksi(): BelongsTo
    // {
    //     return $this->belongsTo(Jenis_Transaksi::class, 'jenis_transaksi', 'jenis_transaksi');
    // }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit');
    }

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class, 'id_divisi', 'id_divisi');
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(Kegiatan::class, 'id_kegiatan', 'id_kegiatan');
    }

    public function sumber_anggaran(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'id_sumber_anggaran', 'id_akun');
    }

    public function detail_jurnal_umum(): HasMany
    {
        return $this->hasMany(Detail_Jurnal_Umum::class, 'id_jurnal_umum', 'id_jurnal_umum');
    }

    public function buku_besar()
    {
        return $this->hasOne(Buku_Besar::class, 'id_jurnal_umum');
    }




}
