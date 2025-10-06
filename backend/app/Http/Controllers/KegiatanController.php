<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class KegiatanController extends Controller
{
    public function index(Request $request)
    {
        // Hilangkan semua referensi ke unit
        $kegiatan = Kegiatan::orderBy('kode_kegiatan')->get();

        return view('kegiatan', compact('kegiatan'));
    }



    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        try {
            $spreadsheet = IOFactory::load($request->file('file'));
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            unset($rows[0]); // Hilangkan header baris pertama

            foreach ($rows as $row) {
                $kodeKegiatan = trim($row[0]); // Kolom A
                $kegiatan = trim($row[1]);     // Kolom B

                if (!$kodeKegiatan || !$kegiatan) {
                    continue; // Lewati baris kosong
                }

                // Insert atau Update jika sudah ada
                Kegiatan::updateOrCreate(
                    ['kode_kegiatan' => $kodeKegiatan],
                    ['kegiatan' => $kegiatan]
                );
            }

            return redirect()->back()->with('success', '✅ Import data kegiatan berhasil!');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', '❌ Gagal import: ' . $e->getMessage());
        }
    }



    public function store(Request $request)
    {

        // Validasi data input
        $request->validate([
            'kode_kegiatan' => 'required|string|max:255|unique:kegiatan,kode_kegiatan',
            'kegiatan' => 'required|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            Kegiatan::create([
                'kode_kegiatan' => $request->kode_kegiatan,
                'kegiatan' => $request->kegiatan,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'kegiatan berhasil didaftarkan.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambah kegiatan: ' . $e->getMessage());
        }
    }


    public function update(Request $request)
    {
        // dd($request->all());

        // Validasi data input
        $request->validate([
            'kode_kegiatan' => 'required|string|max:255' . $request->id_kegiatan . ',id_kegiatan',
            'kegiatan' => 'required|string|max:255' . $request->id_kegiatan . ',id_kegiatan',
        ]);

        DB::beginTransaction();

        try {
            // Temukan data sub kategori kegiatan berdasarkan ID yang dikirim
            $kegiatan = Kegiatan::findOrFail($request->id_kegiatan);
            
            // Update  kegiatan
            $kegiatan->update([
                'kode_kegiatan' => $request->kode_kegiatan,
                'kegiatan' => $request->kegiatan,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'kegiatan berhasil diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui kegiatan: ' . $e->getMessage());
        }
    }   


    public function destroy(Request $request)
    {
        DB::beginTransaction();

        try {
            $kegiatan = Kegiatan::findOrFail($request->id_kegiatan);
            $kegiatan->delete();

            DB::commit();
            return redirect()->back()->with('success', 'kegiatan berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus kegiatan: ' . $e->getMessage());
        }
    }


    public function resetByUnit(Request $request)
    {
        $id_unit = $request->input('id_unit');

        if ($id_unit && $id_unit !== 'all') {
            Kegiatan::where('id_unit', $id_unit)->delete();
            return redirect()->route('kegiatan.index', ['unit' => $id_unit])
                ->with('success', 'Data kegiatan berhasil direset untuk unit terpilih.');
        }

        return redirect()->route('kegiatan.index')
            ->with('error', 'Silakan pilih unit terlebih dahulu untuk mereset data.');
    }

}
