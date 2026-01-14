<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SopController extends Controller
{
    /**
     * =========================
     * GET LIST SOP
     * =========================
     */
    public function index(Request $request)
    {
        $query = Sop::query();

        // Search berdasarkan keterangan
        if ($request->filled('search')) {
            $query->where('keterangan', 'like', '%' . $request->search . '%');
        }

        $sop = $query->orderBy('urutan')->get();

        return response()->json([
            'success' => true,
            'message' => 'Data SOP berhasil diambil',
            'data' => $sop
        ]);
    }

    /**
     * =========================
     * STORE SOP
     * =========================
     */
    public function store(Request $request)
    {
        DB::statement("SET @current_user_id = " . Auth::id());

        $validator = Validator::make($request->all(), [
            'keterangan' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx|max:9999|unique:sop,file',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $filePath = $request->file('file')->store('sop', 'public');

        $sop = Sop::create([
            'keterangan' => $request->keterangan,
            'file' => $filePath,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'SOP berhasil ditambahkan',
            'data' => $sop
        ], 201);
    }

    /**
     * =========================
     * UPDATE SOP
     * =========================
     */
    public function update(Request $request, $id)
    {
        DB::statement("SET @current_user_id = " . Auth::id());

        $sop = Sop::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'keterangan' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:9999',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $sop->keterangan = $request->keterangan;

        if ($request->hasFile('file')) {
            if ($sop->file && Storage::disk('public')->exists($sop->file)) {
                Storage::disk('public')->delete($sop->file);
            }

            $sop->file = $request->file('file')->store('sop', 'public');
        }

        $sop->save();

        return response()->json([
            'success' => true,
            'message' => 'Data SOP berhasil diperbarui',
            'data' => $sop
        ]);
    }

    /**
     * =========================
     * DELETE SOP
     * =========================
     */
    public function destroy($id)
    {
        DB::statement("SET @current_user_id = " . Auth::id());

        $sop = Sop::findOrFail($id);

        if ($sop->file && Storage::disk('public')->exists($sop->file)) {
            Storage::disk('public')->delete($sop->file);
        }

        $sop->delete();

        return response()->json([
            'success' => true,
            'message' => 'SOP berhasil dihapus'
        ]);
    }

    /**
     * =========================
     * SORT SOP
     * =========================
     */
    public function sort(Request $request)
    {
        DB::statement("SET @current_user_id = " . Auth::id());

        foreach ($request->order as $item) {
            Sop::where('id_sop', $item['id'])
                ->update(['urutan' => $item['urutan']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Urutan SOP berhasil diperbarui'
        ]);
    }
    public function download($id)
    {
        $sop = Sop::findOrFail($id);

        if (!$sop->file || !Storage::disk('public')->exists($sop->file)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan'
            ], 404);
        }

        // Gunakan nama file asli atau keterangan sebagai nama download
        $extension = pathinfo($sop->file, PATHINFO_EXTENSION);
        $filename = $sop->keterangan . '.' . $extension;

        return Storage::disk('public')->download($sop->file, $filename);
    }
}
