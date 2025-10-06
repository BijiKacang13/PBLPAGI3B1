@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | kegiatan</title>
    <style>
        .modal-dialog-centered {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: auto;
            margin-left: auto;
        }
    </style>
@endpush


@section('content')
    <div class="row">

        <div class="col-lg-12">
            <div class="card">
                <div class="card-body">
                    @if (session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert" id="success-alert">
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
                        </div>
                    @endif

                    @if (session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert" id="error-alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
                        </div>
                    @endif

                    @if ($errors->any())
                        <div class="alert alert-danger alert-dismissible fade show" role="alert" id="validation-alert">
                            <strong>Terjadi kesalahan:</strong>
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
                        </div>
                    @endif
                    <h5 class="card-title">Kegiatan</h5><br>

                    {{-- Link download template --}}
                    <div class="mb-3">
                        <a href="{{ asset('assets/templates/Template_Kegiatan.xlsx') }}"
                            class="btn btn-link text-primary p-0" download>
                            <i class="fas fa-download me-1"></i> Download Template Import Kegiatan
                        </a>
                    </div>

                    {{-- Baris Import + Reset --}}
                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        {{-- Form Import --}}
                        <form action="{{ route('kegiatan.import') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <div class="input-group">
                                <input type="file" name="file" class="form-control" required>
                                <button class="btn btn-success" type="submit">
                                    <i class="fas fa-upload me-1"></i> Import Excel
                                </button>
                            </div>
                        </form>

                        <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#modalTambahKategori">
                            Tambah Kegiatan
                        </button>


                    </div>




                    <!-- Modal Reset Data Kegiatan -->
                    <div class="modal fade" id="modalResetKegiatan" tabindex="-1" aria-labelledby="modalResetKegiatanLabel"
                        aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">

                        </div>
                    </div>


                    <br><br>

                    <div class="table-responsive">





                        <!-- Modal Tambah -->
                        <div class="modal fade" id="modalTambahKategori" tabindex="-1"
                            aria-labelledby="modalTambahKategoriLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered" style="max-width: 800px;">
                                <form method="post" action="{{ route('kegiatan.store') }}">
                                    @csrf
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Tambah kegiatan</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="mb-3">
                                                <label for="kode_kegiatan" class="form-label">Kode
                                                    kegiatan</label>
                                                <input type="text" name="kode_kegiatan" class="form-control" required>
                                            </div>

                                            <div class="mb-3">
                                                <label for="kegiatan" class="form-label">Kegiatan</label>
                                                <input type="text" name="kegiatan" class="form-control" required>
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

                        {{-- Data kegiatan --}}
                        <table class="table text-nowrap align-middle mb-0">
                            <thead>
                                <tr class="border-2 border-bottom border-primary border-0">
                                    <th scope="col" class="ps-0">KODE</th>
                                    <th scope="col">KEGIATAN</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider">
                                @foreach ($kegiatan as $data)
                                    <tr>
                                        <td>
                                            <a href="javascript:void(0)"
                                                class="link-primary text-dark fw-medium d-block">{{ $data->kode_kegiatan }}</a>
                                        </td>
                                        <td>
                                            <a href="javascript:void(0)"
                                                class="link-primary text-dark fw-medium d-block">{{ $data->kegiatan }}</a>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-outline-warning m-1"
                                                data-bs-toggle="modal" data-bs-target="#modalEditkegiatan"
                                                onclick="setEditkegiatan(
                                                                {{ $data->id_kegiatan }},
                                                                '{{ $data->kode_kegiatan }}',
                                                                '{{ $data->kegiatan }}',
                                                            )">
                                                Edit
                                            </button>



                                            <button type="button" class="btn btn-outline-danger m-1"
                                                data-bs-toggle="modal" data-bs-target="#modalHapuskegiatan"
                                                onclick="setHapuskegiatan('{{ $data->id_kegiatan }}')">
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                @endforeach

                            </tbody>
                        </table>


                        <!-- Modal Edit -->
                        <div class="modal fade" id="modalEditkegiatan" tabindex="-1"
                            aria-labelledby="modalEditkegiatanLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg">
                                <form action="{{ route('kegiatan.update') }}" method="POST">
                                    @csrf
                                    @method('PUT')

                                    <input type="hidden" name="id_kegiatan" id="edit_id_kegiatan">

                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Edit kegiatan</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">

                                            <div class="mb-3">
                                                <label for="edit_kode_kegiatan" class="form-label">Kode
                                                    Kegiatan</label>
                                                <input type="text" name="kode_kegiatan" id="edit_kode_kegiatan"
                                                    class="form-control" required>
                                            </div>

                                            <div class="mb-3">
                                                <label for="edit_kegiatan" class="form-label">Kegiatan</label>
                                                <input type="text" name="kegiatan" id="edit_kegiatan"
                                                    class="form-control" required>
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

                        <!-- Modal Konfirmasi Hapus -->
                        <div class="modal fade" id="modalHapuskegiatan" tabindex="-1"
                            aria-labelledby="modalHapuskegiatanLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                                <form action="{{ route('kegiatan.destroy') }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <input type="hidden" name="id_kegiatan" id="hapus_id_kegiatan">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Konfirmasi Hapus</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <p>Apakah Anda yakin ingin menghapus kegiatan ini?</p>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary"
                                                data-bs-dismiss="modal">Batal</button>
                                            <button type="submit" class="btn btn-danger">Hapus</button>

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
            <p class="mb-0 fs-4">Sistem Informasi kegiatantansi Yayasan Darussalam Batam | 2025</p>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const input = document.getElementById('konfirmasiReset');
            const tombol = document.getElementById('btnKonfirmasiReset');
            const kode = 'HAPUS_' + kodeUnit;

            input.addEventListener('input', function() {
                tombol.disabled = input.value !== kode;
            });
        });
    </script>

    <script>
        function setEditkegiatan(id_kegiatan, kode_kegiatan, kegiatan, budget_rapbs) {
            document.getElementById('edit_id_kegiatan').value = id_kegiatan;
            document.getElementById('edit_kode_kegiatan').value = kode_kegiatan;
            document.getElementById('edit_kegiatan').value = kegiatan;
            document.getElementById('edit_budget_rapbs').value = budget_rapbs;
        }

        function setHapuskegiatan(id) {
            document.getElementById('hapus_id_kegiatan').value = id;
        }
    </script>
@endpush
