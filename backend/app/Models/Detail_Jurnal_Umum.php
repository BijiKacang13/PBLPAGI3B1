<?php

namespace App\Models;

use App\Models\Akun;
use App\Models\Jurnal_Umum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Detail_Jurnal_Umum extends Model
{
    use HasFactory;
    protected $table = 'detail_jurnal_umum';
    protected $primaryKey = 'id_detail_jurnal_umum';

    protected $fillable = ['id_jurnal_umum', 'id_akun', 'nominal', 'debit_kredit'];

    public function jurnal_umum(): BelongsTo
    {
        return $this->belongsTo(Jurnal_Umum::class, 'id_jurnal_umum', 'id_jurnal_umum');
    }

    
    public function akun(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'id_akun', 'id_akun');
    }


}
