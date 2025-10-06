<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\Unit;
use App\Models\Divisi;
use App\Models\Kegiatan;
use App\Models\Buku_Besar;
use App\Models\Jurnal_Umum;
use App\Models\Akuntan_Unit;
use Illuminate\Http\Request;
use App\Models\Akuntan_Divisi;
use Illuminate\Support\Carbon;
use App\Models\Detail_Jurnal_Umum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class JurnalUmumController extends Controller
{



    public function index(Request $request)
    {
        $user = Auth::user();

        // Default untuk admin/auditor
        $units = Unit::all();
        $divisis = Divisi::all();
        $id_unit = $request->input('unit');
        $id_divisi = $request->input('divisi');

        // Cek role akuntan_unit → ambil id_unit dari tabel akuntan_unit
        if ($user->role === 'akuntan_unit') {
            $akuntan = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->first();

            if (!$akuntan) {
                abort(403, 'Data Akuntan Unit tidak ditemukan');
            }

            $id_unit = $akuntan->id_unit; // Override dari form
            $units = collect(); // Kosongkan untuk blade (supaya nggak tampil dropdown)
        }

        // Cek role akuntan_divisi
        if ($user->role === 'akuntan_divisi') {
            $id_divisi = $user->id_divisi; // diasumsikan id_divisi ada di tabel users
        }

        // Filter jurnal
        $jurnalQuery = Jurnal_Umum::with(['unit', 'divisi', 'kegiatan', 'sumber_anggaran']);

        // Tanggal
        $start = $request->input('start_date') ?? date('Y-01-01');
        $end = $request->input('end_date') ?? date('Y-m-d');

        $jurnalQuery->whereBetween('tanggal', [$start, $end]);

        // Pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $jurnalQuery->where(function ($q) use ($search) {
                $q->where('no_bukti', 'like', "%$search%")
                ->orWhere('keterangan', 'like', "%$search%");
            });
        }

        // Filter unit/divisi
        if (!empty($id_unit)) {
            $jurnalQuery->where('id_unit', $id_unit);
        }

        if (!empty($id_divisi)) {
            $jurnalQuery->where('id_divisi', $id_divisi);
        }

        $perPage = $request->input('per_page', 20); // Default 20
        $jurnalPaginated = $jurnalQuery
            ->orderByDesc('id_jurnal_umum')
            ->paginate($perPage)
            ->withQueryString();



        $detailjurnalumum = Detail_Jurnal_Umum::with([
                'akun',
                'jurnal_umum.unit',
                'jurnal_umum.divisi',
                'jurnal_umum.kegiatan',
                'jurnal_umum.sumber_anggaran',
            ])
            ->whereIn('id_jurnal_umum', $jurnalPaginated->pluck('id_jurnal_umum'))
            ->get();

        $postedJurnalIds = DB::table('buku_besar')
            ->whereNotNull('id_jurnal_umum')
            ->pluck('id_jurnal_umum')
            ->toArray();

        // Export Excel jika diminta
        if ($request->has('export_excel')) {
            return $this->exportExcel($detailjurnalumum);
        }

        return view('jurnal-umum', [
            'detailjurnalumum' => $detailjurnalumum,
            'postedJurnalIds' => $postedJurnalIds,
            'units' => $units,
            'divisis' => $divisis,
            'jurnalPaginated' => $jurnalPaginated,
            'id_unit' => $id_unit,
            'id_divisi' => $id_divisi,
            'start' => $start,
            'end' => $end,
            'user' => $user,
        ]);
    }



    private function exportExcel($detailjurnalumum)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // 🖼️ Logo
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo YDB');
        $drawing->setPath(public_path('assets/images/logos/YDB_PNG.png'));
        $drawing->setHeight(120);
        $drawing->setCoordinates('A1');
        $drawing->setOffsetX(1000);
        $drawing->setOffsetY(18);
        $drawing->setWorksheet($sheet);

        // 📅 Ambil tanggal awal & akhir dari data
        $start = $detailjurnalumum->min(fn($item) => optional($item->jurnal_umum)->tanggal);
        $end = $detailjurnalumum->max(fn($item) => optional($item->jurnal_umum)->tanggal);

        // 📝 RichText: Judul + Periode
        $richText = new RichText();
        $judulText = $richText->createTextRun("JURNAL UMUM YAYASAN DARUSSALAM BATAM\n");
        $judulText->getFont()->setBold(true)->setSize(14);

        $periodeText = $richText->createTextRun("Periode " . Carbon::parse($start)->translatedFormat('d F Y') . " s.d. " . Carbon::parse($end)->translatedFormat('d F Y'));
        $periodeText->getFont()->setSize(10);

        // 🧩 Merge dan isi judul
        $sheet->mergeCells('A1:L4');
        $sheet->setCellValue('A1', $richText);
        $sheet->getStyle('A1')->getAlignment()->setWrapText(true);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension('1')->setRowHeight(80);

        // 📋 Header tabel
        $header = ['Tanggal', 'Keterangan', 'Jenis Transaksi', 'Unit', 'Divisi', 'Kegiatan', 'Sumber Anggaran', 'Kode Sumbangan', 'Kode PH', 'Akun Debit', 'Akun Kredit', 'Nominal'];
        $sheet->fromArray($header, null, 'A6');
        $sheet->getStyle('A6:L6')->applyFromArray([
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F2F2F2']],
        ]);

        // 🔁 Group berdasarkan ID Jurnal Umum
        $grouped = $detailjurnalumum->groupBy('id_jurnal_umum');

        $row = 7;
        $totalNominal = 0;

        foreach ($grouped as $group) {
            $jurnal = optional($group->first()->jurnal_umum);

            $tanggal = $jurnal->tanggal ?? '-';
            $keterangan = $jurnal->keterangan ?? '-';
            $jenis_transaksi = $jurnal->jenis_transaksi ?? '-';
            $unit = optional($jurnal->unit)->unit ?? '-';
            $divisi = optional($jurnal->divisi)->divisi ?? '-';
            $kegiatan = optional($jurnal->kegiatan)->kegiatan ?? '-';
            $sumber_anggaran = optional($jurnal->sumber_anggaran)->sumber_anggaran ?? '-';
            $kode_sumbangan = $jurnal->kode_sumbangan ?? '-';
            $kode_ph = $jurnal->kode_ph ?? '-';

            $akun_debit = $group->firstWhere('debit_kredit', 'debit')?->akun->akun ?? '-';
            $akun_kredit = $group->firstWhere('debit_kredit', 'kredit')?->akun->akun ?? '-';
            $nominal = $group->first()?->nominal ?? 0;

            $totalNominal += $nominal;

            $sheet->setCellValue("A{$row}", $tanggal);
            $sheet->setCellValue("B{$row}", $keterangan);
            $sheet->setCellValue("C{$row}", $jenis_transaksi);
            $sheet->setCellValue("D{$row}", $unit);
            $sheet->setCellValue("E{$row}", $divisi);
            $sheet->setCellValue("F{$row}", $kegiatan);
            $sheet->setCellValue("G{$row}", $sumber_anggaran);
            $sheet->setCellValue("H{$row}", $kode_sumbangan);
            $sheet->setCellValue("I{$row}", $kode_ph);
            $sheet->setCellValue("J{$row}", $akun_debit);
            $sheet->setCellValue("K{$row}", $akun_kredit);
            $sheet->setCellValue("L{$row}", $nominal);

            $sheet->getStyle("L{$row}")->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("L{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            $row++;
        }

        // ➕ Total
        $sheet->setCellValue("K{$row}", 'TOTAL');
        $sheet->setCellValue("L{$row}", $totalNominal);
        $sheet->getStyle("K{$row}:L{$row}")->getFont()->setBold(true);
        $sheet->getStyle("L{$row}")->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->getStyle("L{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // 📏 Border & autosize
        $sheet->getStyle("A6:L{$row}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        foreach (range('A', 'L') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // ⬇️ Download
        $fileName = 'Jurnal_Umum_' . now()->format('d-m-Y_His') . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment;filename=\"{$fileName}\"");
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }



    public function create()
    {
        $user = Auth::user();
        $id_unit = null;
        $id_divisi = null;

        if ($user->role === 'akuntan_unit') {
            $akuntanUnit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->first();
            $id_unit = $akuntanUnit?->id_unit;
        }

        if ($user->role === 'akuntan_divisi') {
            $akuntanDivisi = Akuntan_Divisi::where('id_akuntan_divisi', $user->id_user)->first();
            $id_divisi = $akuntanDivisi?->id_divisi;
        }

        $sumber_anggaran = Akun::whereHas('sub_kategori_akun', function ($query) {
            $query->where('sub_kategori_akun', 'Penerimaan dan Sumbangan Pendidikan');
        })->orderBy('kode_akun')->get();

        $unit = Unit::all();
        $divisi = Divisi::all();
        $akun = Akun::orderBy('kode_akun')->get();
        $kegiatan = Kegiatan::orderBy('kode_kegiatan')->get();

        return view('input-transaksi', compact('unit', 'divisi', 'akun', 'kegiatan', 'sumber_anggaran', 'id_unit', 'id_divisi'));
    }



    public function store(Request $request)
    {
        $id_user_login = Auth::id();
        // Jika pakai trigger yang butuh user ID
        DB::statement("SET @current_user_id = $id_user_login");

        $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'jenis_transaksi' => 'required|string',
            'id_unit' => 'required|exists:unit,id_unit',
            'id_divisi' => 'required|exists:divisi,id_divisi',
            'id_akun' => 'required|array',
            'id_akun.*' => 'exists:akun,id_akun',
            'debit' => 'required|array',
            'kredit' => 'required|array',
            'id_kegiatan' => 'nullable|exists:kegiatan,id_kegiatan',
            'id_sumber_anggaran' => 'nullable|exists:akun,id_akun',
        ]);

        return DB::transaction(function () use ($request) {
            // Ambil no_bukti terakhir
            $lastNumber = (int) Jurnal_Umum::max(DB::raw('CAST(no_bukti AS UNSIGNED)'));
            $no_bukti = str_pad($lastNumber + 1, 7, '0', STR_PAD_LEFT);

            // Simpan jurnal umum
            $jurnal = Jurnal_Umum::create([
                'tanggal' => $request->tanggal,
                'no_bukti' => $no_bukti,
                'keterangan' => $request->keterangan,
                'jenis_transaksi' => $request->jenis_transaksi,
                'id_unit' => $request->id_unit,
                'id_divisi' => $request->id_divisi,
                'id_kegiatan' => $request->id_kegiatan,
                'id_sumber_anggaran' => $request->id_sumber_anggaran,
                'kode_sumbangan' => $request->kode_sumbangan ?? '',
                'kode_ph' => $request->kode_ph ?? '',
            ]);

            // Simpan detail jurnal
            collect($request->id_akun)->each(function ($id_akun, $i) use ($request, $jurnal) {
                $debit = (int) preg_replace('/\D/', '', $request->debit[$i]) ?: 0;
                $kredit = (int) preg_replace('/\D/', '', $request->kredit[$i]) ?: 0;

                foreach (['debit' => $debit, 'kredit' => $kredit] as $type => $amount) {
                    if ($amount > 0) {
                        Detail_Jurnal_Umum::create([
                            'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                            'id_akun' => $id_akun,
                            'nominal' => $amount,
                            'debit_kredit' => $type
                        ]);
                    }
                }
            });

            // Posting ke buku besar jika dicentang
            if ($request->has('postingBukuBesar')) {
                Buku_Besar::create([
                    'id_jurnal_umum' => $jurnal->id_jurnal_umum
                ]);
            }

            return redirect()->route('jurnal-umum.index')->with('success', "Data berhasil disimpan. No Bukti: $no_bukti");
        });
    }




    public function import(Request $request)
    {
        $id_user_login = Auth::id();
        DB::statement("SET @current_user_id = $id_user_login");

        $request->validate([
            'file_excel' => 'required|mimes:xlsx,xls',
        ]);

        if (!$request->hasFile('file_excel')) {
            return back()->with('error', '❌ Tidak ada file yang dikirim!');
        }

        $file = $request->file('file_excel');

        try {
            $spreadsheet = IOFactory::load($file);
            $rows = $spreadsheet->getActiveSheet()->toArray();

            DB::transaction(function () use ($rows) {
                foreach ($rows as $index => $row) {
                    if ($index === 0) continue; // Skip header

                    $tanggal = is_numeric($row[0])
                        ? Date::excelToDateTimeObject($row[0])->format('Y-m-d')
                        : date('Y-m-d', strtotime($row[0]));

                    $keterangan = $row[1] ?? '-';
                    $jenis_transaksi = $row[2] ?? '-';

                    $id_unit = Unit::where('unit', $row[3])->value('id_unit');
                    if (!$id_unit) throw new \Exception("❌ Unit tidak ditemukan: {$row[3]} (baris ke-" . ($index + 1) . ")");

                    $id_divisi = Divisi::where('divisi', $row[4])->value('id_divisi');
                    if (!$id_divisi) throw new \Exception("❌ Divisi tidak ditemukan: {$row[4]} (baris ke-" . ($index + 1) . ")");

                    $id_kegiatan = null;
                    if (!empty($row[5])) {
                        $kode_kegiatan = trim(explode('|', $row[5])[0]);
                        $id_kegiatan = Kegiatan::where('kode_kegiatan', $kode_kegiatan)->value('id_kegiatan');
                        if (!$id_kegiatan) throw new \Exception("❌ Kegiatan tidak ditemukan: {$row[5]} (baris ke-" . ($index + 1) . ")");
                    }

                    $id_sumber_anggaran = null;
                    if (!empty($row[6])) {
                        $kode_sumber = trim(explode('|', $row[6])[0]);
                        $id_sumber_anggaran = Akun::where('kode_akun', $kode_sumber)
                            ->whereHas('sub_kategori_akun', fn($q) =>
                                $q->where('sub_kategori_akun', 'Penerimaan dan Sumbangan Pendidikan')
                            )
                            ->value('id_akun');
                        if (!$id_sumber_anggaran) throw new \Exception("❌ Sumber Anggaran tidak cocok: {$row[6]} (baris ke-" . ($index + 1) . ")");
                    }

                    $kode_sumbangan = $row[7] ?? null;
                    $kode_ph = $row[8] ?? null;

                    $id_akun_debit = null;
                    if (!empty($row[9])) {
                        $kode_debit = trim(explode('|', $row[9])[0]);
                        $id_akun_debit = Akun::where('kode_akun', $kode_debit)->value('id_akun');
                        if (!$id_akun_debit) throw new \Exception("❌ Akun Debit tidak ditemukan: {$row[9]} (baris ke-" . ($index + 1) . ")");
                    }

                    $id_akun_kredit = null;
                    if (!empty($row[10])) {
                        $kode_kredit = trim(explode('|', $row[10])[0]);
                        $id_akun_kredit = Akun::where('kode_akun', $kode_kredit)->value('id_akun');
                        if (!$id_akun_kredit) throw new \Exception("❌ Akun Kredit tidak ditemukan: {$row[10]} (baris ke-" . ($index + 1) . ")");
                    }

                    $rawNominal = trim($row[11] ?? '');
                    $nominal = ($rawNominal === '' || $rawNominal === '-') ? 0 : (int) preg_replace('/\D/', '', $rawNominal);

                    $lastNumber = (int) Jurnal_Umum::max(DB::raw('CAST(no_bukti AS UNSIGNED)'));
                    $no_bukti = str_pad($lastNumber + 1, 7, '0', STR_PAD_LEFT);

                    $jurnal = Jurnal_Umum::create([
                        'tanggal' => $tanggal,
                        'no_bukti' => $no_bukti,
                        'keterangan' => $keterangan,
                        'jenis_transaksi' => $jenis_transaksi,
                        'id_unit' => $id_unit,
                        'id_divisi' => $id_divisi,
                        'id_kegiatan' => $id_kegiatan,
                        'id_sumber_anggaran' => $id_sumber_anggaran,
                        'kode_sumbangan' => $kode_sumbangan,
                        'kode_ph' => $kode_ph,
                    ]);

                    foreach ([
                        ['id_akun' => $id_akun_debit, 'type' => 'debit'],
                        ['id_akun' => $id_akun_kredit, 'type' => 'kredit']
                    ] as $item) {
                        if ($item['id_akun']) {
                            Detail_Jurnal_Umum::create([
                                'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                                'id_akun' => $item['id_akun'],
                                'nominal' => $nominal,
                                'debit_kredit' => $item['type'],
                            ]);
                        }
                    }
                }
            });

            return back()->with('success', '✅ Berhasil Import.');
        } catch (\Throwable $e) {
            return back()->with('error', '❌ Error: ' . $e->getMessage());
        }
    }



    public function edit($id)
    {
        $jurnalUmum = Jurnal_Umum::with('detail_jurnal_umum')->findOrFail($id);
        $akun = Akun::orderBy('kode_akun')->get();
        $unit = Unit::all();
        $divisi = Divisi::all();
        $sumber_anggaran = Akun::whereHas('sub_kategori_akun', function ($query) {
            $query->where('sub_kategori_akun', 'Penerimaan dan Sumbangan Pendidikan');
        })->orderBy('kode_akun')->get();
        $kegiatan = Kegiatan::orderBy('kode_kegiatan')->get();


        $user = Auth::user();
        $id_unit = null;
        $id_divisi = null;

        if ($user->role === 'akuntan_unit') {
            $akuntanUnit = Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->first();
            $id_unit = $akuntanUnit?->id_unit;
        }

        if ($user->role === 'akuntan_divisi') {
            $akuntanDivisi = Akuntan_Divisi::where('id_akuntan_divisi', $user->id_user)->first();
            $id_divisi = $akuntanDivisi?->id_divisi;
        }

        return view('jurnal-umum-edit', compact('jurnalUmum', 'akun', 'unit', 'divisi', 'id_unit', 'id_divisi', 'kegiatan', 'sumber_anggaran'));
    }



    public function update(Request $request, $id)
    {
        DB::statement("SET @current_user_id = " . Auth::id());

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'jenis_transaksi' => 'required|string',
            'id_unit' => 'required|exists:unit,id_unit',
            'id_divisi' => 'required|exists:divisi,id_divisi',
            'id_akun' => 'required|array',
            'id_akun.*' => 'exists:akun,id_akun',
            'debit' => 'required|array',
            'kredit' => 'required|array',
            'id_kegiatan' => 'nullable|exists:kegiatan,id_kegiatan',
            'id_sumber_anggaran' => 'nullable|exists:akun,id_akun',
        ]);

        return DB::transaction(function () use ($validated, $request, $id) {
            $jurnal = Jurnal_Umum::findOrFail($id);

            $jurnal->update([
                'tanggal' => $validated['tanggal'],
                'keterangan' => $validated['keterangan'],
                'jenis_transaksi' => $validated['jenis_transaksi'],
                'id_unit' => $validated['id_unit'],
                'id_divisi' => $validated['id_divisi'],
                'id_kegiatan' => $validated['id_kegiatan'] ?? null,
                'id_sumber_anggaran' => $validated['id_sumber_anggaran'] ?? null,
                'kode_sumbangan' => $request->kode_sumbangan ?? '',
                'kode_ph' => $request->kode_ph ?? ''
            ]);

            // Hapus dan masukkan ulang detail
            Detail_Jurnal_Umum::where('id_jurnal_umum', $jurnal->id_jurnal_umum)->delete();

            foreach ($validated['id_akun'] as $i => $id_akun) {
                $debit = (int) preg_replace('/\D/', '', $validated['debit'][$i]) ?: 0;
                $kredit = (int) preg_replace('/\D/', '', $validated['kredit'][$i]) ?: 0;

                foreach (['debit' => $debit, 'kredit' => $kredit] as $tipe => $nominal) {
                    if ($nominal > 0) {
                        Detail_Jurnal_Umum::create([
                            'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                            'id_akun' => $id_akun,
                            'nominal' => $nominal,
                            'debit_kredit' => $tipe,
                        ]);
                    }
                }
            }

            // Reset buku besar jika perlu
            Buku_Besar::where('id_jurnal_umum', $jurnal->id_jurnal_umum)->delete();

            if ($request->has('postingBukuBesar')) {
                Buku_Besar::create([
                    'id_jurnal_umum' => $jurnal->id_jurnal_umum,
                ]);
            }

            return redirect()->route('jurnal-umum.index')->with('success', 'Data berhasil diperbarui');
        });
    }




    public function destroy($id)
    {
        $id_user_login = Auth::user()->id_user;
        DB::statement("SET @current_user_id = $id_user_login");

        $jurnal = Jurnal_Umum::findOrFail($id);

        // Hapus data terkait di buku besar yang memiliki id_jurnal_umum
        Buku_Besar::where('id_jurnal_umum', $id)->delete();

        // Hapus detail jurnal yang terkait dengan jurnal umum
        Detail_Jurnal_Umum::where('id_jurnal_umum', $id)->delete();

        // Hapus jurnal umum itu sendiri
        $jurnal->delete();

        // Redirect kembali ke halaman daftar jurnal umum dengan pesan sukses
        return redirect()->route('jurnal-umum.index')->with('success', 'Data berhasil dihapus');
    }




}