<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    
    // public function handle(Request $request, Closure $next, string $role): Response
    // {
    //     if (!Auth::check()) {
    //         return redirect('/login');
    //     }

    //     if (Auth::user()->role !== $role) {
    //         abort(403, 'Akses ditolak.');
    //     }

    //     return $next($request);
    // }

    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        if (!in_array(Auth::user()->role, $roles)) {
            abort(403, 'Akses ditolak.');
        }

        return $next($request);
    }

}
