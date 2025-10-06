@extends('layouts.layout')
@push('styles')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <title>SIA Yayasan Darussalam | Buku Besar</title>
    <style>
        html,
        body {
            height: 100%;
            margin: 0;
            background-color: #f8f9fa;
            /* latar abu-abu */
        }

        .page-wrapper,
        .body-wrapper {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .container-fluid,
        .main-content {
            flex: 1;
        }

        footer,
        .footer {
            margin-top: auto;
        }
    </style>


    <style>
        /* Mengatur warna hijau tua untuk tombol Export Excel */
        .custom-green {
            background-color: #208a20;
            /* Warna hijau tua */
            border: none;
        }

        /* Mengatur warna abu-abu tua untuk tombol Print */
        .custom-grey {
            background-color: #8a8a8a;
            /* Warna abu-abu tua */
            border: none;
            color: white;
            /* Warna teks putih */
        }
    </style>
    <style>
        @media print {
            .no-print {
                display: none !important;
            }
        }
    </style>
@endpush

@section('content')
    <div class="row">
        <div class="col-lg-12">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="fw-semibold mb-0">Buku Besar</h4>

                        <div>
                            <a href="{{ route('buku-besar.index', array_merge(request()->all(), ['export_excel' => 1])) }}"
                                class="btn btn-success custom-green">
                                <i class="fas fa-file-excel me-1"></i> Export Excel
                            </a>


                            <button class="btn btn-secondary ms-2 custom-grey" onclick="printLaporan()">
                                <i class="fas fa-print me-1"></i> Print
                            </button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <form method="GET" action="{{ route('buku-besar.index') }}">
                            <div class="row mb-3">
                                @php
                                    $user = Auth::user();
                                    $unit_user = null;

                                    if ($user->role === 'akuntan_unit') {
                                        $unit_user = \App\Models\Unit::find(
                                            \App\Models\Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value(
                                                'id_unit',
                                            ),
                                        );
                                    }
                                @endphp

                                <div class="col-md-3">
                                    <label for="id_unit" class="form-label">Unit</label>

                                    @if (in_array($user->role, ['admin', 'auditor']))
                                        <select class="form-control" name="id_unit" onchange="this.form.submit()">
                                            <option value="">-- Semua Unit --</option>
                                            @foreach (\App\Models\Unit::all() as $unit)
                                                <option value="{{ $unit->id_unit }}"
                                                    {{ request('id_unit', $id_unit) == $unit->id_unit ? 'selected' : '' }}>
                                                    {{ $unit->unit }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @elseif ($user->role === 'akuntan_unit')
                                        <select class="form-control" disabled>
                                            <option selected>{{ $unit_user->unit ?? 'Unit tidak ditemukan' }}</option>
                                        </select>
                                        <input type="hidden" name="id_unit" value="{{ $unit_user->id_unit ?? '' }}">
                                    @endif
                                </div>


                                <div class="col-md-3">
                                    <label for="id_divisi" class="form-label">Divisi</label>
                                    <select class="form-control" name="id_divisi" onchange="this.form.submit()">
                                        <option value="">-- Semua Divisi --</option>
                                        @foreach (\App\Models\Divisi::all() as $divisi)
                                            <option value="{{ $divisi->id_divisi }}"
                                                {{ request('id_divisi') == $divisi->id_divisi ? 'selected' : '' }}>
                                                {{ $divisi->divisi }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>



                                <div class="col-md-6">
                                    <label for="akun" class="form-label">Akun</label>
                                    <input list="akunList" name="akun_text" id="akun_text" class="form-control"
                                        onchange="setAkunId()" placeholder="Ketik kode atau nama akun"
                                        value="{{ old('akun_text', optional($akunList->firstWhere('id_akun', request('akun', 1)))->kode_akun . ' | ' . optional($akunList->firstWhere('id_akun', request('akun', 1)))->akun) }}">

                                    <datalist id="akunList">
                                        @foreach ($akunList as $akun)
                                            <option data-id="{{ $akun->id_akun }}"
                                                value="{{ $akun->kode_akun }} | {{ $akun->akun }}"></option>
                                        @endforeach
                                    </datalist>

                                    <input type="hidden" name="akun" id="akun_hidden" value="{{ request('akun', 1) }}">
                                </div>

                                <script>
                                    function setAkunId() {
                                        const input = document.getElementById('akun_text').value;
                                        const options = document.querySelectorAll('#akunList option');
                                        const hiddenInput = document.getElementById('akun_hidden');

                                        let selectedId = null;
                                        options.forEach(opt => {
                                            if (opt.value === input) {
                                                selectedId = opt.getAttribute('data-id');
                                            }
                                        });

                                        if (selectedId) {
                                            hiddenInput.value = selectedId;
                                            hiddenInput.form.submit(); // langsung submit form jika valid
                                        } else {
                                            alert('Akun tidak valid. Pilih dari daftar yang tersedia.');
                                            document.getElementById('akun_text').value = '';
                                            hiddenInput.value = '';
                                        }
                                    }
                                </script>



                            </div>

                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <label for="start_date" class="form-label">Dari Tanggal</label>
                                    <input type="date" class="form-control" name="start_date"
                                        value="{{ request('start_date') }}" onchange="this.form.submit()">
                                </div>

                                <div class="col-md-3">
                                    <label for="end_date" class="form-label">Sampai Tanggal</label>
                                    <input type="date" class="form-control" name="end_date"
                                        value="{{ request('end_date') }}" onchange="this.form.submit()">
                                </div>

                                <div class="col-md-6">
                                    <label for="search" class="form-label">Cari</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="search"
                                            placeholder="Cari apa saja..." value="{{ request('search') }}">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="ti ti-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-12 d-flex justify-content-end">
                                    <a href="{{ route('buku-besar.index') }}" class="btn btn-secondary mt-2">
                                        <i class="ti ti-refresh"></i> Reset
                                    </a>
                                </div>
                            </div>
                        </form>



                        <br>

                        <div id="print-area">

                            @if (isset($saldo_awal))
                                <div class="">
                                    <strong>Saldo Awal :</strong> Rp {{ number_format($saldo_awal) }}
                                </div>
                            @endif

                            <div class="mb-3">
                                <strong>Saldo Akhir :</strong> Rp {{ number_format($saldo_akhir) }}
                            </div>


                            <form method="GET" class="mb-3 no-print">
                                <div class="d-flex align-items-center gap-2">
                                    <label for="perPage" class="mb-0">Tampilkan</label>
                                    <select name="per_page" id="perPage" class="form-select form-select-sm w-auto"
                                        onchange="this.form.submit()">
                                        @foreach ([10, 25, 50, 100] as $option)
                                            <option value="{{ $option }}"
                                                {{ request('per_page') == $option ? 'selected' : '' }}>
                                                {{ $option }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <span class="ms-1">data per halaman</span>
                                </div>

                                {{-- Pertahankan parameter lain --}}
                                <input type="hidden" name="akun" value="{{ request('akun') }}">
                                <input type="hidden" name="start_date" value="{{ request('start_date') }}">
                                <input type="hidden" name="end_date" value="{{ request('end_date') }}">
                                <input type="hidden" name="id_unit" value="{{ request('id_unit') }}">
                                <input type="hidden" name="id_divisi" value="{{ request('id_divisi') }}">
                                <input type="hidden" name="search" value="{{ request('search') }}">
                            </form>

                            <table class="table text-nowrap align-middle mb-0">
                                <thead>
                                    <tr class="border-2 border-bottom border-primary border-0">
                                        <th scope="col" class="ps-0">Tgl</th>
                                        <th scope="col">No Bukti</th>
                                        <th scope="col" class="text-center">Keterangan</th>
                                        <th scope="col" class="text-center">Jenis</th>
                                        <th scope="col" class="text-center">Unit</th>
                                        <th scope="col" class="text-center">Divisi</th>
                                        <th scope="col" class="text-center">Kd Sumbangan</th>
                                        <th scope="col" class="text-center">Kd P&H</th>
                                        <th scope="col" class="text-center">Akun Debit (Rp)</th>
                                        <th scope="col" class="text-center">Akun Kredit (Rp)</th>
                                        {{-- <th scope="col" class="text-center">Jumlah</th> --}}
                                    </tr>
                                </thead>

                                <tbody class="table-group-divider">


                                    @foreach ($paginatedData as $detail)
                                        <tr>
                                            <td class="ps-0 fw-medium">{{ $detail->tanggal }}</td>
                                            <td class="text-center fw-medium">{{ $detail->no_bukti }}</td>
                                            <td class="text-start fw-medium">{{ $detail->keterangan }}</td>
                                            <td class="text-center fw-medium">{{ $detail->jenis ?? '-' }}</td>
                                            <td class="text-center fw-medium">{{ $detail->unit ?? '-' }}</td>
                                            <td class="text-center fw-medium">{{ $detail->divisi ?? '-' }}</td>
                                            <td class="text-center fw-medium">
                                                {{ $detail->kode_sumbangan ?? '-' }}</td>
                                            <td class="text-center fw-medium">{{ $detail->kode_ph ?? '-' }}
                                            </td>
                                            <td class="text-center fw-medium">
                                                @if ($detail->debit_kredit === 'debit')
                                                    {{-- {{ $detail->akun ?? 'Akun Tidak Ditemukan' }} --}}
                                                    Rp {{ number_format($detail->nominal) }}
                                                @endif
                                            </td>
                                            <td class="text-center fw-medium">
                                                @if ($detail->debit_kredit === 'kredit')
                                                    {{-- {{ $detail->akun ?? 'Akun Tidak Ditemukan' }} --}}
                                                    Rp {{ number_format($detail->nominal) }}
                                                @endif
                                            </td>
                                        </tr>
                                    @endforeach

                                    {{-- Baris Total --}}
                                    <tr class="fw-bold">
                                        <td colspan="8" class="text-end">Total</td>
                                        <td class="text-center">Rp {{ number_format($total_debit) }}</td>
                                        <td class="text-center">Rp {{ number_format($total_kredit) }}</td>
                                        {{-- <td class="text-center">Rp
                                                    {{ number_format($total_debit + $total_kredit) }}</td> --}}
                                    </tr>
                                </tbody>


                            </table>
                        </div>

                        <div class="mt-4">
                            {{ $paginatedData->links('pagination::bootstrap-5') }}
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="py-6 px-6 text-center">
            <p class="mb-0 fs-4">Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025</p>
        </div>
    </div>
@endsection


@push('scripts')
    <script>
        function printLaporan() {
            const content = document.getElementById("print-area").innerHTML;

            const printWindow = window.open('', '', 'height=800,width=1200');
            printWindow.document.write(`
            <html>
                <head>
                    <title>Laporan Buku Besar</title>
                    <style>
                        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #000; padding: 6px; font-size: 11px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        thead { display: table-header-group; }
                        tfoot { display: table-footer-group; }

                        .text-center { text-align: center; }
                        .text-end { text-align: right; }

                        @media print {
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${content}
                </body>
            </html>
        `);

            printWindow.document.close();
        }
    </script>
@endpush
