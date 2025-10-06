<?php

namespace App\Models;

use App\Models\Jurnal_Umum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Buku_Besar extends Model
{
    use HasFactory;
    protected $table = 'buku_besar';
    protected $primaryKey = 'id_buku_besar';
    protected $fillable = ['id_jurnal_umum'];

    public function jurnal_umum(): BelongsTo
    {
        return $this->belongsTo(Jurnal_Umum::class, 'id_jurnal_umum', 'id_jurnal_umum');
    }
}
