<?php

namespace App\Models;

use App\Models\Akun;
use App\Models\Sub_Kategori_Akun;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Akun extends Model
{
    use HasFactory;
    protected $table = 'akun';

    protected $primaryKey = 'id_akun';
    protected $fillable = ['id_sub_kategori_akun', 'kode_akun', 'akun', 'saldo_awal_debit', 'saldo_awal_kredit'];

    public function detail_jurnal_umum(): HasMany
    {
        return $this->hasMany(Detail_Jurnal_Umum::class, 'id_akun', 'id_akun');
    }


    public function sub_kategori_akun(): BelongsTo
    {
        return $this->belongsTo(Sub_Kategori_Akun::class, 'id_sub_kategori_akun', 'id_sub_kategori_akun');
    }

    // Model Akun
    public function unit()
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit');
    }

    public function budget_akun()
    {
        return $this->hasMany(Budget_Rapbs_Akun::class, 'id_akun');
    }

}
