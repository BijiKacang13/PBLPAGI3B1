<?php

namespace App\Http;

use App\Http\Middleware\EncryptCookies;
use App\Http\Middleware\HakAksesMiddleware;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use App\Http\Middleware\RoleMiddleware; 
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class Kernel extends HttpKernel
{
    protected $middleware = [
        // Middleware global
    ];

    protected $middlewareGroups = [
        'web' => [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            ShareErrorsFromSession::class,
            VerifyCsrfToken::class,
            SubstituteBindings::class,
        ],

        'api' => [
            EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            SubstituteBindings::class,
        ],
    ];

    protected $routeMiddleware = [
        'auth' => Authenticate::class,
        'guest' => RedirectIfAuthenticated::class,
        'role' => RoleMiddleware::class,
        // 'hak_akses' => HakAksesMiddleware::class,
    ];
}