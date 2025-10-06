<?php

namespace App\Providers;

use Carbon\Carbon;
use App\Models\Sop;
use App\Models\Hak_Akses;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        View::composer('*', function ($view) {
            if (Auth::check()) {
                $user = Auth::user();
                $hak_akses = null;
                $sidebarSop = collect(); 

                try {
                    if ($user->role === 'akuntan_unit') {
                        $hak_akses = Hak_Akses::where('id_akuntan_unit', $user->id_user)->first();
                    }

                    $sidebarSop = Sop::orderBy('urutan')->get();

                } catch (\Throwable $e) {
                    // Jika terjadi error, jangan lakukan apa-apa di sini
                    // Biarkan Laravel menanganinya dan masuk ke Handler
                    // Kamu bisa log kalau mau:
                    // \Log::error('Gagal memuat data sidebar: ' . $e->getMessage());
                }

                // Tetap kirim data ke view (meski mungkin nilainya null/kosong)
                $view->with('user', $user)
                     ->with('sidebarRole', $user->role)
                     ->with('sidebarHakAkses', $hak_akses)
                     ->with('sidebarSop', $sidebarSop);
            }
        });

        Carbon::setLocale('id');
    }




}
