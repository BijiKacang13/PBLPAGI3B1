<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Unit;
use App\Models\User;
use App\Models\Hak_Akses;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AkuntanUnitController extends Controller
{
        public function index(Request $request)
        {
            // Ambil semua data unit untuk dropdown
            $unit = Unit::all();

            // Query awal dengan eager load relasi
            $query = Akuntan_Unit::with(['user', 'unit']);

            // Filter berdasarkan nama user (jika ada input)
            if ($request->filled('search')) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('nama', 'like', '%' . $request->search . '%');
                });
            }

            // Filter berdasarkan unit (jika ada input)
            if ($request->filled('unit')) {
                $query->where('id_unit', $request->unit);
            }

            // Ambil hasilnya
            $akuntan_unit = $query->get();

            // Kirim data ke view
            return view('admin.akuntan-unit', compact('akuntan_unit', 'unit'));
        }


        public function store(Request $request)
        {
            $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|unique:user,username|max:255',
                'password' => 'required|string|min:8|confirmed',
                'id_unit' => 'required|exists:unit,id_unit',
                'email' => 'required|email',
                'telp' => 'required|string',
            ]);

            try {
                DB::transaction(function () use ($request) {
                    DB::statement('SET @current_user_id = ' . auth()->id());

                    // Buat user
                    $user = User::create([
                        'nama' => $request->nama,
                        'username' => $request->username,
                        'password' => bcrypt($request->password),
                        'role' => 'akuntan_unit',
                    ]);

                    // Akuntan_Unit
                    Akuntan_Unit::create([
                        'id_akuntan_unit' => $user->id_user,
                        'id_unit' => $request->id_unit,
                        'email' => $request->email,
                        'telp' => $request->telp,
                    ]);

                    // Hak Akses
                    Hak_Akses::create([
                        'id_akuntan_unit' => $user->id_user,
                        'view_rapbs_akun' => $request->boolean('view_rapbs_akun'),
                        'create_rapbs_akun' => $request->boolean('create_rapbs_akun'),
                        'update_rapbs_akun' => $request->boolean('update_rapbs_akun'),
                        'view_rapbs_kegiatan' => $request->boolean('view_rapbs_kegiatan'),
                        'create_rapbs_kegiatan' => $request->boolean('create_rapbs_kegiatan'),
                        'update_rapbs_kegiatan' => $request->boolean('update_rapbs_kegiatan'),
                        'view_jurnal_umum' => $request->boolean('view_jurnal_umum'),
                        'create_jurnal_umum' => $request->boolean('create_jurnal_umum'),
                        'update_jurnal_umum' => $request->boolean('update_jurnal_umum'),
                        'delete_jurnal_umum' => $request->boolean('delete_jurnal_umum'),
                        'view_buku_besar' => $request->boolean('view_buku_besar'),
                        'create_buku_besar' => $request->boolean('create_buku_besar'),
                        'delete_buku_besar' => $request->boolean('delete_buku_besar'),
                        'view_laporan_komprehensif' => $request->boolean('view_laporan_komprehensif'),
                        'view_laporan_posisi_keuangan' => $request->boolean('view_laporan_posisi_keuangan'),
                        'view_laporan_arus_kas' => $request->boolean('view_laporan_arus_kas'),
                        'view_laporan_perubahan_aset_neto' => $request->boolean('view_laporan_perubahan_aset_neto'),
                        'view_laporan_catatan_atas_laporan_keuangan' => $request->boolean('view_laporan_catatan_atas_laporan_keuangan'),
                        'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => $request->boolean('view_laporan_proyeksi_rencana_dan_realisasi_anggaran'),
                    ]);
                });

                return back()->with('success', 'Akuntan Unit berhasil didaftarkan.');
            } catch (\Exception $e) {
                return back()->with('error', 'Error: ' . $e->getMessage())->withInput();
            }
        }





        public function edit($id)
        {
            $akuntan_unit = Akuntan_Unit::findOrFail($id);
            $user = User::findOrFail($id);
            $unit = Unit::all();  // Ambil semua unit
            $akses = Hak_Akses::where('id_akuntan_unit', $id)->first();
            // dd($akses->create_jurnal_umum );
            return view('admin.akuntan-unit-detail', compact('akuntan_unit', 'unit', 'user', 'akses'));
        }



        public function update(Request $request, $id)
        {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:user,username,' . $id . ',id_user',
                'new_password' => 'nullable|string|min:8|confirmed',
                'id_unit' => 'required|exists:unit,id_unit',
                'email' => 'required|email',
                'telp' => 'required|string',
            ]);

            try {
                DB::transaction(function () use ($request, $id) {
                    DB::statement('SET @current_user_id = ' . auth()->id());

                    $user = User::findOrFail($id);
                    $akuntanUnit = Akuntan_Unit::where('id_akuntan_unit', $id)->firstOrFail();
                    $hakAkses = Hak_Akses::where('id_akuntan_unit', $id)->firstOrFail();

                    // Update password jika diisi
                    if ($request->filled('new_password')) {
                        if (!Hash::check($request->old_password, $user->password)) {
                            throw ValidationException::withMessages([
                                'old_password' => 'Password lama salah.'
                            ]);
                        }

                        $user->password = bcrypt($request->new_password);
                    }

                    // Update user
                    $user->nama = $request->nama;
                    $user->username = $request->username;
                    $user->save();

                    // Update akuntan_unit
                    $akuntanUnit->update([
                        'id_unit' => $request->id_unit,
                        'email' => $request->email,
                        'telp' => $request->telp,
                    ]);

                    // Update hak akses
                    $hakAkses->update([
                        'view_rapbs_akun' => $request->boolean('view_rapbs_akun'),
                        'create_rapbs_akun' => $request->boolean('create_rapbs_akun'),
                        'update_rapbs_akun' => $request->boolean('update_rapbs_akun'),
                        'view_rapbs_kegiatan' => $request->boolean('view_rapbs_kegiatan'),
                        'create_rapbs_kegiatan' => $request->boolean('create_rapbs_kegiatan'),
                        'update_rapbs_kegiatan' => $request->boolean('update_rapbs_kegiatan'),
                        'view_jurnal_umum' => $request->boolean('view_jurnal_umum'),
                        'create_jurnal_umum' => $request->boolean('create_jurnal_umum'),
                        'update_jurnal_umum' => $request->boolean('update_jurnal_umum'),
                        'delete_jurnal_umum' => $request->boolean('delete_jurnal_umum'),
                        'view_buku_besar' => $request->boolean('view_buku_besar'),
                        'create_buku_besar' => $request->boolean('create_buku_besar'),
                        'delete_buku_besar' => $request->boolean('delete_buku_besar'),
                        'view_laporan_komprehensif' => $request->boolean('view_laporan_komprehensif'),
                        'view_laporan_posisi_keuangan' => $request->boolean('view_laporan_posisi_keuangan'),
                        'view_laporan_arus_kas' => $request->boolean('view_laporan_arus_kas'),
                        'view_laporan_perubahan_aset_neto' => $request->boolean('view_laporan_perubahan_aset_neto'),
                        'view_laporan_catatan_atas_laporan_keuangan' => $request->boolean('view_laporan_catatan_atas_laporan_keuangan'),
                        'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => $request->boolean('view_laporan_proyeksi_rencana_dan_realisasi_anggaran'),
                    ]);
                });

                return back()->with('success', 'Akuntan Unit berhasil diperbarui.');
            } catch (ValidationException $e) {
                return back()->withErrors($e->errors())->withInput();
            } catch (\Exception $e) {
                return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
            }
        }




        public function destroy($id)
        {
            DB::beginTransaction();

            try {
                DB::statement("SET @current_user_id = " . auth()->id());


                // Hapus hak akses terlebih dahulu (foreign key constraint)
                Hak_Akses::where('id_akuntan_unit', $id)->delete();

                // Hapus data akuntan unit
                Akuntan_Unit::where('id_akuntan_unit', $id)->delete();

                // Hapus user
                User::where('id_user', $id)->delete();

                DB::commit();
                return redirect()->route('akuntan-unit.index')->with('success', 'Akuntan Unit berhasil dihapus.');
            } catch (\Exception $e) {
                DB::rollBack();
                return redirect()->back()->with('error', 'Gagal menghapus: ' . $e->getMessage());
            }
        }

}
