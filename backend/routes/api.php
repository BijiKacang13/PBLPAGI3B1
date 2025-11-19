<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\Api\KategoriAkunController;

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/kegiatan', [KegiatanController::class, 'index']);
Route::post('/kegiatan', [KegiatanController::class, 'store']);
Route::get('/kegiatan', [KegiatanController::class, 'apiIndex']);


Route::prefix('kategori-akun')->group(function () {
    Route::get('/', [KategoriAkunController::class, 'index']);
    Route::post('/', [KategoriAkunController::class, 'store']);
    Route::put('/{id}', [KategoriAkunController::class, 'update']);
    Route::delete('/{id}', [KategoriAkunController::class, 'destroy']);
});

