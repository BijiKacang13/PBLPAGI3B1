<?php

namespace App\Models;

use App\Models\Kegiatan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Budget_Rapbs_Kegiatan extends Model
{
    use HasFactory;
    protected $table = 'budget_rapbs_kegiatan';
    protected $primaryKey = 'id_budget_rapbs_kegiatan';
    protected $fillable = ['id_kegiatan', 'id_unit', 'budget_rapbs_kegiatan'];

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class, 'id_kegiatan');
    }

}
