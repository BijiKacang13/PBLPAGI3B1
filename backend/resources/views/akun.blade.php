@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | Akun</title>
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
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
                        </div>
                    @endif

                    @if (session('import_errors'))
                        <div class="alert alert-warning alert-dismissible fade show mt-2" role="alert">
                            <strong>Beberapa baris gagal diimpor:</strong>
                            <ul class="mb-0">
                                @foreach (session('import_errors') as $err)
                                    <li>{{ $err }}</li>
                                @endforeach
                            </ul>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
                        </div>
                    @endif
                    <h5 class="card-title">Akun</h5><br>


                    <div class="mb-3">
                        <a href="{{ asset('assets/templates/Template_Akun.xlsx') }}" class="btn btn-link text-primary p-0"
                            download>
                            <i class="fas fa-download me-1"></i> Download Template Import Akun
                        </a>
                    </div>



                    <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                        {{-- Form Import --}}
                        <form action="{{ route('akun.import') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <div class="input-group">
                                <input type="file" name="file" class="form-control" required>
                                <button class="btn btn-success" type="submit">
                                    <i class="fas fa-upload me-1"></i> Import Excel
                                </button>
                            </div>
                        </form>

                        {{-- Tombol Tambah Akun --}}
                        <div>
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalTambahKategori">
                                <i class="fas fa-plus me-1"></i> Tambah Akun
                            </button>
                        </div>
                    </div>


                    <!-- Modal Tambah -->
                    <div class="modal fade" id="modalTambahKategori" tabindex="-1"
                        aria-labelledby="modalTambahKategoriLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered" style="max-width: 800px;">
                            <form method="post" action="{{ route('akun.store') }}">
                                @csrf
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">Tambah Akun</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                                            aria-label="Tutup"></button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="mb-3">
                                            <label for="id_sub_kategori_akun" class="form-label">Sub
                                                Kategori
                                                Akun</label>
                                            <select class="form-select" name="id_sub_kategori_akun" required>
                                                <option value="" disabled selected>Pilih Kategori
                                                    Akun</option>
                                                @foreach ($subkategoriakun as $data)
                                                    <option value="{{ $data->id_sub_kategori_akun }}">
                                                        {{ $data->kode_sub_kategori_akun }} -
                                                        {{ $data->sub_kategori_akun }}
                                                    </option>
                                                @endforeach
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label for="kode_akun" class="form-label">Kode
                                                Akun</label>
                                            <input type="text" name="kode_akun" class="form-control" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="akun" class="form-label">Akun</label>
                                            <input type="text" name="akun" class="form-control" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="saldo_awal_debit" class="form-label">Saldo Awal Debit</label>
                                            <div class="input-group">
                                                <span class="input-group-text">Rp</span>
                                                <input type="text" name="saldo_awal_debit" id="saldo_awal_debit"
                                                    class="form-control format-rupiah" oninput="formatRupiah(this)"
                                                    required>
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="saldo_awal_kredit" class="form-label">Saldo Awal
                                                Kredit</label>
                                            <div class="input-group">
                                                <span class="input-group-text">Rp</span>
                                                <input type="text" name="saldo_awal_kredit" id="saldo_awal_kredit"
                                                    class="form-control format-rupiah" oninput="formatRupiah(this)"
                                                    required>
                                            </div>
                                        </div>


                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-light"
                                            data-bs-dismiss="modal">Batal</button>
                                        <button type="submit" class="btn btn-primary">Simpan</button>

                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <br><br>
                    <form id="searchForm" action="" method="GET" class="mb-4">
                        <div class="row g-2">
                            <div class="col">
                                <input type="text" name="search" class="form-control" placeholder="Cari..."
                                    value="{{ request('search') }}"
                                    oninput="document.getElementById('searchForm').submit();">
                            </div>

                            {{-- Kirim juga per_page agar tidak reset saat search --}}
                            <input type="hidden" name="per_page" value="{{ request('per_page', 20) }}">
                        </div>
                    </form>


                    <div class="table-responsive">
                        <form method="GET" class="mb-3">
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
                            </div>
                        </form>


                        {{-- Data Akun --}}
                        <table class="table text-nowrap align-middle mb-0">
                            <thead>
                                <tr class="border-2 border-bottom border-primary border-0">
                                    {{-- <th scope="col">SUB KATEGORI AKUN</th> --}}
                                    <th scope="col" class="ps-0">KODE</th>
                                    <th scope="col">AKUN</th>
                                    <th scope="col">Saldo Awal Debit</th>
                                    <th scope="col">Saldo Awal Kredit</th>
                                    {{-- <th scope="col">Budget RAPBS</th> --}}
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider">
                                @foreach ($akun as $data)
                                    <tr>
                                        <th scope="row" class="ps-0 fw-medium">
                                            <span class="table-link1 text-truncate d-block">{{ $data->kode_akun }}</span>
                                        </th>
                                        <td>
                                            <a href="javascript:void(0)"
                                                class="link-primary text-dark fw-medium d-block">{{ $data->akun }}</a>
                                        </td>
                                        <td>
                                            <a href="javascript:void(0)" class="link-primary text-dark fw-medium d-block">

                                                {{ $data->saldo_awal_debit < 0 ? '(' . number_format(abs($data->saldo_awal_debit), 0, ',', '.') . ')' : number_format($data->saldo_awal_debit, 0, ',', '.') }}

                                            </a>
                                        </td>
                                        <td>
                                            <a href="javascript:void(0)" class="link-primary text-dark fw-medium d-block">

                                                {{ $data->saldo_awal_kredit < 0 ? '(' . number_format(abs($data->saldo_awal_kredit), 0, ',', '.') . ')' : number_format($data->saldo_awal_kredit, 0, ',', '.') }}

                                            </a>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-outline-warning" data-bs-toggle="modal"
                                                data-bs-target="#modalEditAkun" onclick="setEditAkun(this)"
                                                data-id_akun="{{ $data->id_akun }}"
                                                data-id_sub_kategori_akun="{{ $data->id_sub_kategori_akun }}"
                                                data-kode_akun="{{ $data->kode_akun }}" data-akun="{{ $data->akun }}"
                                                data-saldo_awal_debit="{{ $data->saldo_awal_debit }}"
                                                data-saldo_awal_kredit="{{ $data->saldo_awal_kredit }}">
                                                Edit
                                            </button>






                                            <button type="button" class="btn btn-outline-danger m-1"
                                                data-bs-toggle="modal" data-bs-target="#modalHapusAkun"
                                                onclick="setHapusAkun('{{ $data->id_akun }}')">
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                @endforeach

                            </tbody>
                        </table>
                        @if ($akun instanceof \Illuminate\Pagination\LengthAwarePaginator)
                            <div class="mt-4">
                                {{ $akun->links('pagination::bootstrap-5') }}
                            </div>
                        @endif


                        <!-- Modal Edit -->
                        <div class="modal fade" id="modalEditAkun" tabindex="-1" aria-labelledby="modalEditAkunLabel"
                            aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg">
                                <form action="{{ route('akun.update') }}" method="POST">
                                    @csrf
                                    @method('PUT')

                                    <input type="hidden" name="id_akun" id="edit_id_akun">

                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Edit Akun</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="mb-3">
                                                <label for="edit_id_sub_kategori_akun" class="form-label">Sub Kategori
                                                    Akun</label>
                                                <select name="id_sub_kategori_akun" id="edit_id_sub_kategori_akun"
                                                    class="form-select" required>
                                                    @foreach ($subkategoriakun as $subkategori)
                                                        <option value="{{ $subkategori->id_sub_kategori_akun }}">
                                                            {{ $subkategori->sub_kategori_akun }}
                                                        </option>
                                                    @endforeach
                                                </select>
                                            </div>

                                            <div class="mb-3">
                                                <label for="edit_kode_akun" class="form-label">Kode
                                                    Akun</label>
                                                <input type="text" name="kode_akun" id="edit_kode_akun"
                                                    class="form-control" required>
                                            </div>

                                            <div class="mb-3">
                                                <label for="edit_akun" class="form-label">Akun</label>
                                                <input type="text" name="akun" id="edit_akun" class="form-control"
                                                    required>
                                            </div>

                                            <div class="mb-3">
                                                <label for="edit_saldo_awal_debit" class="form-label">Saldo Awal
                                                    Debit</label>
                                                <div class="input-group">
                                                    <span class="input-group-text">Rp</span>
                                                    <input type="text" name="saldo_awal_debit"
                                                        id="edit_saldo_awal_debit" class="form-control format-rupiah"
                                                        oninput="formatRupiah(this)" required>
                                                </div>
                                            </div>

                                            <div class="mb-3">
                                                <label for="edit_saldo_awal_kredit" class="form-label">Saldo Awal
                                                    Kredit</label>
                                                <div class="input-group">
                                                    <span class="input-group-text">Rp</span>
                                                    <input type="text" name="saldo_awal_kredit"
                                                        id="edit_saldo_awal_kredit" class="form-control format-rupiah"
                                                        oninput="formatRupiah(this)" required>
                                                </div>
                                            </div>



                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-light"
                                                data-bs-dismiss="modal">Batal</button>
                                            <button type="submit" class="btn btn-primary">Simpan</button>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Modal Konfirmasi Hapus -->
                        <div class="modal fade" id="modalHapusAkun" tabindex="-1" aria-labelledby="modalHapusAkunLabel"
                            aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                                <form action="{{ route('akun.destroy') }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <input type="hidden" name="id_akun" id="hapus_id_akun">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Konfirmasi Hapus</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Tutup"></button>
                                        </div>
                                        <div class="modal-body">
                                            <p>Apakah Anda yakin ingin menghapus akun ini?</p>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-light"
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
        function formatRupiah(input) {
            let value = input.value.replace(/[^,\d]/g, '');
            let parts = value.split(',');
            let number = parts[0];
            let formatted = '';
            let sisa = number.length % 3;
            let ribuan = number.substr(sisa).match(/\d{3}/g);

            if (sisa) {
                formatted = number.substr(0, sisa);
            }

            if (ribuan) {
                formatted += (sisa ? '.' : '') + ribuan.join('.');
            }

            if (parts[1]) {
                formatted += ',' + parts[1];
            }

            input.value = formatted;
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


    <script>
        function setEditAkun(button) {
            const btn = button.dataset;
            console.log("DATA BUTTON:", btn); // debug

            document.getElementById('edit_id_akun').value = btn.id_akun;
            document.getElementById('edit_kode_akun').value = btn.kode_akun;
            document.getElementById('edit_akun').value = btn.akun;
            document.getElementById('edit_saldo_awal_debit').value = numberToRupiah(btn.saldo_awal_debit);
            document.getElementById('edit_saldo_awal_kredit').value = numberToRupiah(btn.saldo_awal_kredit);

            const select = document.getElementById('edit_id_sub_kategori_akun');
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value == btn.id_sub_kategori_akun) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }




        function setHapusAkun(id) {
            document.getElementById('hapus_id_akun').value = id;
        }


        function numberToRupiah(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
    </script>
@endpush
