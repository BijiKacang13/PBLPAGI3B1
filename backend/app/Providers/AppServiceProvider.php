<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

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
    public function boot(): void
    {
        // Set default string length untuk MySQL
        Schema::defaultStringLength(191);

        // Set locale Carbon ke Indonesia
        Carbon::setLocale('id');

        // Konfigurasi timezone (opsional)
        date_default_timezone_set('Asia/Jakarta');

        // Untuk API, kita tidak perlu View Composer
        // karena frontend Next.js akan fetch data sendiri via API endpoint
        
        // Jika nanti butuh share data ke semua API response,
        // bisa pakai Middleware atau Response Macro
    }
}