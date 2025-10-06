<?php

namespace App\Http\Controllers;
use App\Models\Akun;
use Illuminate\Http\Request;
use App\Models\Kategori_Akun;
use App\Models\Sub_Kategori_Akun;
use Illuminate\Support\Facades\DB;

class SubKategoriAkunController extends Controller
{
    public function index()
    {
        $kategoriakun = Kategori_Akun::all();
        $subkategoriakun = Sub_Kategori_Akun::orderBy('kode_sub_kategori_akun', 'asc')->get();

        return view('sub-kategori-akun', compact('kategoriakun', 'subkategoriakun'));
    }


    

    public function store(Request $request)
    {

        DB::statement("SET @current_user_id = " . auth()->id());

        $request->validate([
            'id_kategori_akun' => 'required|integer|exists:kategori_akun,id_kategori_akun',
            'kode_sub_kategori_akun' => 'required|string|max:255|unique:sub_kategori_akun,kode_sub_kategori_akun',
            'sub_kategori_akun' => 'required|string|max:255'
        ]);

        DB::beginTransaction();

        try {
            Sub_Kategori_Akun::create([
                'id_kategori_akun' => $request->id_kategori_akun,
                'kode_sub_kategori_akun' => $request->kode_sub_kategori_akun,
                'sub_kategori_akun' => $request->sub_kategori_akun,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Sub Kategori Akun berhasil didaftarkan.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambah sub kategori akun: ' . $e->getMessage());
        }
    }



    public function update(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());
        $request->validate([
            'kode_sub_kategori_akun' => 'required|string|max:255|unique:sub_kategori_akun,kode_sub_kategori_akun,' . $request->id_sub_kategori_akun . ',id_sub_kategori_akun',
            'sub_kategori_akun' => 'required|string|max:255|unique:sub_kategori_akun,sub_kategori_akun,' . $request->id_sub_kategori_akun . ',id_sub_kategori_akun',
            'id_kategori_akun' => 'required|exists:kategori_akun,id_kategori_akun', // Validasi kategori akun
        ]);

        DB::beginTransaction();

        try {
            // Temukan data sub kategori akun berdasarkan ID yang dikirim
            $subKategoriAkun = Sub_Kategori_Akun::findOrFail($request->id_sub_kategori_akun);
            
            // Update data sub kategori akun
            $subKategoriAkun->update([
                'kode_sub_kategori_akun' => $request->kode_sub_kategori_akun,
                'sub_kategori_akun' => $request->sub_kategori_akun,
                'id_kategori_akun' => $request->id_kategori_akun,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Sub Kategori Akun berhasil diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui sub kategori akun: ' . $e->getMessage());
        }
    }


    
    public function destroy(Request $request)
    {

        DB::statement("SET @current_user_id = " . auth()->id());

        DB::beginTransaction();

        try {
            $sub_kategori = Sub_Kategori_Akun::findOrFail($request->id_sub_kategori_akun);
            $sub_kategori->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Sub Kategori Akun berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus sub kategori akun: ' . $e->getMessage());
        }
    }


}
