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
use App\Http\Controllers\API\JurnalUmumController;
use App\Http\Controllers\Api\BukuBesarController;
use App\Http\Controllers\Api\LaporanKomprehensifController;
use App\Http\Controllers\Api\NeracaSaldoController;
use App\Http\Controllers\Api\PerubahanAsetNetoController;
use App\Http\Controllers\Api\AkuntanUnitController;
use App\Http\Controllers\Api\PRRAController;
use App\Http\Controllers\Api\ArusKasController;
use App\Http\Controllers\Api\CalkController;
use App\Http\Controllers\Api\LogActivityController;
use App\Http\Controllers\Api\BudgetRapbsKegiatanController;

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

    // Jurnal Umum
    Route::prefix('jurnal-umum')->group(function () {
        Route::get('/', [JurnalUmumController::class, 'index']);
        Route::post('/', [JurnalUmumController::class, 'store']);
        Route::get('/{id}', [JurnalUmumController::class, 'show']);
        Route::put('/{id}', [JurnalUmumController::class, 'update']);
        Route::delete('/{id}', [JurnalUmumController::class, 'destroy']);
        Route::get('/export', [JurnalUmumController::class, 'export']);
    });

    // Buku Besar
    Route::prefix('buku-besar')->group(function () {
        Route::get('/', [BukuBesarController::class, 'index']);
        Route::get('/akun-list', [BukuBesarController::class, 'getAkunList']);
        Route::get('/export', [BukuBesarController::class, 'exportExcel']);
        Route::post('/posting', [BukuBesarController::class, 'store']);
        Route::post('/posting-semua', [BukuBesarController::class, 'postingSemua']);
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

    Route::prefix('prra')->group(function () {
        Route::get('/', [PRRAController::class, 'index']);
        Route::get('/filter-options', [PRRAController::class, 'getFilterOptions']);
        Route::get('/export', [PRRAController::class, 'export']);
    });

    Route::prefix('arus-kas')->group(function () {
        // Get arus kas data with filters
        Route::get('/', [ArusKasController::class, 'index']);
        // Get dropdown options (units & divisions)
        Route::get('/options', [ArusKasController::class, 'getOptions']);
        // Export to Excel
        Route::get('/export', [ArusKasController::class, 'exportExcel']);
    });
    
     Route::prefix('perubahan-aset-neto')->group(function () {
        Route::get('/', [PerubahanAsetNetoController::class, 'index']);
        Route::get('/export-excel', [PerubahanAsetNetoController::class, 'exportExcel']);
        Route::get('/units', [PerubahanAsetNetoController::class, 'getUnits']);
        Route::get('/divisi', [PerubahanAsetNetoController::class, 'getDivisi']);
    });

    Route::prefix('laporan')->group(function () {
        Route::get('calk', [CalkController::class, 'index']);
        Route::post('calk', [CalkController::class, 'store']);
        Route::get('calk/{id}', [CalkController::class, 'show']);
        Route::put('calk/{id}', [CalkController::class, 'update']);
        Route::delete('calk/{id}', [CalkController::class, 'destroy']);
    });

    //Log Aktivitas
    Route::get('/log-aktivitas', [LogActivityController::class, 'index']);
});
Route::get('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'index']);
Route::post('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'storeOrUpdate']);
Route::post('/budget-rapbs-akun/import', [BudgetRapbsAkunController::class, 'importExcel']);


Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('budget-rapbs-kegiatan')->group(function () {
        Route::get('/', [BudgetRapbsKegiatanController::class, 'index']);
        Route::post('/', [BudgetRapbsKegiatanController::class, 'storeOrUpdate']);
        Route::put('/{id}', [BudgetRapbsKegiatanController::class, 'update']);
    });
});

