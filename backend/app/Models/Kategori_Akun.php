<?php

namespace App\Models;

use App\Models\Kategori_Akun;
use App\Models\Sub_Kategori_Akun;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Kategori_Akun extends Model
{
    use HasFactory;

    protected $table = 'kategori_akun';

    protected $primaryKey = 'id_kategori_akun';
    protected $fillable = ['kode_kategori_akun', 'kategori_akun'];


    public function sub_kategori_akun(): HasMany
    {
        return $this->hasMany(Sub_Kategori_Akun::class, 'id_sub_kategori_akun');
    }


}
