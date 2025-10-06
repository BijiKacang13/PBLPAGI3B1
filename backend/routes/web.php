<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SopController;
use App\Http\Controllers\AkunController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalkController;
use App\Http\Controllers\PRRAController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ArusKasController;
use App\Http\Controllers\AuditorController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\BukuBesarController;
use App\Http\Controllers\JurnalUmumController;
use App\Http\Controllers\AkuntanUnitController;
use App\Http\Controllers\LogActivityController;
use App\Http\Controllers\NeracaSaldoController;
use App\Http\Controllers\KategoriAkunController;
use App\Http\Controllers\DashboardAdminController;
use App\Http\Controllers\BudgetRapbsAkunController;
use App\Http\Controllers\SubKategoriAkunController;
use App\Http\Controllers\AnalisisKeuanganController;
use App\Http\Controllers\DashboardAuditorController;
use App\Http\Controllers\PerubahanAsetNetoController;
use App\Http\Controllers\BudgetRapbsKegiatanController;
use App\Http\Controllers\LaporanKomprehensifController;
use App\Http\Controllers\DashboardAkuntanUnitController;



Route::get('/login', [AuthController::class, 'login_form'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');



Route::get('/', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }

    $role = Auth::user()->role;

    return match ($role) {
        'admin' => redirect()->route('admin-dashboard.index'),
        'auditor' => redirect()->route('auditor-dashboard.index'),
        'akuntan_unit' => redirect()->route('akuntan_unit.index'),
        default => abort(403, 'Unauthorized role'),
    };
});



