<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\User;
use App\Models\Auditor;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuditorController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/auditor
     */
    public function index(Request $request)
    {
        try {
            // Query awal dengan eager load relasi
            $query = Auditor::with(['user']);

            // Filter berdasarkan nama user (jika ada input)
            if ($request->filled('search')) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('nama', 'like', '%' . $request->search . '%');
                });
            }

            // Pagination atau get all
            if ($request->has('per_page')) {
                $perPage = $request->get('per_page', 10);
                $auditor = $query->paginate($perPage);
            } else {
                $auditor = $query->get();
            }

            return response()->json([
                'success' => true,
                'message' => 'Data auditor berhasil diambil',
                'data' => $auditor
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data auditor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/auditor
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|unique:user,username|max:255',
                'password' => 'required|string|min:8|confirmed',
                'email' => 'required|email',
                'telp' => 'required|string',
            ]);

            DB::beginTransaction();

            try {
                if (auth()->check()) {
                    DB::statement('SET @current_user_id = ' . auth()->id());
                }

                // Buat user
                $user = User::create([
                    'nama' => $request->nama,
                    'username' => $request->username,
                    'password' => bcrypt($request->password),
                    'role' => 'auditor',
                ]);

                // Buat auditor
                $auditor = Auditor::create([
                    'id_auditor' => $user->id_user,
                    'email' => $request->email,
                    'telp' => $request->telp,
                ]);

                DB::commit();

                // Load relasi untuk response
                $auditor->load(['user']);

                return response()->json([
                    'success' => true,
                    'message' => 'Auditor berhasil didaftarkan',
                    'data' => $auditor
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan auditor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/auditor/{id}
     */
    public function show($id)
    {
        try {
            $auditor = Auditor::with(['user'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data auditor berhasil diambil',
                'data' => $auditor
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data auditor tidak ditemukan',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     * PUT/PATCH /api/auditor/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:user,username,' . $id . ',id_user',
                'old_password' => 'required_with:new_password',
                'new_password' => 'nullable|string|min:8|confirmed',
                'email' => 'required|email',
                'telp' => 'required|string',
            ]);

            DB::beginTransaction();

            try {
                if (auth()->check()) {
                    DB::statement('SET @current_user_id = ' . auth()->id());
                }

                $user = User::findOrFail($id);
                $auditor = Auditor::where('id_auditor', $id)->firstOrFail();

                // Update password jika diisi
                if ($request->filled('new_password')) {
                    if (!Hash::check($request->old_password, $user->password)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Password lama salah',
                            'errors' => [
                                'old_password' => ['Password lama tidak sesuai']
                            ]
                        ], 422);
                    }

                    $user->password = bcrypt($request->new_password);
                }

                // Update user
                $user->nama = $request->nama;
                $user->username = $request->username;
                $user->save();

                // Update auditor
                $auditor->update([
                    'email' => $request->email,
                    'telp' => $request->telp,
                ]);

                DB::commit();

                // Load relasi untuk response
                $auditor->load(['user']);

                return response()->json([
                    'success' => true,
                    'message' => 'Auditor berhasil diperbarui',
                    'data' => $auditor
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui auditor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/auditor/{id}
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            if (auth()->check()) {
                DB::statement("SET @current_user_id = " . auth()->id());
            }

            // Cek apakah data exists
            $auditor = Auditor::findOrFail($id);

            // Hapus data auditor
            $auditor->delete();

            // Hapus user
            User::where('id_user', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Auditor berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus auditor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

