<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Calk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CalkController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/laporan/calk
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Query builder
            $query = Calk::query();
            
            // Filter berdasarkan keterangan jika search diisi
            if ($request->filled('search')) {
                $query->where('keterangan', 'like', '%' . $request->search . '%');
            }
            
            // Ambil data dan urutkan berdasarkan id_calk (terbaru di atas)
            $calk = $query->orderBy('id_calk', 'asc')->get();
            
            // Transform data untuk menambahkan URL lengkap untuk file
            $calk->transform(function ($item) {
                return [
                    'id_calk' => $item->id_calk,
                    'keterangan' => $item->keterangan,
                    'file' => $item->file,
                    'file_url' => $item->file ? url('storage/' . $item->file) : null,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });
            
            return response()->json([
                'success' => true,
                'message' => 'Data CALK berhasil diambil',
                'data' => $calk
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/laporan/calk
     */
    public function store(Request $request)
    {
        try {
            // Set user ID untuk trigger
            DB::statement("SET @current_user_id = " . auth()->id());
            
            // Validasi input
            $validator = Validator::make($request->all(), [
                'keterangan' => 'required|string|max:255',
                'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // max 10MB
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Simpan file ke folder public/storage/calk
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('calk', $fileName, 'public');
            
            // Simpan ke database
            $calk = Calk::create([
                'keterangan' => $request->keterangan,
                'file' => $filePath,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'CALK berhasil ditambahkan',
                'data' => [
                    'id_calk' => $calk->id_calk,
                    'keterangan' => $calk->keterangan,
                    'file' => $calk->file,
                    'file_url' => url('storage/' . $calk->file),
                    'created_at' => $calk->created_at,
                    'updated_at' => $calk->updated_at,
                ]
            ], 201);
            
        } catch (\Exception $e) {
            // Hapus file jika ada error saat menyimpan ke database
            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan CALK',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/laporan/calk/{id}
     */
    public function show($id)
    {
        try {
            $calk = Calk::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'message' => 'Data CALK berhasil diambil',
                'data' => [
                    'id_calk' => $calk->id_calk,
                    'keterangan' => $calk->keterangan,
                    'file' => $calk->file,
                    'file_url' => $calk->file ? url('storage/' . $calk->file) : null,
                    'created_at' => $calk->created_at,
                    'updated_at' => $calk->updated_at,
                ]
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data CALK tidak ditemukan',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     * PUT/PATCH /api/laporan/calk/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            // Set user ID untuk trigger
            DB::statement("SET @current_user_id = " . auth()->id());
            
            $calk = Calk::findOrFail($id);
            
            // Validasi input
            $validator = Validator::make($request->all(), [
                'keterangan' => 'required|string|max:255',
                'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // max 10MB
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update keterangan
            $calk->keterangan = $request->keterangan;
            
            // Update file jika ada file baru
            if ($request->hasFile('file')) {
                // Hapus file lama jika ada
                if ($calk->file && Storage::disk('public')->exists($calk->file)) {
                    Storage::disk('public')->delete($calk->file);
                }
                
                // Simpan file baru
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $calk->file = $file->storeAs('calk', $fileName, 'public');
            }
            
            $calk->save();
            
            return response()->json([
                'success' => true,
                'message' => 'CALK berhasil diperbarui',
                'data' => [
                    'id_calk' => $calk->id_calk,
                    'keterangan' => $calk->keterangan,
                    'file' => $calk->file,
                    'file_url' => $calk->file ? url('storage/' . $calk->file) : null,
                    'created_at' => $calk->created_at,
                    'updated_at' => $calk->updated_at,
                ]
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui CALK',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/laporan/calk/{id}
     */
    public function destroy($id)
    {
        try {
            // Set user ID untuk trigger
            DB::statement("SET @current_user_id = " . auth()->id());
            
            $calk = Calk::findOrFail($id);
            
            // Hapus file fisik jika ada
            if ($calk->file && Storage::disk('public')->exists($calk->file)) {
                Storage::disk('public')->delete($calk->file);
            }
            
            $calk->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'CALK berhasil dihapus'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus CALK',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}