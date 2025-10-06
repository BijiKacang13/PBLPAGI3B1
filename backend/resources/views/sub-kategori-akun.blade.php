@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | Sub Kategori Akun</title>
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


                    <h5 class="card-title">Sub Kategori Akun</h5><br>
                    <div class="table-responsive">

                        <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#modalTambahKategori">
                            Tambah Sub Kategori Akun
                        </button>


                        <!-- Modal Tambah -->
                        <div class="modal fade" id="modalTambahKategori" tabindex="-1"
                            aria-labelledby="modalTambahKategoriLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered" style="max-width: 800px;">
                                <form method="post" action="{{ route('sub-kategori-akun.store') }}">
                                    @csrf
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Tambah Sub Kategori Akun</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="mb-3">
                                                <label for="id_kategori_akun" class="form-label">Kategori
                                                    Akun</label>
                                                <select class="form-select" name="id_kategori_akun" required>
                                                    <option value="" disabled selected>Pilih Kategori
                                                        Akun</option>
                                                    @foreach ($kategoriakun as $kategori)
                                                        <option value="{{ $kategori->id_kategori_akun }}">
                                                            {{ $kategori->kode_kategori_akun }} -
                                                            {{ $kategori->kategori_akun }}
                                                        </option>
                                                    @endforeach
                                                </select>
                                            </div>

                                            <div class="mb-3">
                                                <label for="kode_sub_kategori_akun" class="form-label">Kode
                                                    Sub Kategori</label>
                                                <input type="text" name="kode_sub_kategori_akun" class="form-control"
                                                    required>
                                            </div>

                                            <div class="mb-3">
                                                <label for="sub_kategori_akun" class="form-label">Sub
                                                    Kategori Akun</label>
                                                <input type="text" name="sub_kategori_akun" class="form-control"
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



                        <table class="table text-nowrap align-middle mb-0">
                            <thead>
                                <tr class="border-2 border-bottom border-primary border-0">
                                    <th scope="col" class="ps-0">KODE</th>
                                    <th scope="col">SUB KATEGORI AKUN</th>
                                    <th scope="col">KATEGORI AKUN</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider">
                                @foreach ($subkategoriakun as $data)
                                    <tr>
                                        <th scope="row" class="ps-0 fw-medium">
                                            <span
                                                class="table-link1 text-truncate d-block">{{ $data->kode_sub_kategori_akun }}</span>
                                        </th>
                                        <td>
                                            <a href="javascript:void(0)"
                                                class="link-primary text-dark fw-medium d-block">{{ $data->sub_kategori_akun }}</a>
                                        </td>
                                        <td>
                                            <a href="javascript:void(0)"
                                                class="link-primary text-dark fw-medium d-block">{{ $data->kategori_akun->kategori_akun }}</a>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-outline-warning m-1"
                                                data-bs-toggle="modal" data-bs-target="#modalEditSubKategori"
                                                onclick="setEditSubKategori('{{ $data->id_sub_kategori_akun }}', '{{ $data->kode_sub_kategori_akun }}', '{{ $data->sub_kategori_akun }}', '{{ $data->id_kategori_akun }}')">
                                                Edit
                                            </button>


                                            <button type="button" class="btn btn-outline-danger m-1" data-bs-toggle="modal"
                                                data-bs-target="#modalHapusSubKategori"
                                                onclick="setHapusSubKategori('{{ $data->id_sub_kategori_akun }}')">
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                @endforeach


                            </tbody>
                        </table>



                        <!-- Modal Edit (satu kali saja di luar loop) -->
                        <div class="modal fade" id="modalEditSubKategori" tabindex="-1"
                            aria-labelledby="modalEditSubKategoriLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg">
                                <form action="{{ route('sub-kategori-akun.update') }}" method="POST">
                                    @csrf
                                    @method('PUT')

                                    <input type="hidden" name="id_sub_kategori_akun" id="edit_id_sub_kategori">

                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Edit Sub Kategori Akun</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="mb-3">
                                                <label for="edit_id_kategori_akun" class="form-label">Kategori
                                                    Akun</label>
                                                <select name="id_kategori_akun" id="edit_id_kategori_akun"
                                                    class="form-select" required>
                                                    @foreach ($kategoriakun as $kategori)
                                                        <option value="{{ $kategori->id_kategori_akun }}">
                                                            {{ $kategori->kategori_akun }}</option>
                                                    @endforeach
                                                </select>
                                            </div>

                                            <div class="mb-3">
                                                <label for="edit_kode_sub_kategori_akun" class="form-label">Kode Sub
                                                    Kategori
                                                    Akun</label>
                                                <input type="text" name="kode_sub_kategori_akun"
                                                    id="edit_kode_sub_kategori_akun" class="form-control" required>
                                            </div>

                                            <div class="mb-3">
                                                <label for="edit_sub_kategori_akun" class="form-label">Sub
                                                    Kategori Akun</label>
                                                <input type="text" name="sub_kategori_akun"
                                                    id="edit_sub_kategori_akun" class="form-control" required>
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
                        <div class="modal fade" id="modalHapusSubKategori" tabindex="-1"
                            aria-labelledby="modalHapusSubKategoriLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                                <form action="{{ route('sub-kategori-akun.destroy') }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <input type="hidden" name="id_sub_kategori_akun" id="hapus_id_sub_kategori">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Konfirmasi Hapus</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <p>Apakah Anda yakin ingin menghapus kategori akun ini?</p>
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
            <p class="mb-0 fs-4">Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025</p>

        </div>
    </div>
@endsection

@push('scripts')
    <script>
        function setEditSubKategori(id, kode, subKategori, kategoriId) {
            document.getElementById('edit_id_sub_kategori').value = id;
            document.getElementById('edit_kode_sub_kategori_akun').value = kode;
            document.getElementById('edit_sub_kategori_akun').value = subKategori;
            document.getElementById('edit_id_kategori_akun').value = kategoriId;
        }

        function setHapusSubKategori(id) {
            document.getElementById('hapus_id_sub_kategori').value = id;
        }
    </script>
    <script>
        setTimeout(function() {
            let alertIds = ['success-alert', 'error-alert', 'validation-alert'];
            alertIds.forEach(function(id) {
                let el = document.getElementById(id);
                if (el) {
                    let alert = bootstrap.Alert.getOrCreateInstance(el);
                    alert.close();
                }
            });
        }, 4000); // 4 detik
    </script>
@endpush
