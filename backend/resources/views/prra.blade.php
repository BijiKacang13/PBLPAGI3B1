@extends('layouts.layout')

@push('styles')
    <title>SIA Yayasan Darussalam | Laporan Neraca</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

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

        .text-narrow {
            white-space: nowrap;
            width: 1%;
        }
    </style>

    <style>
        @media print {
            body * {
                visibility: hidden;
            }

            #print-area,
            #print-area * {
                visibility: visible;
            }

            #print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }

            .table-dark {
                background-color: #212529 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .table-secondary {
                background-color: #e2e3e5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .table-success {
                background-color: #d1e7dd !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
@endpush

@section('content')
    <div class="row">

        <div class="col-lg-12">
            <div class="card">
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="card-title">Proyeksi Rencana dan Realisasi Anggaran</h5>
                        <div class="action-buttons">


                            <!-- Tombol Export Excel dengan warna hijau tua -->
                            <a href="{{ route('prra.index', [
                                'export_excel' => 1,
                                'berdasarkan' => request('berdasarkan'),
                                'unit' => request('unit'),
                                'divisi' => request('divisi'),
                                'start_date' => request('start_date'),
                                'end_date' => request('end_date'),
                            ]) }}"
                                class="btn btn-success custom-green">
                                <i class="fas fa-file-excel me-1"></i> Export Excel
                            </a>



                            <!-- Tombol Print dengan warna abu-abu tua -->
                            <button class="btn btn-secondary ms-2 custom-grey" onclick="printLaporan()">
                                <i class="fas fa-print me-1"></i> Print
                            </button>

                        </div>
                    </div>



                    <div class="table-responsive">
                        <br>


                        <form method="GET" action="{{ route('prra.index') }}">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="berdasarkan" class="form-label">Berdasarkan</label>
                                    <select name="berdasarkan" class="form-control" onchange="this.form.submit()">
                                        <option value="akun" {{ request('berdasarkan') == 'akun' ? 'selected' : '' }}>Akun
                                        </option>
                                        <option value="kegiatan"
                                            {{ request('berdasarkan') == 'kegiatan' ? 'selected' : '' }}>Kegiatan</option>
                                    </select>
                                </div>

                                <div class="col-md-3">
                                    <label for="unit" class="form-label">Unit</label>
                                    @if (in_array(Auth::user()->role, ['admin', 'auditor']))
                                        <select name="unit" id="unit" class="form-control"
                                            onchange="this.form.submit()">
                                            <option value="">-- Semua Unit --</option>
                                            @foreach ($units as $unit)
                                                <option value="{{ $unit->id_unit }}"
                                                    {{ $unitId == $unit->id_unit ? 'selected' : '' }}>
                                                    {{ $unit->unit }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @elseif (Auth::user()->role === 'akuntan_unit')
                                        <select class="form-control" disabled>
                                            @foreach ($units as $unit)
                                                <option value="{{ $unit->id_unit }}"
                                                    {{ $unit->id_unit == $unitId ? 'selected' : '' }}>
                                                    {{ $unit->unit }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <input type="hidden" name="unit" value="{{ $unitId }}">
                                    @endif
                                </div>


                                <div class="col-md-3">
                                    <label for="divisi" class="form-label">Divisi</label>
                                    <select name="divisi" id="divisi" class="form-control"
                                        onchange="this.form.submit()">
                                        <option value="">-- Semua Divisi --</option>
                                        @foreach ($divisis as $divisi)
                                            <option value="{{ $divisi->id_divisi }}"
                                                {{ request('divisi') == $divisi->id_divisi ? 'selected' : '' }}>
                                                {{ $divisi->divisi }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="start_date" class="form-label">Dari Tanggal</label>
                                    <input type="date" class="form-control" name="start_date"
                                        value="{{ request('start_date') ?? date('Y') . '-01-01' }}"
                                        onchange="this.form.submit()">
                                </div>
                                <div class="col-md-6">
                                    <label for="end_date" class="form-label">Sampai Tanggal</label>
                                    <input type="date" class="form-control" name="end_date"
                                        value="{{ request('end_date') ?? date('Y-m-d') }}" onchange="this.form.submit()">
                                </div>
                            </div>


                            <div class="row mb-3">
                                <div class="col-12 d-flex justify-content-end">
                                    <a href="{{ route('prra.index') }}" class="btn btn-secondary mt-2">
                                        <i class="ti ti-refresh"></i> Reset
                                    </a>
                                </div>
                            </div>
                        </form>





                        <br><br>


                        <!-- Tabel Neraca Saldo -->
                        <div id="print-area">
                            <table class="table table-bordered">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Akun</th>
                                        <th class="text-end" style="white-space: nowrap; width: 1%;">Budget RAPBS</th>
                                        <th class="text-end" style="white-space: nowrap; width: 1%;">Realisasi</th>
                                        <th class="text-end" style="white-space: nowrap; width: 1%;">Selisih</th>
                                        <th class="text-end" style="white-space: nowrap; width: 1%;">Persentase Capaian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @php
                                        $totalBudget = 0;
                                        $totalRealisasi = 0;
                                    @endphp

                                    @foreach ($groupedData as $kategori => $subKategoriData)
                                        <tr class="table-primary fw-bold">
                                            <td colspan="5">{{ strtoupper($kategori) }}</td>
                                        </tr>

                                        @foreach ($subKategoriData as $subKategori => $items)
                                            @foreach ($items as $item)
                                                @php
                                                    $totalBudget += $item->budget_rapbs;
                                                    $totalRealisasi += $item->realisasi;
                                                @endphp
                                                <tr>
                                                    <td class="text-start">{{ $item->nama_akun ?? $item->nama_kegiatan }}
                                                    </td>
                                                    <td class="text-end text-narrow">
                                                        
                                                        {{ $item->budget_rapbs < 0 ? '(' . number_format(abs($item->budget_rapbs), 0, ',', '.') . ')' : number_format($item->budget_rapbs, 0, ',', '.') }}
                                                    </td>
                                                    <td class="text-end text-narrow">
                                                        
                                                        {{ $item->realisasi < 0 ? '(' . number_format(abs($item->realisasi), 0, ',', '.') . ')' : number_format($item->realisasi, 0, ',', '.') }}
                                                    </td>
                                                    <td class="text-end text-narrow">
                                                        
                                                        {{ $item->selisih < 0 ? '(' . number_format(abs($item->selisih), 0, ',', '.') . ')' : number_format($item->selisih, 0, ',', '.') }}
                                                    </td>
                                                    <td class="text-end text-narrow">
                                                        @if ($item->budget_rapbs != 0)
                                                            {{ number_format(($item->realisasi / $item->budget_rapbs) * 100, 2, ',', '.') }}%
                                                        @else
                                                            0 %
                                                        @endif
                                                    </td>
                                                </tr>
                                            @endforeach
                                        @endforeach
                                    @endforeach
                                </tbody>
                            </table>



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
            window.print();
        }
    </script>
@endpush
