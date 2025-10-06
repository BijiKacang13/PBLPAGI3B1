<?php

namespace App\Http\Controllers;
use App\Models\Akun;
use Illuminate\Http\Request;
use App\Models\Kategori_Akun;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class KategoriAkunController extends Controller
{
    public function index()
    {
        $kategoriakun = Kategori_Akun::all();

        return view('kategori-akun', compact('kategoriakun'));
    }

    public function store(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        // Validasi data input
        $request->validate([
            'kode_kategori_akun' => 'required|string|max:255|unique:kategori_akun,kode_kategori_akun',
            'kategori_akun' => 'required|string|max:255'
        ]);

        DB::beginTransaction();

        try {
            $kategori_akun = Kategori_Akun::create([
                'kode_kategori_akun' => $request->kode_kategori_akun,
                'kategori_akun' => $request->kategori_akun,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Kategori Akun berhasil didaftarkan.');

            }
            
        catch (Exception $e) {
                DB::rollBack();
                return redirect()->back()->with('error', 'Gagal menambah kategori akun: ' . $e->getMessage());
        }
    }




    public function update(Request $request)
    {

        DB::statement("SET @current_user_id = " . auth()->id());

        $request->validate([
            'kode_kategori_akun' => 'required|string|max:255|unique:kategori_akun,kode_kategori_akun,' . $request->id_kategori_akun . ',id_kategori_akun',
            'kategori_akun' => 'required|string|max:255|unique:kategori_akun,kategori_akun,' . $request->id_kategori_akun . ',id_kategori_akun',
        ]);
    
        DB::beginTransaction();
    
        try {
            $kategori = Kategori_Akun::findOrFail($request->id_kategori_akun);
            $kategori->update([
                'kode_kategori_akun' => $request->kode_kategori_akun,
                'kategori_akun' => $request->kategori_akun,
            ]);
    
            DB::commit();
            return redirect()->back()->with('success', 'Kategori Akun berhasil diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui kategori akun: ' . $e->getMessage());
        }
    }


    public function destroy(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        
        DB::beginTransaction();

        try {
            $kategori = Kategori_Akun::findOrFail($request->id_kategori_akun);
            $kategori->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Kategori Akun berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus kategori akun: ' . $e->getMessage());
        }
    }

        
}
