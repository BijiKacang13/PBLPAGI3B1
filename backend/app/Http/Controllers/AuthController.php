<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    // Tampilkan form login
    public function login_form()
    {
        return view('login'); // Sesuaikan view login kamu, misal di resources/views/auth/login.blade.php
    }

    // Proses login
    public function login(Request $request)
    {
        // Validasi input
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Ambil status remember me dari checkbox
        $remember = $request->has('remember');

        // Coba login
        if (Auth::attempt(['username' => $credentials['username'], 'password' => $credentials['password']], $remember)) {
            $request->session()->regenerate();

            // Cek role user
            if (!in_array(Auth::user()->role, ['admin', 'akuntan_unit', 'auditor'])) {
                Auth::logout();
                return redirect()->route('login')->withErrors('Role tidak dikenali.');
            }

            // Jika remember me dicentang, ubah durasi cookie menjadi 1 hari (1440 menit)
            if ($remember) {
                $cookieName = Auth::getRecallerName(); // Biasanya 'remember_web'
                $cookieValue = Cookie::get($cookieName); // Ambil nilai cookie yang sudah dibuat Laravel
                $oneDayInMinutes = 60 * 24;

                if ($cookieValue) {
                    Cookie::queue($cookieName, $cookieValue, $oneDayInMinutes);
                }
            }

            return redirect()->intended('/');
        }

        // Jika gagal login
        return back()->with('error', 'Username atau password salah.');
    }


    // Proses logout
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Hapus cookie remember me
        Cookie::queue(Cookie::forget(Auth::getRecallerName()));

        return redirect('/login');
    }

}
