<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuditorController;
use App\Http\Controllers\Api\KategoriAkunController;
use App\Http\Controllers\Api\SubKategoriAkunController;
use App\Http\Controllers\Api\AkunController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\BudgetRapbsAkunController;
use App\Http\Controllers\Api\AkuntanUnitController;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth Routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Users
    Route::get('/users/form-data', [UserController::class, 'getFormData']);
    Route::apiResource('users', UserController::class);

    // Kegiatan
    Route::prefix('kegiatan')->group(function () {
        Route::get('/', [KegiatanController::class, 'index']);
        Route::post('/', [KegiatanController::class, 'store']);
        Route::put('/{id}', [KegiatanController::class, 'update']);
        Route::delete('/{id}', [KegiatanController::class, 'destroy']);
    });

    // Kategori Akun
    Route::prefix('kategori-akun')->group(function () {
        Route::get('/', [KategoriAkunController::class, 'index']);
        Route::post('/', [KategoriAkunController::class, 'store']);
        Route::put('/{id}', [KategoriAkunController::class, 'update']);
        Route::delete('/{id}', [KategoriAkunController::class, 'destroy']);
    });

    // Sub Kategori Akun
    Route::prefix('sub-kategori-akun')->group(function () {
        Route::get('/', [SubKategoriAkunController::class, 'index']);
        Route::post('/', [SubKategoriAkunController::class, 'store']);
        Route::put('/{id}', [SubKategoriAkunController::class, 'update']);
        Route::delete('/{id}', [SubKategoriAkunController::class, 'destroy']);
    });

    //Akun
    Route::prefix('akun')->group(function () {
        Route::get('/', [AkunController::class, 'index']);
        Route::post('/', [AkunController::class, 'store']);
        Route::put('/{id}', [AkunController::class, 'update']);
        Route::delete('/{id}', [AkunController::class, 'destroy']);
    });

    // Budget RAPBS Akun
    Route::prefix('budget-rapbs-akun')->group(function () {
        Route::get('/', [BudgetRapbsAkunController::class, 'index']);
        Route::post('/', [BudgetRapbsAkunController::class, 'storeOrUpdate']);
        Route::post('/import', [BudgetRapbsAkunController::class, 'importExcel']);
    });

    // Akuntan Unit - FIXED: Hapus duplikasi dan tambahkan route units
    Route::prefix('akuntan-unit')->group(function () {
        Route::get('/units', [AkuntanUnitController::class, 'getUnits']); // Endpoint untuk dropdown units
        Route::get('/', [AkuntanUnitController::class, 'index']);
        Route::post('/', [AkuntanUnitController::class, 'store']);
        Route::get('/{id}', [AkuntanUnitController::class, 'show']);
        Route::put('/{id}', [AkuntanUnitController::class, 'update']);
        Route::delete('/{id}', [AkuntanUnitController::class, 'destroy']);
    });

    // Auditor
    Route::prefix('auditor')->group(function () {
        Route::get('/', [AuditorController::class, 'index']);
        Route::post('/', [AuditorController::class, 'store']);
        Route::get('/{id}', [AuditorController::class, 'show']);
        Route::put('/{id}', [AuditorController::class, 'update']);
        Route::delete('/{id}', [AuditorController::class, 'destroy']);
    });

});

// Route::get('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'index']);
// Route::post('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'storeOrUpdate']);
// Route::post('/budget-rapbs-akun/import', [BudgetRapbsAkunController::class, 'importExcel']);