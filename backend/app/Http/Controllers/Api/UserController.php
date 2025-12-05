<?php

namespace App\Http\Controllers\Api;

use App\Models\Unit;
use App\Models\User;
use App\Models\Divisi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
     * Constructor - Exclude getFormData dari auth middleware
     */
    public function __construct()
    {
        // Jika ada auth middleware, exclude method getFormData
        // $this->middleware('auth:sanctum')->except(['getFormData']);
    }

    /**
     * Get data untuk form create user (divisi & unit)
     * Method ini PUBLIC - tidak perlu authentication
     */
    public function getFormData()
    {
        try {
            Log::info('=== getFormData START ===');
            
            // Cek koneksi database
            try {
                \DB::connection()->getPdo();
                Log::info('Database connection: OK');
            } catch (\Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                throw new \Exception('Database connection failed');
            }
            
            // Cek apakah tabel divisi ada
            if (!\Schema::hasTable('divisi')) {
                Log::error('Table divisi does not exist');
                throw new \Exception('Table divisi tidak ditemukan. Jalankan migration terlebih dahulu.');
            }
            
            // Cek apakah tabel unit ada
            if (!\Schema::hasTable('unit')) {
                Log::error('Table unit does not exist');
                throw new \Exception('Table unit tidak ditemukan. Jalankan migration terlebih dahulu.');
            }
            
            Log::info('Tables exist: divisi, unit');
            
            // Mengambil data divisi dengan select spesifik kolom
            try {
                $divisi = Divisi::select('id_divisi as id', 'divisi as name')->get();
                Log::info('Divisi fetched: ' . $divisi->count() . ' records');
            } catch (\Exception $e) {
                Log::error('Error fetching divisi: ' . $e->getMessage());
                throw new \Exception('Gagal mengambil data divisi: ' . $e->getMessage());
            }
            
            // Mengambil data unit dengan select spesifik kolom
            try {
                $unit = Unit::select('id_unit as id', 'kode_unit', 'unit as name')->get();
                Log::info('Unit fetched: ' . $unit->count() . ' records');
            } catch (\Exception $e) {
                Log::error('Error fetching unit: ' . $e->getMessage());
                throw new \Exception('Gagal mengambil data unit: ' . $e->getMessage());
            }

            Log::info('=== getFormData SUCCESS ===', [
                'divisi_count' => $divisi->count(),
                'unit_count' => $unit->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'divisi' => $divisi,
                    'unit' => $unit
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('=== getFormData ERROR ===');
            Log::error('Error message: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data form: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Get all users
     */
    public function index()
    {
        try {
            $users = User::with(['divisi', 'unit'])->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single user
     */
    public function show($id)
    {
        try {
            $user = User::with(['divisi', 'unit'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new user
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username|max:255',
            'email' => 'required|email|unique:users,email',
            'telp' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'id_divisi' => 'nullable|exists:divisi,id_divisi',
            'id_unit' => 'nullable|exists:unit,id_unit',
            'role' => 'required|in:admin,user,manager,auditor',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userData = [
                'nama' => $request->nama,
                'username' => $request->username,
                'email' => $request->email,
                'telp' => $request->telp,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'permissions' => $request->permissions ?? []
            ];

            // Tambahkan id_unit atau id_divisi jika ada
            if ($request->has('id_unit') && $request->id_unit) {
                $userData['id_unit'] = $request->id_unit;
            }

            if ($request->has('id_divisi') && $request->id_divisi) {
                $userData['id_divisi'] = $request->id_divisi;
            }

            $user = User::create($userData);

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dibuat',
                'data' => $user->load(['divisi', 'unit'])
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating user: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|unique:users,username,' . $id . '|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'telp' => 'sometimes|string|max:20',
            'password' => 'sometimes|string|min:8|confirmed',
            'id_divisi' => 'nullable|exists:divisi,id_divisi',
            'id_unit' => 'nullable|exists:unit,id_unit',
            'role' => 'sometimes|in:admin,user,manager,auditor',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($id);

            $data = $request->only(['nama', 'username', 'email', 'telp', 'id_divisi', 'id_unit', 'role', 'permissions']);
            
            if ($request->has('password') && $request->password) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'User berhasil diupdate',
                'data' => $user->load(['divisi', 'unit'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
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