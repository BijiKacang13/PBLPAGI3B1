@extends('layouts.layout')
@push('styles')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <title>SIA Yayasan Darussalam | Jurnal Umum</title>
    <style>
        .th-with-dot {
            position: relative;
        }

        .dot-red {
            position: absolute;
            top: -35px;
            left: 28px;
            /* Ubah dari right menjadi left */
            width: 10px;
            height: 10px;
            background-color: red;
            border-radius: 50%;
            cursor: pointer;
        }

        .dot-container {
            /* position: relative; */
            display: flex;
            align-items: center;
            gap: 200px;
        }

        .ellipsis-dropdown {
            position: absolute;
            top: -40px;
            left: 1px;

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

        thead {
            display: table-header-group;
        }

        tfoot {
            display: table-footer-group;
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
                        <h4 class="fw-semibold mb-0">Jurnal Umum</h4>

                        <div>
                            <a href="{{ route('jurnal-umum.index', ['export_excel' => 1, 'start_date' => request('start_date'), 'end_date' => request('end_date')]) }}"
                                class="btn btn-success custom-green">
                                <i class="fas fa-file-excel me-1"></i> Export Excel
                            </a>
                            <button class="btn btn-secondary ms-2 custom-grey" onclick="printLaporan()">
                                <i class="fas fa-print me-1"></i> Print
                            </button>
                        </div>
                    </div>




                    <div class="table-responsive">
                        <form method="GET" action="{{ route('jurnal-umum.index') }}">
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <label for="unit" class="form-label">Unit</label>

                                    @if (in_array($user->role, ['admin', 'auditor']))
                                        <select name="unit" id="unit" class="form-select"
                                            onchange="this.form.submit()">
                                            <option value="">-- Semua Unit --</option>
                                            @foreach ($units as $unit)
                                                <option value="{{ $unit->id_unit }}"
                                                    {{ request('unit', $id_unit) == $unit->id_unit ? 'selected' : '' }}>
                                                    {{ $unit->unit }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @elseif ($user->role === 'akuntan_unit')
                                        @php
                                            $unit_akun = \App\Models\Unit::find($id_unit);
                                        @endphp
                                        <select class="form-select" disabled>
                                            <option selected>
                                                {{ $unit_akun->unit ?? 'Unit tidak ditemukan' }}
                                            </option>
                                        </select>
                                        <input type="hidden" name="unit" value="{{ $id_unit }}">
                                    @endif
                                </div>



                                <div class="col-md-3">
                                    <label for="divisi" class="form-label">Divisi</label>
                                    <select name="divisi" id="divisi" class="form-select" onchange="this.form.submit()">
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
                                <div class="col-md-3">
                                    <label for="start_date" class="form-label">Dari Tanggal</label>
                                    <input type="date" name="start_date" class="form-control"
                                        value="{{ request('start_date', date('Y-01-01')) }}" onchange="this.form.submit()">
                                </div>
                                <div class="col-md-3">
                                    <label for="end_date" class="form-label">Sampai Tanggal</label>
                                    <input type="date" name="end_date" class="form-control"
                                        value="{{ request('end_date', date('Y-m-d')) }}" onchange="this.form.submit()">
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


                            <!-- Tombol Reset di Pojok Kanan Bawah -->
                            <div class="row">
                                <div class="col-12 text-end">
                                    <a href="{{ route('jurnal-umum.index') }}" class="btn btn-secondary">
                                        <i class="ti ti-refresh"></i> Reset
                                    </a>
                                </div>
                            </div>
                        </form>


                        <br>

                        @if (session('success'))
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                {{ session('success') }}
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        @endif

                        @if (session('error'))
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                {{ session('error') }}
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        @endif

                        @php
                            $jurnalBelumDiposting = $detailjurnalumum
                                ->pluck('jurnal_umum.id_jurnal_umum')
                                ->unique()
                                ->diff($postedJurnalIds);
                        @endphp

                        @php
                            $user = Auth::user();
                            $bolehPostingSemua = false;

                            if ($user->role === 'admin') {
                                $bolehPostingSemua = true;
                            } elseif (
                                $user->role === 'akuntan_unit' &&
                                isset($sidebarHakAkses) &&
                                $sidebarHakAkses->create_buku_besar
                            ) {
                                $bolehPostingSemua = true;
                            }
                        @endphp

                        @if ($bolehPostingSemua && $jurnalBelumDiposting->count() > 0)
                            <form method="POST" action="{{ route('buku-besar.postingSemua') }}"
                                onsubmit="return confirm('Yakin ingin memposting semua jurnal yang belum diposting?')">
                                @csrf
                                <input type="hidden" name="start_date" value="{{ request('start_date') }}">
                                <input type="hidden" name="end_date" value="{{ request('end_date') }}">

                                <button type="button"
                                    class="btn btn-success d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 py-2 mb-3"
                                    data-bs-toggle="modal" data-bs-target="#postingSemuaModal">
                                    <i class="ti ti-send"></i>
                                    <span class="fw-semibold">Posting Semua Jurnal</span>
                                </button>

                            </form>
                        @endif




                        <form method="GET" class="mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <label for="perPage" class="mb-0">Tampilkan</label>
                                <select name="per_page" id="perPage" class="form-select form-select-sm w-auto"
                                    onchange="this.form.submit()">
                                    @foreach ([10, 25, 50, 100] as $option)
                                        <option value="{{ $option }}"
                                            {{ request('per_page', 10) == $option ? 'selected' : '' }}>
                                            {{ $option }}
                                        </option>
                                    @endforeach
                                </select>
                                <span>data per halaman</span>
                            </div>

                            {{-- Pertahankan filter --}}
                            <input type="hidden" name="unit" value="{{ request('unit') }}">
                            <input type="hidden" name="divisi" value="{{ request('divisi') }}">
                            <input type="hidden" name="start_date" value="{{ request('start_date') }}">
                            <input type="hidden" name="end_date" value="{{ request('end_date') }}">
                            <input type="hidden" name="search" value="{{ request('search') }}">
                        </form>


                        <div id="print-area">

                            <table class="table text-nowrap align-middle mb-0">
                                <thead>
                                    <tr class="border-2 border-bottom border-primary border-0">
                                        <th scope="col" class="ps-0">Tgl</th>
                                        <th scope="col">No Bukti</th>
                                        <th scope="col" class="text-center">Keterangan</th>
                                        <th scope="col" class="text-center">Jenis</th>
                                        <th scope="col" class="text-center">Unit</th>
                                        <th scope="col" class="text-center">Divisi</th>
                                        <th scope="col" class="text-center">Kegiatan</th>
                                        <th scope="col" class="text-center">Sumber Anggaran</th>
                                        <th scope="col" class="text-center">Kd Sumbangan</th>
                                        <th scope="col" class="text-center">Kd P&H</th>
                                        <th scope="col" class="text-center">Akun Debit (Rp)</th>
                                        <th scope="col" class="text-center">Akun Kredit (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody class="table-group-divider">
                                    @php
                                        $groupedData = $detailjurnalumum
                                            ->sortByDesc(fn($item) => $item->jurnal_umum->id_jurnal_umum)
                                            ->groupBy('jurnal_umum.no_bukti');
                                        $totalDebit = 0;
                                        $totalKredit = 0;
                                        $totalKeseluruhan = 0;
                                    @endphp

                                    @foreach ($groupedData as $no_bukti => $group)
                                        @php $rowspan = $group->count(); @endphp
                                        @foreach ($group as $index => $data)
                                            <tr>
                                                @if ($index === 0)
                                                    <th scope="row" class="ps-0 fw-medium th-with-dot"
                                                        rowspan="{{ $rowspan }}">

                                                        <div
                                                            class="d-flex justify-content-between align-items-start position-relative">
                                                            @php
                                                                $bolehPosting =
                                                                    $user->role === 'admin' ||
                                                                    ($user->role === 'akuntan_unit' &&
                                                                        $sidebarHakAkses &&
                                                                        $sidebarHakAkses->create_buku_besar);
                                                            @endphp

                                                            @if (!in_array($data->jurnal_umum->id_jurnal_umum, $postedJurnalIds))
                                                                <span class="dot-red no-print"
                                                                    data-id="{{ $data->jurnal_umum->id_jurnal_umum }}"
                                                                    @if ($bolehPosting) data-bs-toggle="modal"
                                                                    data-bs-target="#postingModal" @endif></span>
                                                            @endif




                                                            @php
                                                                $bolehEdit =
                                                                    $user->role === 'admin' ||
                                                                    ($user->role === 'akuntan_unit' &&
                                                                        $sidebarHakAkses &&
                                                                        $sidebarHakAkses->update_jurnal_umum);

                                                                $bolehHapus =
                                                                    $user->role === 'admin' ||
                                                                    ($user->role === 'akuntan_unit' &&
                                                                        $sidebarHakAkses &&
                                                                        $sidebarHakAkses->delete_jurnal_umum);
                                                            @endphp

                                                            @if ($bolehEdit || $bolehHapus)
                                                                <div class="dropdown ellipsis-dropdown ms-auto no-print">
                                                                    <button class="btn btn-sm p-0 border-0 bg-transparent"
                                                                        type="button"
                                                                        id="dropdownMenuButton{{ $data->jurnal_umum->id_jurnal_umum }}"
                                                                        data-bs-toggle="dropdown" aria-expanded="false"
                                                                        style="font-size: 20px; line-height: 1;">
                                                                        &#8942;
                                                                    </button>
                                                                    <ul class="dropdown-menu"
                                                                        aria-labelledby="dropdownMenuButton{{ $data->jurnal_umum->id_jurnal_umum }}">

                                                                        @if ($bolehEdit)
                                                                            <li>
                                                                                <a class="dropdown-item"
                                                                                    href="{{ url('/jurnal-umum/' . $data->jurnal_umum->id_jurnal_umum) }}">
                                                                                    Edit
                                                                                </a>
                                                                            </li>
                                                                        @endif

                                                                        @if ($bolehHapus)
                                                                            <li>
                                                                                <button type="button"
                                                                                    class="dropdown-item text-danger"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#deleteModal"
                                                                                    data-id="{{ $data->jurnal_umum->id_jurnal_umum }}">
                                                                                    Hapus
                                                                                </button>
                                                                            </li>
                                                                        @endif

                                                                    </ul>
                                                                </div>
                                                            @endif


                                                        </div>



                                                        {{-- {{ $data->jurnal_umum->tanggal }} --}}
                                                        {{ \Carbon\Carbon::parse($data->jurnal_umum->tanggal)->format('d-m-Y') }}
                                                    </th>


                                                    <td class="text-center fw-medium" rowspan="{{ $rowspan }}">
                                                        {{ $data->jurnal_umum->no_bukti }}
                                                    </td>
                                                    <td class="text-start fw-medium" rowspan="{{ $rowspan }}">
                                                        {{ $data->jurnal_umum->keterangan }}
                                                    </td>
                                                    <td class="text-center fw-medium" rowspan="{{ $rowspan }}">
                                                        {{ $data->jurnal_umum->jenis_transaksi }}
                                                    </td>
                                                    <td class="text-center fw-medium" rowspan="{{ $rowspan }}">
                                                        {{ $data->jurnal_umum->unit->unit }}
                                                    </td>
                                                    <td class="text-center fw-medium" rowspan="{{ $rowspan }}">
                                                        {{ $data->jurnal_umum->divisi->divisi }}
                                                    </td>
                                                    <td class="text-start fw-medium" rowspan="{{ $rowspan }}">
                                                        @if ($data->jurnal_umum->kegiatan)
                                                            {{ $data->jurnal_umum->kegiatan->kode_kegiatan }} -
                                                            {{ $data->jurnal_umum->kegiatan->kegiatan }}
                                                        @else
                                                            <em>-</em>
                                                        @endif
                                                    </td>

                                                    <td class="text-center fw-medium" rowspan="{{ $rowspan }}">
                                                        @if ($data->jurnal_umum->sumber_anggaran)
                                                            {{ $data->jurnal_umum->sumber_anggaran->kode_akun }} -
                                                            {{ $data->jurnal_umum->sumber_anggaran->akun }}
                                                        @else
                                                            <em>-</em>
                                                        @endif
                                                    </td>

                                                    <td class="text-center fw-medium" rowspan="{{ $rowspan }}">
                                                        {{ $data->jurnal_umum->kode_sumbangan }}
                                                    </td>
                                                    <td class="text-center fw-medium" rowspan="{{ $rowspan }}">
                                                        {{ $data->jurnal_umum->kode_ph }}
                                                    </td>
                                                @endif
                                                <td class="text-center fw-medium border-2">
                                                    @if ($data->debit_kredit === 'debit')
                                                        {{ $data->akun->akun ?? 'Akun Tidak Ditemukan' }}
                                                        ({{ number_format($data->nominal) }})
                                                        @php $totalDebit += $data->nominal; @endphp
                                                    @endif
                                                </td>
                                                <td class="text-center fw-medium border-2">
                                                    @if ($data->debit_kredit === 'kredit')
                                                        {{ $data->akun->akun ?? 'Akun Tidak Ditemukan' }}
                                                        ({{ number_format($data->nominal) }})
                                                        @php $totalKredit += $data->nominal; @endphp
                                                    @endif
                                                </td>

                                            </tr>
                                        @endforeach
                                    @endforeach

                                    <!-- Row Total -->
                                    <tr class="fw-bold bg-light">
                                        <td colspan="10" class="text-end">Total</td>
                                        <td class="text-center">{{ number_format($totalDebit) }}</td>
                                        <td class="text-center">{{ number_format($totalKredit) }}</td>
                                    </tr>

                                </tbody>

                            </table>
                        </div>
                        <div class="mt-4">
                            {{ $jurnalPaginated->links('pagination::bootstrap-5') }}
                        </div>



                        {{-- modal posting semua --}}
                        <div class="modal fade" id="postingSemuaModal" tabindex="-1"
                            aria-labelledby="postingSemuaModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-sm modal-dialog-centered">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="postingSemuaModalLabel">Konfirmasi</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                                            aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body text-center">
                                        Yakin ingin memposting semua jurnal yang belum diposting ke Buku Besar?
                                    </div>
                                    <div class="modal-footer">
                                        <form id="postingSemuaForm" method="POST"
                                            action="{{ route('buku-besar.postingSemua') }}">
                                            @csrf
                                            <input type="hidden" name="start_date" value="{{ request('start_date') }}">
                                            <input type="hidden" name="end_date" value="{{ request('end_date') }}">
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                    data-bs-dismiss="modal">Batal</button>
                                                <button type="submit" class="btn btn-primary btn-sm">Posting
                                                    Semua</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <!-- Modal Konfirmasi Hapus -->
                        <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel"
                            aria-hidden="true">
                            <div class="modal-dialog modal-sm modal-dialog-centered">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="deleteModalLabel">Konfirmasi</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                                            aria-label="Tutup"></button>
                                    </div>
                                    <div class="modal-body text-center">
                                        Hapus jurnal ini secara permanen?
                                    </div>
                                    <div class="modal-footer">
                                        <form id="deleteForm" method="POST">
                                            @csrf
                                            @method('DELETE')
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                    data-bs-dismiss="modal">Batal</button>
                                                <button type="submit" class="btn btn-danger btn-sm">Hapus</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <!-- Modal Posting-->
                        <div class="modal fade" id="postingModal" tabindex="-1" aria-labelledby="postingModalLabel"
                            aria-hidden="true">
                            <div class="modal-dialog modal-sm modal-dialog-centered">
                                <!-- Tambahkan modal-dialog-centered -->
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="postingModalLabel">Konfirmasi</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                                            aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body text-center">
                                        Posting ke Buku Besar?
                                    </div>
                                    <div class="modal-footer">
                                        <form id="postingForm" method="POST" action="{{ route('buku-besar.store') }}">
                                            @csrf
                                            <input type="hidden" name="id_jurnal_umum" id="idJurnalUmum">
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                    data-bs-dismiss="modal">Batal</button>
                                                <button type="submit" class="btn btn-primary btn-sm">Posting</button>
                                            </div>
                                        </form>

                                    </div>
                                </div>
                            </div>
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
        const deleteModal = document.getElementById('deleteModal');
        deleteModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const id = button.getAttribute('data-id');
            const form = document.getElementById('deleteForm');
            const url = "{{ route('jurnal-umum.destroy', ':id') }}".replace(':id', id);
            form.setAttribute('action', url);
        });
    </script>




    <script>
        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('.dot-red').forEach(dot => {
                dot.addEventListener('click', function() {
                    const jurnalId = this.getAttribute('data-id');
                    document.getElementById('idJurnalUmum').value = jurnalId;
                });
            });
        });
    </script>

    <script>
        function printLaporan() {
            const content = document.getElementById("print-area").innerHTML;

            const printWindow = window.open('', '', 'height=800,width=1200');
            printWindow.document.write(`
    <html>
        <head>
            <title>Cetak Laporan Jurnal Umum</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 11px; }
                th { background-color: #f2f2f2; }
                thead { display: table-header-group; } /* agar header muncul di setiap halaman */
                tfoot { display: table-footer-group; }

                .no-print {
                    display: none !important;
                }

                @media print {
                    body { margin: 0; }
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
