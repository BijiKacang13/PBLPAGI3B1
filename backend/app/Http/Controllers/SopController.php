<?php

namespace App\Http\Controllers;

use App\Models\Sop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SopController extends Controller
{
    
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role; // Default to 'guest' if role is not set, or handle null user if middleware not applied

        // Mulai query builder
        $query = Sop::query();

        // Filter berdasarkan keterangan jika search diisi
        if ($request->filled('search')) {
            $query->where('keterangan', 'like', '%' . $request->search . '%');
        }

        // Ambil data
        $sop = $query->orderBy('urutan')->get();

        // Kirim data ke view
        return view('admin.sop', compact('sop', 'role'));
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        // Validasi input
        $validated = $request->validate([
            'keterangan' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx|max:9999|unique:sop,file', // validasi file & unik
        ]);

        // Simpan file ke folder public/storage/sop
        $filePath = $request->file('file')->store('sop', 'public');

        // Simpan ke database
        $sop = new Sop();
        $sop->keterangan = $validated['keterangan'];
        $sop->file = $filePath;
        $sop->save();

        return redirect()->back()->with('success', 'SOP berhasil ditambahkan.');
    }




    public function update(Request $request, $id)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        $sop = Sop::findOrFail($id);
        $sop->keterangan = $request->keterangan;

        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($sop->file && Storage::disk('public')->exists($sop->file)) {
                Storage::disk('public')->delete($sop->file);
            }

            $sop->file = $request->file('file')->store('sop', 'public');
        }

        $sop->save();

        return redirect()->back()->with('success', 'Data SOP berhasil diperbarui.');
    }


    public function destroy($id)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        $sop = Sop::findOrFail($id);

        // Hapus file fisik jika ada
        if ($sop->file && Storage::exists($sop->file)) {
            Storage::delete($sop->file);
        }

        $sop->delete();

        return redirect()->back()->with('success', 'SOP berhasil dihapus.');
    }


    public function sort(Request $request)
    {
        // Set variabel user ID untuk digunakan dalam trigger MySQL
        DB::statement("SET @current_user_id = " . Auth::id());

        // Update urutan SOP satu per satu
        foreach ($request->order as $item) {
            Sop::where('id_sop', $item['id'])->update(['urutan' => $item['urutan']]);
        }

        return response()->json(['status' => 'success']);
    }

}


