<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Calk extends Model
{
    use HasFactory;
    protected $table = 'calk';

    protected $primaryKey = 'id_calk';
    protected $fillable = ['keterangan', 'file'];
}
