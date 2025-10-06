<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\Unit;
use Illuminate\Http\Request;
use App\Models\Sub_Kategori_Akun;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class AkunController extends Controller
{

    public function index(Request $request)
    {
        $subkategoriakun = Sub_Kategori_Akun::all();
        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');

        $query = Akun::select(
            'id_akun',
            'kode_akun',
            'akun',
            'saldo_awal_debit',
            'saldo_awal_kredit',
            'id_sub_kategori_akun'
        );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_akun', 'like', "%{$search}%")
                ->orWhere('akun', 'like', "%{$search}%");
            });
        }

        if ($perPage === 'all') {
            $akun = $query->orderBy('kode_akun')->get(); // tanpa pagination
        } else {
            $akun = $query->orderBy('kode_akun')->paginate((int) $perPage)->withQueryString();
        }

        return view('akun', compact('akun', 'subkategoriakun'));
    }





    public function import(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,xls'
            ]);

            $spreadsheet = IOFactory::load($request->file('file'));
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
            
            unset($rows[0]); // Hapus header
                $sukses = 0;
                $gagal = 0;
                $gagalDetail = [];

                
            foreach ($rows as $index => $row) {

                $baris = $index + 2; // Karena header dihapus, data mulai baris ke-2 di Excel
                if (empty(array_filter($row))) {
                    continue; // Lewati baris kosong
                }
                $namaSubKategori = trim($row[0]); // A
                $kodeAkun = trim($row[1]);        // B
                $namaAkun = trim($row[2]);        // C
                $saldoDebit = (float) str_replace(',', '', $row[3]);
                $saldoKredit = (float) str_replace(',', '', $row[4]);

                // Validasi sub kategori
                $subKategori = Sub_Kategori_Akun::where('sub_kategori_akun', $namaSubKategori)->first();
                if (!$subKategori) {
                    $gagal++;
                    $gagalDetail[] = "Baris $baris: Sub kategori \"$namaSubKategori\" tidak ditemukan.";
                    continue;
                }
                // Validasi data akun
                if (empty($kodeAkun) || empty($namaAkun)) {
                    $gagal++;
                    $gagalDetail[] = "Baris $baris: Kode akun atau nama akun kosong.";
                    continue;
                }
                // Simpan atau update akun
                Akun::updateOrCreate(
                    ['kode_akun' => $kodeAkun],
                    [
                        'akun' => $namaAkun,
                        'id_sub_kategori_akun' => $subKategori->id_sub_kategori_akun,
                        'saldo_awal_debit' => $saldoDebit,
                        'saldo_awal_kredit' => $saldoKredit,
                    ]
                );

                $sukses++;
            }

            // Kirim data ke tampilan
            return redirect()->back()->with([
                'success' => "✅ Berhasil import $sukses data. Gagal: $gagal baris.",
                'import_errors' => $gagalDetail
            ]);

        } catch (\Throwable $e) {
            return back()->with('error', '❌ Terjadi error: ' . $e->getMessage());
        }
    }



    public function store(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        $request->merge([
            'saldo_awal_debit' => str_replace('.', '', $request->saldo_awal_debit),
            'saldo_awal_kredit' => str_replace('.', '', $request->saldo_awal_kredit),
        ]);

        $request->validate([
            'id_sub_kategori_akun' => 'required|integer|exists:sub_kategori_akun,id_sub_kategori_akun',
            'kode_akun' => 'required|string|max:255|unique:akun,kode_akun',
            'akun' => 'required|string|max:255',
            'saldo_awal_debit' => 'required|integer',
            'saldo_awal_kredit' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            Akun::create([
                'id_sub_kategori_akun' => $request->id_sub_kategori_akun,
                'kode_akun' => $request->kode_akun,
                'akun' => $request->akun,
                'saldo_awal_debit' => $request->saldo_awal_debit,
                'saldo_awal_kredit' => $request->saldo_awal_kredit,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Akun berhasil didaftarkan.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambah akun: ' . $e->getMessage());
        }
    }



    public function update(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        $request->merge([
            'saldo_awal_debit' => str_replace('.', '', $request->saldo_awal_debit),
            'saldo_awal_kredit' => str_replace('.', '', $request->saldo_awal_kredit),
        ]);

        $request->validate([
            'id_akun' => 'required|exists:akun,id_akun',
            'id_sub_kategori_akun' => 'required|exists:sub_kategori_akun,id_sub_kategori_akun',
            'kode_akun' => 'required|string|max:255|unique:akun,kode_akun,' . $request->id_akun . ',id_akun',
            'akun' => 'required|string|max:255|unique:akun,akun,' . $request->id_akun . ',id_akun',
            'saldo_awal_debit' => 'required|numeric',
            'saldo_awal_kredit' => 'required|numeric',
        ]);

        DB::beginTransaction();

        try {
            $akun = Akun::findOrFail($request->id_akun);

            $akun->update([
                'id_sub_kategori_akun' => $request->id_sub_kategori_akun,
                'kode_akun' => $request->kode_akun,
                'akun' => $request->akun,
                'saldo_awal_debit' => $request->saldo_awal_debit,
                'saldo_awal_kredit' => $request->saldo_awal_kredit,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Akun berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui akun: ' . $e->getMessage());
        }
    }



    public function destroy(Request $request)
    {
        DB::statement("SET @current_user_id = " . auth()->id());

        DB::beginTransaction();

        try {
            $akun = Akun::findOrFail($request->id_akun);
            $akun->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Akun berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus akun: ' . $e->getMessage());
        }
    }

}
