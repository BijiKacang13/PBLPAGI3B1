<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\User;
use App\Models\Divisi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function create()
    {
        $divisi = Divisi::all();
        $unit = Unit::all();
        return view('/admin/buat-akun', compact('divisi', 'unit'));
    }


}
