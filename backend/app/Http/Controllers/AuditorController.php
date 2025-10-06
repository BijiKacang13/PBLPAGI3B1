<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use App\Models\Auditor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuditorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        // Query awal dengan eager load relasi
        $query = Auditor::with(['user']);

        // Filter berdasarkan nama user (jika ada input)
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%');
            });
        }

        // Ambil hasilnya
        $auditor = $query->get();

        // Kirim data ke view
        return view('admin.auditor', compact('auditor'));
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:user,username',
            'password' => 'required|string|confirmed|min:6',
            'email' => 'required|email|max:255',
            'telp' => 'required|string|max:20',
        ]);

        try {
            DB::transaction(function () use ($request) {
                DB::statement("SET @current_user_id = " . auth()->id());

                $user = User::create([
                    'nama' => $request->nama,
                    'username' => $request->username,
                    'password' => Hash::make($request->password),
                    'role' => 'auditor',
                ]);

                Auditor::create([
                    'id_auditor' => $user->id_user,
                    'email' => $request->email,
                    'telp' => $request->telp,
                ]);
            });

            return back()->with('success', 'Auditor berhasil didaftarkan.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mendaftarkan Auditor: ' . $e->getMessage())->withInput();
        }
    }



    public function edit($id)
    {
        $auditor = Auditor::findOrFail($id);
        return view('admin.auditor-detail', compact('auditor'));
    }



    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email',
            'telp' => 'required|string|max:20',
            'username' => 'required|string|max:50',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        try {
            DB::transaction(function () use ($request, $id) {
                DB::statement("SET @current_user_id = " . auth()->id());

                $auditor = Auditor::findOrFail($id);
                $user = $auditor->user;

                // Update auditor
                $auditor->update([
                    'email' => $request->email,
                    'telp' => $request->telp,
                ]);

                // Update user info
                $user->nama = $request->nama;
                $user->username = $request->username;

                // Ganti password jika diisi
                if ($request->filled('new_password')) {
                    if (!Hash::check($request->old_password, $user->password)) {
                        throw ValidationException::withMessages([
                            'old_password' => 'Password lama tidak sesuai.'
                        ]);
                    }

                    $user->password = Hash::make($request->new_password);
                }

                $user->save();
            });

            return redirect()->route('auditor.edit', $id)->with('success', 'Data auditor berhasil diperbarui.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memperbarui data auditor: ' . $e->getMessage())->withInput();
        }
    }


    public function destroy($id)
    {
        try {
            DB::transaction(function () use ($id) {
                DB::statement("SET @current_user_id = " . auth()->id());

                $auditor = Auditor::findOrFail($id);
                $user = $auditor->user;

                // Hapus data auditor
                $auditor->delete();

                // Hapus user terkait
                if ($user) {
                    $user->delete();
                }
            });

            return redirect()->route('auditor.index')->with('success', 'Auditor berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->route('auditor.index')->with('error', 'Gagal menghapus auditor: ' . $e->getMessage());
        }
    }

}
