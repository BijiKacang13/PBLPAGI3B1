<?php

namespace App\Http\Controllers;

use App\Models\Calk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CalkController extends Controller
{
    
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role; // Default to 'guest' if role is not set, or handle null user if middleware not applied

        // Mulai query builder
        $query = Calk::query();

        // Filter berdasarkan keterangan jika search diisi
        if ($request->filled('search')) {
            $query->where('keterangan', 'like', '%' . $request->search . '%');
        }

        // Ambil data
        $calk = $query->get();

        // Kirim data ke view
        return view('calk', compact('calk', 'role'));
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
            'file' => 'required|file|mimes:pdf,doc,docx|max:9999|unique:calk,file', // validasi file & unik
        ]);

        // Simpan file ke folder public/storage/calk
        $filePath = $request->file('file')->store('calk', 'public');

        // Simpan ke database
        $calk = new Calk();
        $calk->keterangan = $validated['keterangan'];
        $calk->file = $filePath;
        $calk->save();

        return redirect()->back()->with('success', 'CALK berhasil ditambahkan.');
    }




    public function update(Request $request, $id)
    {

                DB::statement("SET @current_user_id = " . auth()->id());

        $calk = Calk::findOrFail($id);
        $calk->keterangan = $request->keterangan;

        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($calk->file && Storage::disk('public')->exists($calk->file)) {
                Storage::disk('public')->delete($calk->file);
            }

            $calk->file = $request->file('file')->store('calk', 'public');
        }

        $calk->save();

        return redirect()->back()->with('success', 'Data CALK berhasil diperbarui.');
    }


    public function destroy($id)
    {

                DB::statement("SET @current_user_id = " . auth()->id());
        
        $calk = Calk::findOrFail($id);

        // Hapus file fisik jika ada
        if ($calk->file && Storage::exists($calk->file)) {
            Storage::delete($calk->file);
        }

        $calk->delete();

        return redirect()->back()->with('success', 'CALK berhasil dihapus.');
    }


    public function sort(Request $request)
    {
        foreach ($request->order as $item) {
            Calk::where('id_calk', $item['id'])->update(['urutan' => $item['urutan']]);
        }

        return response()->json(['status' => 'success']);
    }

}