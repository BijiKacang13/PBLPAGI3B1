@extends('layouts.layout')


@push('styles')
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

            .print-header,
            .print-footer {
                display: block !important;
            }

            .d-none {
                display: block !important;
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
                        <h5 class="card-title">Laporan Komprehensif</h5>
                        <div class="action-buttons">
                            <!-- Tombol Export Excel dengan warna hijau tua -->
                            <a href="{{ url('/laporan-komprehensif?export_excel=1&tanggal_mulai=' . $tanggal_mulai . '&tanggal_selesai=' . $tanggal_selesai) }}"
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
                        <form method="GET" action="/laporan-komprehensif">
                            <div class="row mb-3">
                                @php
                                    $user = Auth::user();
                                    $unit_user = null;
                                    $divisi_user = null;

                                    if ($user->role === 'akuntan_unit') {
                                        $unit_user = \App\Models\Unit::find(
                                            \App\Models\Akuntan_Unit::where('id_akuntan_unit', $user->id_user)->value(
                                                'id_unit',
                                            ),
                                        );
                                    }

                                    if ($user->role === 'akuntan_divisi') {
                                        $divisi_user = \App\Models\Divisi::find(
                                            \App\Models\Akuntan_Divisi::where(
                                                'id_akuntan_divisi',
                                                $user->id_user,
                                            )->value('id_divisi'),
                                        );
                                    }
                                @endphp

                                <div class="col-md-6">
                                    <label for="id_unit" class="form-label">Unit</label>
                                    @if (in_array($user->role, ['admin', 'auditor']))
                                        <select name="id_unit" class="form-control" onchange="this.form.submit()">
                                            <option value="">-- Semua Unit --</option>
                                            @foreach ($units as $unit)
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

                                <div class="col-md-6">
                                    <label for="id_divisi" class="form-label">Divisi</label>
                                    @if (in_array($user->role, ['admin', 'auditor', 'akuntan_unit']))
                                        <select name="id_divisi" class="form-control" onchange="this.form.submit()">
                                            <option value="">-- Semua Divisi --</option>
                                            @foreach ($divisis as $divisi)
                                                <option value="{{ $divisi->id_divisi }}"
                                                    {{ request('id_divisi', $id_divisi) == $divisi->id_divisi ? 'selected' : '' }}>
                                                    {{ $divisi->divisi }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @elseif ($user->role === 'akuntan_divisi')
                                        <select class="form-control" disabled>
                                            <option selected>{{ $divisi_user->divisi ?? 'Divisi tidak ditemukan' }}</option>
                                        </select>
                                        <input type="hidden" name="id_divisi" value="{{ $divisi_user->id_divisi ?? '' }}">
                                    @endif
                                </div>



                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="tanggal_mulai" class="form-label">Dari Tanggal</label>
                                    <input type="date" name="tanggal_mulai" id="tanggal_mulai" class="form-control"
                                        value="{{ $tanggal_mulai }}" onchange="this.form.submit()">
                                </div>
                                <div class="col-md-6">
                                    <label for="tanggal_selesai" class="form-label">Sampai Tanggal</label>
                                    <input type="date" name="tanggal_selesai" id="tanggal_selesai" class="form-control"
                                        value="{{ $tanggal_selesai }}" onchange="this.form.submit()">
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-12 d-flex justify-content-end">
                                    <a href="{{ route('laporan-komprehensif.index') }}" class="btn btn-secondary mt-2">
                                        <i class="ti ti-refresh"></i> Reset
                                    </a>
                                </div>
                            </div>
                        </form>


                        <br>

                        <div id="print-area">
                            <!-- Header khusus untuk cetak -->
                            <div class="print-header text-center d-none">
                                <h3>LAPORAN KOMPREHENSIF</h3>
                                <h4>YAYASAN DARUSSALAM BATAM</h4>
                                <p>Periode: {{ date('d/m/Y', strtotime($tanggal_mulai)) }} -
                                    {{ date('d/m/Y', strtotime($tanggal_selesai)) }}</p>
                                <hr>
                            </div>

                            <table class="table table-bordered">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Akun</th>
                                        <th>Dengan Pembatasan</th>
                                        <th>Tanpa Pembatasan</th>
                                        <th class="text-end">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Pendapatan -->
                                    <tr class="table-secondary">
                                        <td colspan="4"><strong>PENERIMAAN DAN SUMBANGAN</strong></td>
                                    </tr>
                                    @foreach ($pendapatan_all as $sub_kategori => $akuns)
                                        <tr class="table-light">
                                            <td colspan="4"><strong>&nbsp;&nbsp;{{ $sub_kategori }}</strong></td>
                                        </tr>
                                        @foreach ($akuns as $item)
                                            <tr>
                                                <td>&nbsp;&nbsp;&nbsp;&nbsp;{{ $item->akun }}</td>
                                                <td class="text-end">
                                                    {{ number_format($item->total_dengan, 0, ',', '.') }}</td>
                                                <td class="text-end">
                                                    {{ number_format($item->total_tanpa, 0, ',', '.') }}</td>
                                                <td class="text-end"> {{ number_format($item->total, 0, ',', '.') }}</td>
                                            </tr>
                                        @endforeach
                                    @endforeach
                                    <tr class="fw-bold">
                                        <td>Total Pendapatan</td>
                                        <td class="text-end"> {{ number_format($total_pendapatan_terikat, 0, ',', '.') }}
                                        </td>
                                        <td class="text-end"> {{ number_format($total_pendapatan, 0, ',', '.') }}</td>
                                        <td class="text-end"> {{ number_format($total_pendapatan_all, 0, ',', '.') }}
                                        </td>
                                    </tr>
                                    <!-- Beban -->
                                    <tr class="table-secondary">
                                        <td colspan="4"><strong>BEBAN</strong></td>
                                    </tr>
                                    @foreach ($beban_all as $sub_kategori => $akuns)
                                        <tr class="table-light">
                                            <td colspan="4"><strong>&nbsp;&nbsp;{{ $sub_kategori }}</strong></td>
                                        </tr>
                                        @foreach ($akuns as $item)
                                            <tr>
                                                <td>&nbsp;&nbsp;&nbsp;&nbsp;{{ $item->akun }}</td>
                                                <td class="text-end">
                                                    {{ number_format($item->total_dengan, 0, ',', '.') }}</td>
                                                <td class="text-end">
                                                    {{ number_format($item->total_tanpa, 0, ',', '.') }}</td>
                                                <td class="text-end"> {{ number_format($item->total, 0, ',', '.') }}</td>
                                            </tr>
                                        @endforeach
                                    @endforeach
                                    <tr class="fw-bold">
                                        <td>Total Beban</td>
                                        <td class="text-end"> {{ number_format($total_beban_terikat, 0, ',', '.') }}</td>
                                        <td class="text-end"> {{ number_format($total_beban, 0, ',', '.') }}</td>
                                        <td class="text-end"> {{ number_format($total_beban_all, 0, ',', '.') }}</td>
                                    </tr>

                                    
                                    <!-- Kenaikan (Penurunan) -->
                                    <tr class="table-success fw-bold">
                                        <td>KENAIKAN (PENURUNAN) PENGHASILAN KOMPREHENSIF</td>
                                        <td class="text-end">
                                            @if ($total_pendapatan_terikat - $total_beban_terikat == 0)
                                                -
                                            @elseif ($total_pendapatan_terikat - $total_beban_terikat > 0)
                                                
                                                {{ number_format($total_pendapatan_terikat - $total_beban_terikat, 0, ',', '.') }}
                                            @else
                                                (
                                                {{ number_format(abs($total_pendapatan_terikat - $total_beban_terikat), 0, ',', '.') }})
                                            @endif
                                        </td>
                                        <td class="text-end">
                                            @if ($total_pendapatan - $total_beban == 0)
                                                -
                                            @elseif ($total_pendapatan - $total_beban > 0)
                                                 {{ number_format($total_pendapatan - $total_beban, 0, ',', '.') }}
                                            @else
                                                ({{ number_format(abs($total_pendapatan - $total_beban), 0, ',', '.') }})
                                            @endif
                                        </td>
                                        <td class="text-end">
                                            @if ($kenaikan_penghasilan_komprehensif == 0)
                                                -
                                            @elseif ($kenaikan_penghasilan_komprehensif > 0)
                                                 {{ number_format($kenaikan_penghasilan_komprehensif, 0, ',', '.') }}
                                            @else
                                                ({{ number_format(abs($kenaikan_penghasilan_komprehensif), 0, ',', '.') }})
                                            @endif
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <!-- Footer khusus untuk cetak -->
                            <div class="print-footer text-center d-none mt-3">
                                <p>Sistem Informasi Akuntansi Yayasan Darussalam Batam |
                                    {{ date('Y') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="py-6 px-6 text-center">
            <p class="mb-0 fs-4">Sistem Informasi Akuntansi Yayasan Darussalam Batam | {{ date('Y') }}
            </p>
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
