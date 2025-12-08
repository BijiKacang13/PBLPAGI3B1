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
use App\Http\Controllers\Api\LaporanKomprehensifController;
use App\Http\Controllers\Api\NeracaSaldoController;
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
    Route::get('/kegiatan', [KegiatanController::class, 'index']);
    Route::post('/kegiatan', [KegiatanController::class, 'store']);
    Route::put('/kegiatan/{id}', [KegiatanController::class, 'update']);
    Route::delete('/kegiatan/{id}', [KegiatanController::class, 'destroy']);

    // Kategori Akun
    Route::prefix('kategori-akun')->group(function () {
        Route::get('/', [KategoriAkunController::class, 'index']);
        Route::post('/', [KategoriAkunController::class, 'store']);
        Route::put('/{id}', [KategoriAkunController::class, 'update']);
        Route::delete('/{id}', [KategoriAkunController::class, 'destroy']);
    });

    // Sub Kategori Akun
    Route::get('/sub-kategori-akun', [SubKategoriAkunController::class, 'index']);
    Route::post('/sub-kategori-akun', [SubKategoriAkunController::class, 'store']);
    Route::put('/sub-kategori-akun/{id}', [SubKategoriAkunController::class, 'update']);
    Route::delete('/sub-kategori-akun/{id}', [SubKategoriAkunController::class, 'destroy']);

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

     Route::prefix('laporan-komprehensif')->group(function () {
        // Get data laporan
        Route::get('/', [LaporanKomprehensifController::class, 'index']);
        
        // Get dropdown options (units & divisions)
        Route::get('/options', [LaporanKomprehensifController::class, 'getOptions']);
        
        // Export to Excel
        Route::get('/export-excel', [LaporanKomprehensifController::class, 'exportExcel']);
    });
     Route::prefix('neraca-saldo')->group(function () {
        // Get neraca saldo data with filters
        Route::get('/', [NeracaSaldoController::class, 'index']);
        
        // Get filter options (units & divisions)
        Route::get('/filter-options', [NeracaSaldoController::class, 'getFilterOptions']);
        
        // Export to Excel
        Route::get('/export', [NeracaSaldoController::class, 'exportExcel']);
    });

});
Route::get('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'index']);
Route::post('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'storeOrUpdate']);
Route::post('/budget-rapbs-akun/import', [BudgetRapbsAkunController::class, 'importExcel']);