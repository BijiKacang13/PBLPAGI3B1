@extends('layouts.layout')

@push('styles')
    <title>SIA Yayasan Darussalam | Laporan Posisi Keuangan</title>
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
                        <h5 class="card-title">Laporan Posisi Keuangan</h5>
                        <div class="action-buttons">

                            <!-- Tombol Export Excel dengan warna hijau tua -->
                            <a href="{{ route('neraca-saldo.index', ['export_excel' => 1, 'start_date' => request('start_date'), 'end_date' => request('end_date')]) }}"
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

                        <form method="GET" action="{{ route('neraca-saldo.index') }}">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label for="unit" class="form-label">Unit</label>
                                    @php
                                        $unit_user = \App\Models\Unit::find($id_unit);
                                    @endphp

                                    @if (in_array(Auth::user()->role, ['admin', 'auditor']))
                                        <select name="unit" id="unit" class="form-control"
                                            onchange="this.form.submit()">
                                            <option value="">-- Semua Unit --</option>
                                            @foreach ($units as $unit)
                                                <option value="{{ $unit->id_unit }}"
                                                    {{ request('unit', $id_unit) == $unit->id_unit ? 'selected' : '' }}>
                                                    {{ $unit->unit }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @elseif (Auth::user()->role === 'akuntan_unit')
                                        <select class="form-control" disabled>
                                            @foreach ($units as $unit)
                                                <option value="{{ $unit->id_unit }}"
                                                    {{ $unit->id_unit == $id_unit ? 'selected' : '' }}>
                                                    {{ $unit->unit }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <input type="hidden" name="unit" value="{{ $id_unit }}">
                                    @endif
                                </div>

                                <div class="col-md-6">
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

                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label for="start_date" class="form-label">Dari Tanggal</label>
                                    <input type="date" class="form-control" name="start_date"
                                        value="{{ request('start_date', \Carbon\Carbon::now()->startOfYear()->toDateString()) }}"
                                        onchange="this.form.submit()">

                                </div>

                                <div class="col-md-6">
                                    <label for="end_date" class="form-label">Sampai Tanggal</label>
                                    <input type="date" class="form-control" name="end_date"
                                        value="{{ request('end_date', \Carbon\Carbon::now()->toDateString()) }}"
                                        onchange="this.form.submit()">

                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-12 d-flex justify-content-end">
                                    <a href="{{ route('neraca-saldo.index') }}" class="btn btn-secondary mt-2">
                                        <i class="ti ti-refresh"></i> Reset
                                    </a>
                                </div>
                            </div>
                        </form>


                        <!-- Tabel Neraca Saldo -->
                        <div id="print-area">

                            <table class="table table-bordered">
                                <thead class="table-dark">
                                    <tr>
                                        <th>AKUN</th>
                                        <th class="text-end">SALDO PERIODE LALU</th>
                                        <th class="text-end">SALDO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @php
                                        $totalSaldo = 0;
                                        $totalPeriodeLalu = 0;
                                    @endphp

                                    @foreach ($semua_akun->groupBy('sub_kategori_akun.kategori_akun.kategori_akun') as $kategori => $sub_kategoris)
                                        @php
                                            $kategoriSaldo = 0;
                                            $kategoriPeriodeLalu = 0;
                                        @endphp

                                        <!-- Kategori -->
                                        <tr class="table-success fw-bold">
                                            <td colspan="3">{{ strtoupper($kategori) }}</td>
                                        </tr>

                                        @foreach ($sub_kategoris->groupBy('sub_kategori_akun.sub_kategori_akun') as $sub_kategori => $akuns)
                                            @php
                                                $subSaldo = 0;
                                                $subPeriodeLalu = 0;
                                            @endphp

                                            <!-- Sub Kategori -->
                                            <tr class="table-secondary">
                                                <td colspan="3">&nbsp;&nbsp;&nbsp;{{ $sub_kategori }}</td>
                                            </tr>

                                            @foreach ($akuns as $akun)
                                                @php
                                                    $saldo = $saldo_akun[$akun->id_akun]->saldo ?? 0;
                                                    $periode_lalu = $saldo_akun[$akun->id_akun]->periode_lalu ?? 0;

                                                    $subSaldo += $saldo;
                                                    $kategoriSaldo += $saldo;
                                                    $totalSaldo += $saldo;

                                                    $subPeriodeLalu += $periode_lalu;
                                                    $kategoriPeriodeLalu += $periode_lalu;
                                                    $totalPeriodeLalu += $periode_lalu;
                                                @endphp

                                                <tr>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $akun->akun }}</td>
                                                    <td class="text-end">
                                                        {{ $periode_lalu < 0 ? '(' . number_format(abs($periode_lalu), 0, ',', '.') . ')' : number_format($periode_lalu, 0, ',', '.') }}
                                                    </td>
                                                    <td class="text-end">
                                                        {{ $saldo < 0 ? '(' . number_format(abs($saldo), 0, ',', '.') . ')' : number_format($saldo, 0, ',', '.') }}
                                                    </td>
                                                </tr>
                                            @endforeach

                                            <tr class="table-light fw-bold">
                                                <td class="text-end">Subtotal {{ $sub_kategori }}</td>
                                                <td class="text-end">
                                                    {{ $subPeriodeLalu < 0 ? '(' . number_format(abs($subPeriodeLalu), 0, ',', '.') . ')' : number_format($subPeriodeLalu, 0, ',', '.') }}
                                                </td>
                                                <td class="text-end">
                                                    {{ $subSaldo < 0 ? '(' . number_format(abs($subSaldo), 0, ',', '.') . ')' : number_format($subSaldo, 0, ',', '.') }}
                                                </td>
                                            </tr>
                                        @endforeach

                                        <tr class="table-warning fw-bold">
                                            <td class="text-end">Subtotal {{ strtoupper($kategori) }}</td>
                                            <td class="text-end">
                                                {{ $kategoriPeriodeLalu < 0 ? '(' . number_format(abs($kategoriPeriodeLalu), 0, ',', '.') . ')' : number_format($kategoriPeriodeLalu, 0, ',', '.') }}
                                            </td>
                                            <td class="text-end">
                                                {{ $kategoriSaldo < 0 ? '(' . number_format(abs($kategoriSaldo), 0, ',', '.') . ')' : number_format($kategoriSaldo, 0, ',', '.') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                                <tfoot class="fw-bold bg-light">
                                    <tr class="table-info">
                                        <td>Total KEWAJIBAN + ASET NETO</td>
                                        <td class="text-end">
                                            {{ $totalPeriodeLaluKewajibanAsetNeto < 0 ? '(' . number_format(abs($totalPeriodeLaluKewajibanAsetNeto), 0, ',', '.') . ')' : number_format($totalPeriodeLaluKewajibanAsetNeto, 0, ',', '.') }}
                                        </td>
                                        <td class="text-end">
                                            {{ $totalKewajibanAsetNeto < 0 ? '(' . number_format(abs($totalKewajibanAsetNeto), 0, ',', '.') . ')' : number_format($totalKewajibanAsetNeto, 0, ',', '.') }}
                                        </td>
                                    </tr>
                                </tfoot>
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
