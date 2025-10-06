<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Auditor extends Model
{
    use HasFactory;
    protected $table = 'auditor';
    protected $primaryKey = 'id_auditor';
    protected $fillable = ['id_auditor', 'email', 'telp'];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditor', 'id_user');
    }
}
