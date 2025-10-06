<?php

namespace App\Models;

use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Akuntan_Unit extends Model
{
    use HasFactory;

    protected $table = 'akuntan_unit';
    protected $primaryKey = 'id_akuntan_unit';
    protected $fillable = ['id_akuntan_unit', 'id_unit', 'email', 'telp'];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_akuntan_unit', 'id_user');
    }


}
