<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\User;
use App\Models\Divisi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get form data (units and divisions)
     * GET /api/users/form-data
     */
    public function getFormData()
    {
        try {
            $units = Unit::select('id_unit as id', 'unit as name', 'kode_unit')
                ->orderBy('unit')
                ->get();

            $divisi = Divisi::select('id_divisi as id', 'divisi as name')
                ->orderBy('divisi')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'unit' => $units,
                    'divisi' => $divisi
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new user (user / auditor / admin ONLY)
     * POST /api/users
     */
    public function store(Request $request)
    {
        // 🚫 Blokir jika mencoba membuat akuntan unit
        if ($request->role === 'akuntan_unit') {
            return response()->json([
                'success' => false,
                'message' => 'Gunakan endpoint Akuntan Unit untuk membuat akun ini'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'username' => 'required|string|unique:user,username|max:255',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:user,auditor,admin',
        ], [
            'nama.required' => 'Nama lengkap wajib diisi',
            'username.required' => 'Username wajib diisi',
            'username.unique' => 'Username sudah terdaftar',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'role.required' => 'Role wajib dipilih',
            'role.in' => 'Role tidak valid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'nama' => $request->nama,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dibuat',
                'data' => [
                    'user' => [
                        'id_user' => $user->id_user,
                        'nama' => $user->nama,
                        'username' => $user->username,
                        'role' => $user->role,
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users
     * GET /api/users
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();

            if ($request->filled('role')) {
                $query->where('role', $request->role);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%");
                });
            }

            $users = $query->select('id_user', 'nama', 'username', 'role', 'created_at', 'updated_at')
                ->latest()
                ->paginate($request->per_page ?? 10);

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user (TIDAK BOLEH jadi akuntan_unit)
     * PUT /api/users/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::where('id_user', $id)->firstOrFail();

            if ($request->role === 'akuntan_unit') {
                return response()->json([
                    'success' => false,
                    'message' => 'Role akuntan unit tidak bisa diubah melalui endpoint ini'
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'nama' => 'sometimes|required|string|max:255',
                'username' => 'sometimes|required|string|max:255|unique:user,username,' . $id . ',id_user',
                'password' => 'nullable|string|min:8|confirmed',
                'role' => 'sometimes|required|in:user,auditor,admin',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $data = $request->only(['nama', 'username', 'role']);

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil diperbarui',
                'data' => [
                    'user' => [
                        'id_user' => $user->id_user,
                        'nama' => $user->nama,
                        'username' => $user->username,
                        'role' => $user->role,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    public function destroy($id)
    {
        try {
            $user = User::where('id_user', $id)->firstOrFail();
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
