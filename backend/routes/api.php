<?php

use Illuminate\Http\Request;
use App\Http\Controllers\KegiatanController;

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\KategoriAkunController;
use App\Http\Controllers\Api\AuditorController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AkuntanUnitController;
use App\Http\Controllers\Api\SubKategoriAkunController;


// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth endpoints
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
});
Route::middleware('auth:sanctum')->group(function () {

    
});


        Route::post('/akun/tambah', [UserController::class, 'create']);
        Route::get('/auditor', [AuditorController::class, 'index']);
Route::post('/auditor', [AuditorController::class, 'store']);
Route::get('/auditor/{id}', [AuditorController::class, 'edit']);
Route::put('/auditor/{id}', [AuditorController::class, 'update']);
Route::delete('/auditor/{id}', [AuditorController::class, 'destroy']);



Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/kegiatan', [KegiatanController::class, 'index']);
Route::post('/kegiatan', [KegiatanController::class, 'store']);
Route::get('/kegiatan', [KegiatanController::class, 'apiIndex']);
Route::put('/kegiatan/{id}', [KegiatanController::class, 'update']);
Route::delete('/{id}', [KegiatanController::class, 'destroy']);


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