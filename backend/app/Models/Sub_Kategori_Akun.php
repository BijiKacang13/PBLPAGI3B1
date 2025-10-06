<?php

namespace App\Models;

use App\Models\Akun;
use App\Models\Kategori_Akun;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Sub_Kategori_Akun extends Model
{
    use HasFactory;
    protected $table = 'sub_kategori_akun';

    protected $primaryKey = 'id_sub_kategori_akun';
    protected $fillable = ['id_kategori_akun', 'kode_sub_kategori_akun', 'sub_kategori_akun'];



    public function kategori_akun(): BelongsTo
    {
        return $this->belongsTo(Kategori_Akun::class, 'id_kategori_akun', 'id_kategori_akun');
    }

    public function akun(): HasMany
    {
        return $this->hasMany(Akun::class, 'id_akun');
    }
}