Route::middleware('auth')->group(function () {

    //Dashboard
    Route::get('/dashboard-admin', [DashboardAdminController::class, 'index'])->middleware('role:admin')->name('admin-dashboard.index');
    Route::get('/dashboard-auditor', [DashboardAuditorController::class, 'index'])->middleware('role:auditor')->name('auditor-dashboard.index');
    Route::get('/dashboard-akuntan', [DashboardAkuntanUnitController::class, 'index'])->middleware('role:akuntan_unit')->name('akuntan_unit.index');


    // Kategori Akun
    Route::get('/kategori-akun', [KategoriAkunController::class, 'index'])->middleware('role:admin')->name('kategori-akun.index');
    Route::post('/kategori-akun', [KategoriAkunController::class, 'store'])->middleware('role:admin')->name('kategori-akun.store');
    Route::put('/kategori-akun', [KategoriAkunController::class, 'update'])->middleware('role:admin')->name('kategori-akun.update');
    Route::delete('/kategori-akun', [KategoriAkunController::class, 'destroy'])->middleware('role:admin')->name('kategori-akun.destroy');


    // Sub Kategori Akun
    Route::get('/sub-kategori-akun', [SubKategoriAkunController::class, 'index'])->middleware('role:admin')->name('sub-kategori-akun.index');
    Route::post('/sub-kategori-akun', [SubKategoriAkunController::class, 'store'])->middleware('role:admin')->name('sub-kategori-akun.store');
    Route::put('/sub-kategori-akun', [SubKategoriAkunController::class, 'update'])->middleware('role:admin')->name('sub-kategori-akun.update');
    Route::delete('/sub-kategori-akun', [SubKategoriAkunController::class, 'destroy'])->middleware('role:admin')->name('sub-kategori-akun.destroy');


    // Akun
    Route::get('/akun', [AkunController::class, 'index'])->middleware('role:admin')->name('akun.index');
    Route::post('/akun', [AkunController::class, 'store'])->middleware('role:admin')->name('akun.store');
    Route::put('/akun', [AkunController::class, 'update'])->middleware('role:admin')->name('akun.update');
    Route::delete('/akun', [AkunController::class, 'destroy'])->middleware('role:admin')->name('akun.destroy');
    Route::post('/akun/import', [AkunController::class, 'import'])->middleware('role:admin')->name('akun.import');


    // Budget Rapbs AKun
    Route::get('/budget-rapbs-akun', [BudgetRapbsAkunController::class, 'index'])->middleware('role:admin,akuntan_unit', 'hak_akses:view_rapbs_akun')->name('budget-rapbs-akun.index'); 
    Route::post('/budget-rapbs-akun/store-or-update', [BudgetRapbsAkunController::class, 'storeOrUpdate'])->middleware('role:admin,akuntan_unit', 'hak_akses:create_rapbs_akun', 'hak_akses:update_rapbs_akun')->name('budget-rapbs-akun.storeOrUpdate');
    Route::post('/budget-rapbs-akun/import', [BudgetRapbsAkunController::class, 'importExcel'])->middleware('role:admin,akuntan_unit', 'hak_akses:create_rapbs_akun', 'hak_akses:update_rapbs_akun')->name('budget-rapbs-akun.import');


    // Kegiatan
    Route::get('/kegiatan', [KegiatanController::class, 'index'])->middleware('role:admin')->name('kegiatan.index');
    Route::post('/kegiatan', [KegiatanController::class, 'store'])->middleware('role:admin')->name('kegiatan.store');
    Route::put('/kegiatan', [KegiatanController::class, 'update'])->middleware('role:admin')->name('kegiatan.update');
    Route::delete('/kegiatan', [KegiatanController::class, 'destroy'])->middleware('role:admin')->name('kegiatan.destroy');
    Route::post('/kegiatan/import', [KegiatanController::class, 'import'])->middleware('role:admin')->name('kegiatan.import');
    Route::delete('/kegiatan/reset', [KegiatanController::class, 'resetByUnit'])->middleware('role:admin')->name('kegiatan.reset');


    // Budget Rapbs Kegiatan
    Route::get('/budget-rapbs-kegiatan', [BudgetRapbsKegiatanController::class, 'index'])->middleware('role:admin,akuntan_unit', 'hak_akses:view_rapbs_kegiatan')->name('budget-rapbs-kegiatan.index'); 
    Route::post('/budget-rapbs-kegiatan/store-or-update', [BudgetRapbsKegiatanController::class, 'storeOrUpdate'])->middleware('role:admin,akuntan_unit', 'hak_akses:create_rapbs_kegiatan', 'hak_akses:update_rapbs_kegiatan')->name('budget-rapbs-kegiatan.storeOrUpdate');
    Route::post('/budget-rapbs-kegiatan/import', [BudgetRapbsKegiatanController::class, 'importExcel'])->middleware('role:admin,akuntan_unit', 'hak_akses:create_rapbs_kegiatan', 'hak_akses:update_rapbs_kegiatan')->name('budget-rapbs-kegiatan.import');





    // calk
    Route::get('/calk', [CalkController::class, 'index'])->middleware('role:admin,akuntan_unit,auditor')->name('calk.index');
    Route::post('/calk', [CalkController::class, 'store'])->middleware('role:admin')->name('calk.store');
    Route::put('/calk/{id}', [CalkController::class, 'update'])->middleware('role:admin')->name('calk.update');
    Route::delete('/calk/{id}', [CalkController::class, 'destroy'])->middleware('role:admin')->name('calk.destroy');





    // sop
    Route::get('/sop', [SopController::class, 'index'])->middleware('role:admin')->name('sop.index');
    Route::post('/sop', [SopController::class, 'store'])->middleware('role:admin')->name('sop.store');
    Route::put('/sop/{id}', [SopController::class, 'update'])->middleware('role:admin')->name('sop.update');
    Route::delete('/sop/{id}', [SopController::class, 'destroy'])->middleware('role:admin')->name('sop.destroy');
    Route::post('/sop/sort', [SopController::class, 'sort'])->middleware('role:admin')->name('sop.sort');





    // log-aktivitas
    Route::get('/log-aktivitas', [LogActivityController::class, 'index'])->middleware('role:admin,auditor')->name('log-aktivitas.index');




    // Kelola Akun Pengguna----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    Route::middleware('role:admin')->group(function () {
        // Register Form
        Route::get('/admin/buat-akun', [UserController::class, 'create'])->name('user.create');
        // Akuntan Unit
        Route::get('/akuntan-unit', [AkuntanUnitController::class, 'index'])->name('akuntan-unit.index');
        Route::post('/register-akuntan-unit', [AkuntanUnitController::class, 'store'])->name('register.akuntan.unit');
        Route::get('/akuntan-unit/{id}', [AkuntanUnitController::class, 'edit'])->name('akuntan-unit.edit');
        Route::put('/akuntan-unit/{id}', [AkuntanUnitController::class, 'update'])->name('akuntan-unit.update');
        Route::delete('/akuntan-unit/{id}', [AkuntanUnitController::class, 'destroy'])->name('akuntan-unit.destroy');
        // Auditor
        Route::post('/register-auditor', [AuditorController::class, 'store'])->name('register.auditor');
        Route::get('/auditor', [AuditorController::class, 'index'])->name('auditor.index');
        Route::get('/auditor/{id}', [AuditorController::class, 'edit'])->name('auditor.edit');
        Route::put('/auditor/{id}', [AuditorController::class, 'update'])->name('auditor.update');
        Route::delete('/auditor/{id}', [AuditorController::class, 'destroy'])->name('auditor.destroy');
    });







    // Transaksi & Pencatatan ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // Input Transaksi
    Route::middleware(['role:admin,akuntan_unit','hak_akses:create_jurnal_umum'])->get('/input-transaksi', [JurnalUmumController::class, 'create']); 
    Route::middleware(['role:admin,akuntan_unit','hak_akses:create_jurnal_umum'])->post('/jurnal-umum', [JurnalUmumController::class, 'store'])->name('jurnal-umum.store'); 
    Route::middleware(['role:admin,akuntan_unit','hak_akses:create_jurnal_umum'])->post('/jurnal-umum/import', [JurnalUmumController::class, 'import'])->name('jurnal-umum.import'); 
    // Edit Jurnal
    Route::middleware(['role:admin,akuntan_unit','hak_akses:update_jurnal_umum'])->get('/jurnal-umum/{id}', [JurnalUmumController::class, 'edit'])->name('jurnal-umum.edit'); 
    Route::middleware(['role:admin,akuntan_unit','hak_akses:update_jurnal_umum'])->put('/jurnal-umum/{id}', [JurnalUmumController::class, 'update'])->name('jurnal-umum.update'); 
    // Delete Jurnal
    Route::middleware(['role:admin,akuntan_unit','hak_akses:delete_jurnal_umum'])->delete('/jurnal-umum/{id}', [JurnalUmumController::class, 'destroy'])->name('jurnal-umum.destroy'); 
    Route::middleware(['role:admin,akuntan_unit','hak_akses:view_jurnal_umum'])->get('/jurnal-umum', [JurnalUmumController::class, 'index'])->name('jurnal-umum.index'); 
    // Buku Besar
    Route::middleware(['role:admin,akuntan_unit,auditor','hak_akses:view_buku_besar'])->get('/buku-besar', [BukuBesarController::class, 'index'])->name('buku-besar.index'); 
    Route::middleware(['role:admin,akuntan_unit','hak_akses:create_buku_besar'])->post('/buku-besar', [BukuBesarController::class, 'store'])->name('buku-besar.store'); 
    Route::middleware(['role:admin,akuntan_unit','hak_akses:create_buku_besar'])->post('/buku-besar/posting-semua', [BukuBesarController::class, 'postingSemua'])->name('buku-besar.postingSemua');






    // Laporan Keuangan ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    Route::middleware(['role:admin,akuntan_unit,auditor','hak_akses:view_laporan_komprehensif'])->get('/laporan-komprehensif', [LaporanKomprehensifController::class, 'index'])->name('laporan-komprehensif.index');
    Route::middleware(['role:admin,akuntan_unit,auditor','hak_akses:view_laporan_posisi_keuangan'])->get('/neraca-saldo', [NeracaSaldoController::class, 'index'])->name('neraca-saldo.index'); 
    Route::middleware(['role:admin,akuntan_unit,auditor','hak_akses:view_laporan_arus_kas'])->get('/arus-kas', [ArusKasController::class, 'index'])->name('arus-kas.index'); 
    Route::middleware(['role:admin,akuntan_unit,auditor','hak_akses:view_laporan_perubahan_aset_neto'])->get('/perubahan-aset-neto', [PerubahanAsetNetoController::class, 'index'])->name('perubahan-aset-neto.index');
    Route::middleware(['role:admin,akuntan_unit,auditor','hak_akses:view_laporan_proyeksi_rencana_dan_realisasi_anggaran'])->get('/prra', [PRRAController::class, 'index'])->name('prra.index'); 



});




// routes/web.php
Route::get('/test-db-error', function () {
    DB::select('SELECT * FROM table_tidak_ada');
});

