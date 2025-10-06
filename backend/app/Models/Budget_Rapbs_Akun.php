<?php

namespace App\Models;

use App\Models\Akun;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Budget_Rapbs_Akun extends Model
{
    use HasFactory;
    protected $table = 'budget_rapbs_akun';
    protected $primaryKey = 'id_budget_rapbs_akun';
    protected $fillable = ['id_akun', 'id_unit', 'budget_rapbs_akun'];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit');
    }

    public function akun()
    {
        return $this->belongsTo(Akun::class, 'id_akun');
    }

}
