<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user dan generate token
     */
    public function login(Request $request)
    {
        try {
            // Log request untuk debugging
            Log::info('Login attempt', ['username' => $request->username]);

            // Validasi input
            $credentials = $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
                'remember' => 'nullable|boolean'
            ]);

            // Cari user berdasarkan username
            $user = User::where('username', $credentials['username'])->first();

            // Log jika user tidak ditemukan
            if (!$user) {
                Log::warning('User not found', ['username' => $credentials['username']]);
            }

            // Cek apakah user ada dan password benar
            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username atau password salah.'
                ], 401);
            }

            // Cek role user
            if (!in_array($user->role, ['admin', 'akuntan_unit', 'auditor'])) {
                Log::warning('Invalid role', ['username' => $user->username, 'role' => $user->role]);
                return response()->json([
                    'success' => false,
                    'message' => 'Role tidak dikenali atau tidak memiliki akses.'
                ], 403);
            }

            // Tentukan durasi token berdasarkan remember me
            $remember = $request->input('remember', false);
            $tokenName = $remember ? 'auth-token-remembered' : 'auth-token';
            
            // Hapus token lama jika ada
            $user->tokens()->delete();

            // Generate token baru
            $expiresAt = $remember ? now()->addDay() : now()->addHours(2);
            $token = $user->createToken($tokenName, ['*'], $expiresAt)->plainTextToken;

            Log::info('Login successful', ['username' => $user->username]);

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'name' => $user->name ?? $user->username,
                        'email' => $user->email ?? null,
                        'role' => $user->role,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => $remember ? '24 hours' : '2 hours'
                ]
            ], 200);

        } catch (ValidationException $e) {
            Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get authenticated user data
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => $user->name ?? $user->username,
                    'email' => $user->email ?? null,
                    'role' => $user->role,
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Me endpoint error', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Logout error', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat logout.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}