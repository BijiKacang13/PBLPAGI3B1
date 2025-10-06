<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sop extends Model
{
    use HasFactory;
    protected $table = 'sop';

    protected $primaryKey = 'id_sop';
    protected $fillable = ['keterangan', 'file'];
}
