<?php

namespace App\Models;

use App\Models\Kegiatan;
use App\Models\Jurnal_Umum;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Kegiatan extends Model
{
    use HasFactory;
    protected $table = 'kegiatan';
    protected $primaryKey = 'id_kegiatan';
    protected $fillable = ['kode_kegiatan', 'kegiatan'];

    public function jurnal_umum()
    {
        return $this->hasMany(Jurnal_Umum::class, 'id_kegiatan', 'id_kegiatan');
    }

    public function budget_kegiatan()
    {
        return $this->hasMany(Budget_Rapbs_Kegiatan::class, 'id_kegiatan');
    }


}
