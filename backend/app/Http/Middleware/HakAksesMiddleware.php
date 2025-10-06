<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Hak_Akses;

class HakAksesMiddleware
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = Auth::user();

        // Jika bukan akuntan_unit, boleh akses
        if ($user->role !== 'akuntan_unit') {
            return $next($request);
        }

        // Kalau akuntan_unit, cek hak akses dari id_user
        $hakAkses = Hak_Akses::where('id_akuntan_unit', $user->id_user)->first();

        if (!$hakAkses || !$hakAkses->$permission) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
