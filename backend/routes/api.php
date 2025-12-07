<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuditorController;
use App\Http\Controllers\Api\KategoriAkunController;
use App\Http\Controllers\Api\SubKategoriAkunController;
use App\Http\Controllers\Api\AkunController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\BudgetRapbsAkunController;

Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {

});

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::post('/refresh', [AuthController::class, 'refresh']);


    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/akun/tambah', [UserController::class, 'create']);


    Route::get('/auditor', [AuditorController::class, 'index']);
    Route::post('/auditor', [AuditorController::class, 'store']);
    Route::get('/auditor/{id}', [AuditorController::class, 'edit']);
    Route::put('/auditor/{id}', [AuditorController::class, 'update']);
    Route::delete('/auditor/{id}', [AuditorController::class, 'destroy']);


    Route::get('/kegiatan', [KegiatanController::class, 'index']); 
    Route::post('/kegiatan', [KegiatanController::class, 'store']);
    Route::put('/kegiatan/{id}', [KegiatanController::class, 'update']);
    Route::delete('/kegiatan/{id}', [KegiatanController::class, 'destroy']);


    Route::prefix('kategori-akun')->group(function () {
        Route::get('/', [KategoriAkunController::class, 'index']);
        Route::post('/', [KategoriAkunController::class, 'store']);
        Route::put('/{id}', [KategoriAkunController::class, 'update']);
        Route::delete('/{id}', [KategoriAkunController::class, 'destroy']);
    });


    Route::get('/sub-kategori-akun', [SubKategoriAkunController::class, 'index']);
    Route::post('/sub-kategori-akun', [SubKategoriAkunController::class, 'store']);
    Route::put('/sub-kategori-akun/{id}', [SubKategoriAkunController::class, 'update']);
    Route::delete('/sub-kategori-akun/{id}', [SubKategoriAkunController::class, 'destroy']);


    Route::get('/akun', [AkunController::class, 'index']);
    Route::post('/akun', [AkunController::class, 'store']);
    Route::put('/akun/{id}', [AkunController::class, 'update']);
    Route::delete('/akun/{id}', [AkunController::class, 'destroy']);

Route::get('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'index']);
Route::post('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'storeOrUpdate']);
Route::post('/budget-rapbs-akun/import', [BudgetRapbsAkunController::class, 'importExcel']);