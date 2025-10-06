@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | CALK</title> {{-- Ubah judul agar lebih generik, tidak hanya Auditor --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">

    <style>
        html,
        body,
        .page-wrapper,
        .body-wrapper {
            height: 100%;
            min-height: 100vh;
        }

        .body-wrapper {
            display: flex;
            flex-direction: column;
        }

        .container-fluid {
            flex: 1;
        }

        .modal-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) !important;
            z-index: 1055;
        }
    </style>

    <style>
        .card-hover:hover {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            transform: scale(1.01);
            transition: all 0.2s ease-in-out;
        }
    </style>

    <style>
        .drag-handle {
            cursor: move;
        }
    </style>
@endpush

@section('content')
    <div class="row">
        <div class="col-lg-12">
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body">

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


                    <h5 class="card-title mb-4">Catatan Atas Laporan Keuangan</h5>
                    {{-- Tombol Tambah CALK hanya untuk admin --}}
                    @if ($role == 'admin')
                        <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#modalTambahKategori">
                            Tambah CALK
                        </button>
                    @endif

                    {{-- Modal Tambah --}}
                    {{-- Modal ini juga hanya perlu ada jika role adalah admin --}}
                    @if ($role == 'admin')
                        <div class="modal fade" id="modalTambahKategori" tabindex="-1"
                            aria-labelledby="modalTambahKategoriLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered" style="max-width: 800px;">
                                <form method="POST" action="{{ route('calk.store') }}" enctype="multipart/form-data">
                                    @csrf
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Tambah CALK</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="mb-3">
                                                <label for="keterangan" class="form-label">Keterangan</label>
                                                <input type="text" name="keterangan" id="keterangan" class="form-control"
                                                    required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="file" class="form-label">File</label>
                                                <input type="file" name="file" id="file" class="form-control"
                                                    required>
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
                    @endif

                    {{-- Search (tetap ada untuk semua role yang bisa melihat CALK) --}}
                    <form id="searchForm" action="" method="GET" class="mb-4">
                        <div class="row g-2">
                            <div class="col-md-12">
                                <input type="text" name="search" class="form-control" placeholder="Cari..."
                                    value="{{ request('search') }}"
                                    oninput="document.getElementById('searchForm').submit();">
                            </div>
                        </div>
                    </form>

                    {{-- Accordion CALK --}}
                    {{-- Tambahkan kondisi untuk sortable-url dan drag-handle --}}
                    <div class="accordion" id="accordionCALK">
                        @foreach ($calk as $data)
                            <div class="accordion-item mb-2" data-id="{{ $data->id_calk }}">
                                <h2 class="accordion-header d-flex align-items-center gap-2 px-3"
                                    id="heading{{ $data->id_calk }}">
                                    {{-- Ikon drag hanya untuk admin --}}
                                    @if ($role == 'admin')
                                        <span class="drag-handle text-muted">
                                            <i class="bi bi-list fs-5"></i>
                                        </span>
                                    @endif

                                    {{-- Judul CALK --}}
                                    <button class="accordion-button collapsed flex-grow-1 text-start" type="button"
                                        data-bs-toggle="collapse" data-bs-target="#collapse{{ $data->id_calk }}"
                                        aria-expanded="false" aria-controls="collapse{{ $data->id_calk }}">
                                        {{ $loop->iteration }}. {{ $data->keterangan }}
                                    </button>

                                    {{-- Tombol Edit hanya untuk admin --}}
                                    @if ($role == 'admin')
                                        <button class="btn btn-sm btn-light" data-bs-toggle="modal"
                                            data-bs-target="#modalEditCalk{{ $data->id_calk }}">
                                            <i class="bi bi-pencil-square"></i>
                                        </button>
                                    @endif
                                </h2>

                                <div id="collapse{{ $data->id_calk }}" class="accordion-collapse collapse"
                                    aria-labelledby="heading{{ $data->id_calk }}" data-bs-parent="#accordionCALK">
                                    <div class="accordion-body">
                                        <a href="{{ asset('storage/' . $data->file) }}"
                                            class="btn btn-outline-primary btn-sm" target="_blank">
                                            <i class="bi bi-eye"></i> Lihat File
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {{-- Modal Edit dan Hapus hanya untuk admin --}}
                            @if ($role == 'admin')
                                <div class="modal fade" id="modalEditCalk{{ $data->id_calk }}" tabindex="-1"
                                    aria-labelledby="modalEditLabel{{ $data->id_calk }}" aria-hidden="true">
                                    <div class="modal-dialog modal-dialog-centered" style="max-width: 800px;">
                                        <div class="modal-content">
                                            <form method="POST" action="{{ route('calk.update', $data->id_calk) }}"
                                                enctype="multipart/form-data">
                                                @csrf
                                                @method('PUT')
                                                <div class="modal-header">
                                                    <h5 class="modal-title">Edit CALK</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                        aria-label="Tutup"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="mb-3">
                                                        <label for="keterangan" class="form-label">Keterangan</label>
                                                        <input type="text" name="keterangan" class="form-control"
                                                            value="{{ $data->keterangan }}" required>
                                                    </div>

                                                    <div class="mb-3">
                                                        <label for="file" class="form-label">Ganti File
                                                            (Opsional)
                                                        </label>
                                                        <input type="file" name="file" class="form-control">
                                                        <small class="text-muted">Biarkan kosong jika tidak ingin mengganti
                                                            file.</small>
                                                    </div>
                                                </div>
                                                <div class="modal-footer justify-content-between">
                                                    <div>
                                                        <button type="button" class="btn btn-secondary"
                                                            data-bs-dismiss="modal">Batal</button>
                                                        <button type="submit" class="btn btn-primary">Simpan</button>

                                                    </div>
                                                </div>
                                            </form>

                                            <form action="{{ route('calk.destroy', $data->id_calk) }}" method="POST"
                                                onsubmit="return confirm('Yakin ingin menghapus CALK ini?');"
                                                class="px-3 pb-3 text-start">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit"
                                                    class="btn btn-sm text-danger border-0 bg-transparent p-0">
                                                    <i class="bi bi-trash"></i> Hapus CALK
                                                </button>

                                            </form>
                                        </div>
                                    </div>
                                </div>
                            @endif
                        @endforeach
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
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>

@endpush
