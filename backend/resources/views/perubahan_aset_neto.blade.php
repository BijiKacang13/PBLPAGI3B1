@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | Laporan Perubahan Aset Neto</title>
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
@endpush

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">

                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h5 class="card-title">Laporan Perubahan Aset Neto</h5>
                            <div class="action-buttons">
                                <!-- Tombol Export Excel dengan warna hijau tua -->
                                <a href="{{ route('perubahan-aset-neto.index', ['export_excel' => 1]) }}"
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
                            <form method="GET" action="{{ route('perubahan-aset-neto.index') }}">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <label for="unit" class="form-label">Unit</label>

                                        @php
                                            $unit_user = \App\Models\Unit::find($id_unit); // $id_unit dikirim dari controller
                                        @endphp

                                        @if (in_array(Auth::user()->role, ['admin', 'auditor']))
                                            <select name="unit" id="unit" class="form-control"
                                                onchange="this.form.submit()">
                                                <option value="">-- Semua Unit --</option>
                                                @foreach ($units as $unit)
                                                    <option value="{{ $unit->id_unit }}"
                                                        {{ $id_unit == $unit->id_unit ? 'selected' : '' }}>
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

                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="tanggal_mulai" class="form-label">Dari Tanggal</label>
                                        <input type="date" name="tanggal_mulai" id="tanggal_mulai" class="form-control"
                                            value="{{ request('tanggal_mulai', $start) }}" onchange="this.form.submit()">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="tanggal_selesai" class="form-label">Sampai Tanggal</label>
                                        <input type="date" name="tanggal_selesai" id="tanggal_selesai"
                                            class="form-control" value="{{ request('tanggal_selesai', $end) }}"
                                            onchange="this.form.submit()">
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-12 d-flex justify-content-end">
                                        <a href="{{ route('perubahan-aset-neto.index') }}" class="btn btn-secondary mt-2">
                                            <i class="ti ti-refresh"></i> Reset
                                        </a>
                                    </div>
                                </div>
                            </form>


                            <!-- Tabel Perubahan Aset Neto -->
                            <div class="table-responsive" id="print-area">

                                <table class="table table-bordered">
                                    <tr class="table-success fw-bold">
                                        <td colspan="2">Aset Neto Dengan Pembatasan Sumber Daya</td>
                                    </tr>
                                    <tr>
                                        <td>Saldo Awal</td>
                                        <td class="text-end">
                                            {{ number_format($data['dengan_pembatasan']['saldo_awal'], 0) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Kenaikan (Penurunan) Aset Neto Periode Lalu</td>
                                        <td class="text-end">
                                            {{ number_format($data['dengan_pembatasan']['kenaikan_periode_lalu'], 0) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Kenaikan (Penurunan) Aset Neto Periode Berjalan</td>
                                        <td class="text-end">
                                            {{ number_format($data['dengan_pembatasan']['kenaikan_periode_berjalan'], 0) }}
                                        </td>
                                    </tr>
                                    <tr class="fw-bold">
                                        <td>Saldo Akhir Aset Neto Dengan Pembatasan</td>
                                        <td class="text-end">
                                            {{ number_format($data['dengan_pembatasan']['saldo_akhir'], 0) }}</td>
                                    </tr>

                                    <tr class="table-success fw-bold mt-3">
                                        <td colspan="2">Aset Neto Tanpa Pembatasan Dengan Sumber Daya</td>
                                    </tr>
                                    <tr>
                                        <td>Saldo Awal</td>
                                        <td class="text-end">
                                            @if ($data['tanpa_pembatasan']['saldo_awal'] == 0)
                                                -
                                            @elseif ($data['tanpa_pembatasan']['saldo_awal'] > 0)
                                                {{ number_format($data['tanpa_pembatasan']['saldo_awal'], 0, ',', '.') }}
                                            @else
                                                ({{ number_format(abs($data['tanpa_pembatasan']['saldo_awal']), 0, ',', '.') }})
                                            @endif
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Kenaikan (Penurunan) Aset Neto Periode Lalu</td>
                                        <td class="text-end">
                                            {{ number_format($data['tanpa_pembatasan']['kenaikan_periode_lalu'], 0) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Kenaikan (Penurunan) Aset Neto Periode Berjalan</td>
                                        <td class="text-end">
                                            @if ($data['tanpa_pembatasan']['kenaikan_periode_berjalan'] == 0)
                                                -
                                            @elseif ($data['tanpa_pembatasan']['kenaikan_periode_berjalan'] > 0)
                                                {{ number_format($data['tanpa_pembatasan']['kenaikan_periode_berjalan'], 0, ',', '.') }}
                                            @else
                                                ({{ number_format(abs($data['tanpa_pembatasan']['kenaikan_periode_berjalan']), 0, ',', '.') }})
                                            @endif
                                        </td>
                                    </tr>
                                    <tr class="fw-bold">
                                        <td>Saldo Akhir Aset Neto Tanpa Pembatasan</td>
                                        <td class="text-end">
                                            @if ($data['tanpa_pembatasan']['saldo_akhir'] == 0)
                                                -
                                            @elseif ($data['tanpa_pembatasan']['saldo_akhir'] > 0)
                                                {{ number_format($data['tanpa_pembatasan']['saldo_akhir'], 0, ',', '.') }}
                                            @else
                                                ({{ number_format(abs($data['tanpa_pembatasan']['saldo_akhir']), 0, ',', '.') }})
                                            @endif
                                        </td>
                                    </tr>

                                    <tr class="fw-bold table-success">
                                        <td>Total Saldo Akhir Aset Neto</td>
                                        <td class="text-end">
                                            @if ($total_saldo_akhir == 0)
                                                -
                                            @elseif ($total_saldo_akhir > 0)
                                                {{ number_format($total_saldo_akhir, 0, ',', '.') }}
                                            @else
                                                ({{ number_format(abs($total_saldo_akhir), 0, ',', '.') }})
                                            @endif
                                        </td>
                                    </tr>
                                </table>
                            </div>


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

                                    .table-primary {
                                        background-color: #cfe2ff !important;
                                        -webkit-print-color-adjust: exact;
                                        print-color-adjust: exact;
                                    }
                                }
                            </style>
                        </div>
                    </div>
                </div>
            </div>

            <div class="py-6 px-6 text-center">
                <p class="mb-0 fs-4">Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025</p>
            </div>
        </div>
    </div>

    <script>
        function printLaporan() {
            window.print();
        }
    </script>
@endsection
