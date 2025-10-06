@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | Akun</title>
    <style>
        .modal-dialog-centered {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: auto;
            margin-left: auto;
        }
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
@endpush

@section('content')
    <div class="row">
        <div class="col-lg-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Budget RAPBS Kegiatan</h5><br>

                    {{-- Alert Sukses --}}
                    @if (session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
                        </div>
                    @endif

                    {{-- Alert Gagal --}}
                    @if (session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
                        </div>
                    @endif

                    @php
                        $user = Auth::user();
                        $bolehImportRapbs = false;
                        $bolehEditRapbs = false;

                        if ($user->role === 'admin') {
                            $bolehImportRapbs = true;
                            $bolehEditRapbs = true;
                        } elseif ($user->role === 'akuntan_unit' && isset($sidebarHakAkses)) {
                            $bolehImportRapbs =
                                $sidebarHakAkses->create_rapbs_kegiatan && $sidebarHakAkses->update_rapbs_kegiatan ??
                                false;
                            $bolehEditRapbs = $sidebarHakAkses->update_rapbs_kegiatan ?? false;
                        }
                    @endphp

                    @if ($bolehImportRapbs)
                        <div class="mb-3">
                            <a href="{{ asset('assets/templates/Template_Rapbs_Kegiatan.xlsx') }}"
                                class="btn btn-link text-primary p-0" download>
                                <i class="fas fa-download me-1"></i> Download Template Import RAPBS Kegiatan
                            </a>
                        </div>
                    @endif

                    {{-- Baris Import + Reset --}}
                    <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">

                        {{-- Form Import --}}
                        <form action="{{ route('budget-rapbs-kegiatan.import') }}" method="POST"
                            enctype="multipart/form-data">
                            @csrf
                            <div class="input-group">
                                <input type="file" name="file" class="form-control" required>
                                <button class="btn btn-success" type="submit">
                                    <i class="fas fa-upload me-1"></i> Import Excel
                                </button>
                            </div>
                        </form>


                        <form method="GET" action="{{ route('budget-rapbs-kegiatan.index') }}" class="mb-3">
                            <div class="row g-2 align-items-center">
                                <div class="col-auto">
                                    <label for="unit" class="form-label mb-0">Unit:</label>
                                </div>

                                <div class="col-auto">
                                    @if (in_array($user->role, ['admin', 'auditor']))
                                        <select name="unit" id="unit" class="form-select"
                                            onchange="this.form.submit()">
                                            <option value="all" {{ ($id_unit ?? 'all') === 'all' ? 'selected' : '' }}>
                                                Akumulasi (Semua Unit)</option>
                                            @foreach ($units as $unit)
                                                <option value="{{ $unit->id_unit }}"
                                                    {{ ($id_unit ?? '') == $unit->id_unit ? 'selected' : '' }}>
                                                    {{ $unit->kode_unit }} - {{ $unit->unit }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @elseif ($user->role === 'akuntan_unit')
                                        <select name="unit_disabled" class="form-select" disabled>
                                            <option>{{ \App\Models\Unit::find($id_unit)?->unit }}</option>
                                        </select>
                                        <input type="hidden" name="unit" value="{{ $id_unit }}">
                                    @endif

                                    <input type="hidden" name="search" value="{{ request('search') }}">
                                    <input type="hidden" name="per_page" value="{{ request('per_page', 20) }}">
                                    <input type="hidden" name="page" value="1">
                                </div>
                            </div>
                        </form>

                    </div>



                    <form method="GET" action="{{ route('budget-rapbs-kegiatan.index') }}" class="mb-3">
                        <div class="row g-2">
                            <div class="col">
                                <input type="text" name="search" class="form-control" placeholder="Cari kegiatan..."
                                    value="{{ request('search') }}" oninput="this.form.submit();">
                            </div>

                            <input type="hidden" name="unit" value="{{ $id_unit }}">
                            <input type="hidden" name="per_page" value="{{ request('per_page', 20) }}">
                            <input type="hidden" name="page" value="1">
                        </div>
                    </form>


                    <div class="table-responsive">


                        <form method="GET" action="{{ route('budget-rapbs-kegiatan.index') }}" class="mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <label for="perPage" class="mb-0">Tampilkan</label>

                                <select name="per_page" id="perPage" class="form-select form-select-sm w-auto"
                                    onchange="this.form.submit()">
                                    @foreach ([10, 25, 50, 100] as $option)
                                        <option value="{{ $option }}"
                                            {{ request('per_page', 20) == $option ? 'selected' : '' }}>
                                            {{ $option }}
                                        </option>
                                    @endforeach
                                    <option value="all" {{ request('per_page') == 'all' ? 'selected' : '' }}>Semua
                                    </option>
                                </select>

                                <span>data per halaman</span>

                                @foreach (request()->except('per_page', 'page') as $key => $value)
                                    <input type="hidden" name="{{ $key }}" value="{{ $value }}">
                                @endforeach
                                <input type="hidden" name="page" value="1">
                            </div>
                        </form>


                        {{-- Data Akun --}}
                        <table class="table text-nowrap align-middle mb-0">
                            <thead>
                                <tr class="border-2 border-bottom border-primary border-0">
                                    {{-- <th scope="col">SUB KATEGORI AKUN</th> --}}
                                    <th scope="col" class="ps-0">KODE</th>
                                    <th scope="col">KEGIATAN</th>
                                    <th scope="col">Budget RAPBS</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider">
                                @foreach ($kegiatan as $data)
                                    <tr>
                                        <td>{{ $data->kode_kegiatan }}</td>
                                        <td>{{ $data->kegiatan }}</td>
                                        <td>Rp {{ number_format($data->budget_rapbs ?? 0, 0, ',', '.') }}</td>
                                        @php
                                            $nama_unit = $units->isNotEmpty()
                                                ? $units->firstWhere('id_unit', $id_unit)
                                                : \App\Models\Unit::find($id_unit);
                                        @endphp

                                        <td>
                                            @if ($bolehImportRapbs)
                                                @if ($id_unit !== 'all')
                                                    <button type="button" class="btn btn-outline-warning"
                                                        data-bs-toggle="modal" data-bs-target="#modalEditKegiatan"
                                                        data-id_kegiatan="{{ $data->id_kegiatan }}"
                                                        data-kode="{{ $data->kode_kegiatan }}"
                                                        data-kegiatan="{{ $data->kegiatan }}"
                                                        data-budget="{{ floatval($data->budget_rapbs ?? 0) }}"
                                                        data-unit="{{ $nama_unit->unit }}" onclick="openModalEdit(this)">
                                                        Edit
                                                    </button>
                                                @endif
                                            @endif
                                        </td>

                                    </tr>
                                @endforeach


                            </tbody>
                        </table>
                        @if ($kegiatan instanceof \Illuminate\Pagination\LengthAwarePaginator)
                            <div class="mt-4">
                                {{ $kegiatan->links('pagination::bootstrap-5') }}
                            </div>
                        @endif


                        <!-- Modal Edit -->
                        <div class="modal fade" id="modalEditKegiatan" tabindex="-1"
                            aria-labelledby="modalEditKegiatanLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg">
                                <form action="{{ route('budget-rapbs-kegiatan.storeOrUpdate') }}" method="POST">
                                    @csrf

                                    <input type="hidden" name="id_kegiatan" id="edit_id_kegiatan">

                                    <input type="hidden" name="id_unit" value="{{ $id_unit }}">

                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Edit RAPBS Kegiatan</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            {{-- Hidden Field --}}
                                            <input type="hidden" name="id_unit" id="edit_id_unit">


                                            {{-- Kode Akun --}}
                                            <div class="mb-3">
                                                <label for="edit_kode_kegiatan">Kode Kegiatan</label>
                                                <input type="text" id="edit_kode_kegiatan"
                                                    class="form-control bg-light" readonly>

                                            </div>

                                            {{-- Nama Akun --}}
                                            <div class="mb-3">
                                                <label for="edit_akun" class="form-label">Kegiatan</label>
                                                <input type="text" id="edit_kegiatan" class="form-control bg-light"
                                                    readonly>
                                            </div>

                                            {{-- Nama Unit --}}
                                            <div class="mb-3">
                                                <label for="edit_nama_unit" class="form-label">Unit</label>
                                                <input type="text" id="edit_nama_unit" class="form-control bg-light"
                                                    readonly>
                                            </div>

                                            {{-- Budget --}}
                                            <div class="mb-3">
                                                <label for="edit_budget_rapbs_kegiatan" class="form-label">Budget
                                                    RAPBS</label>
                                                <input type="text" name="budget_rapbs_kegiatan"
                                                    id="edit_budget_rapbs_kegiatan" class="form-control" required>
                                            </div>

                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary"
                                                data-bs-dismiss="modal">Batal</button>
                                            <button type="submit" class="btn btn-primary">Simpan</button>

                                        </div>
                                    </div>
                                </form>
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
        function openModalEdit(btn) {
            document.getElementById('edit_id_kegiatan').value = btn.dataset.id_kegiatan;
            document.getElementById('edit_id_unit').value = '{{ $id_unit }}';
            document.getElementById('edit_kode_kegiatan').value = btn.dataset.kode;
            document.getElementById('edit_kegiatan').value = btn.dataset.kegiatan;
            document.getElementById('edit_budget_rapbs_kegiatan').value = btn.dataset.budget;
            document.getElementById('edit_nama_unit').value = btn.dataset.unit;
        }
    </script>
@endpush
