@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | Auditor</title>
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
    </style>
@endpush
@section('content')
    <div class="card">
        <div class="card-body">

            <h5 class="card-title fw-semibold mb-4">Detail Pengguna</h5>

            <div class="card">
                <div id="form-divisi" class="card-body">
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    @if (session('success'))
                        <div class="alert alert-success">
                            {{ session('success') }}
                        </div>
                    @endif

                    @if (session('error'))
                        <div class="alert alert-danger">
                            {{ session('error') }}
                        </div>
                    @endif

                    <form method="POST" {{-- action="{{ route('akuntan-divisi.update', $auditor->id_akuntan_divisi) }}"> --}} action="">
                        @csrf
                        @method('PUT')

                        {{-- PROFIL --}}
                        <div class="mb-3">
                            <label class="form-label"><strong>Profil</strong></label>
                        </div>


                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="form-label">Nama</label>
                                <input type="text" class="form-control" name="nama" value="{{ $auditor->user->nama }}"
                                    required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" value="{{ $auditor->email }}"
                                    required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Telp</label>
                                <input type="text" class="form-control" name="telp" value="{{ $auditor->telp }}"
                                    required>
                            </div>
                        </div>

                        <hr class="my-4 border-dark">

                        {{-- AKUN PENGGUNA --}}
                        <div class="mb-3">
                            <label class="form-label"><strong>Akun Pengguna</strong></label>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="form-label">Username</label>
                                <input type="text" class="form-control" name="username"
                                    value="{{ $auditor->user->username }}" required>
                            </div>
                        </div>

                        {{-- UBAH PASSWORD --}}
                        <div class="mb-3">
                            <label class="form-label"><strong>Ganti Password</strong> <span class="text-muted">(Kosongkan
                                    jika tidak ingin mengubah)</span></label>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="form-label">Password Lama</label>
                                <input type="password" class="form-control" name="old_password">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Password Baru</label>
                                <input type="password" class="form-control" name="new_password">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Konfirmasi Password Baru</label>
                                <input type="password" class="form-control" name="new_password_confirmation">
                            </div>
                        </div>

                        <!-- Tombol untuk buka modal -->
                        <button type="button" class="btn btn-link text-danger p-0" data-bs-toggle="modal"
                            data-bs-target="#modalHapusAkun">
                            Hapus Pengguna
                        </button>

                        <br>
                        <br>

                        <button type="submit" class="btn btn-primary col-12">Update</button>
                    </form>


                    <!-- Modal Konfirmasi Hapus -->
                    <div class="modal fade" id="modalHapusAkun" tabindex="-1" aria-labelledby="modalHapusAkunLabel"
                        aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <form method="POST" action="{{ route('auditor.destroy', $auditor->id_auditor) }}">
                                @csrf
                                @method('DELETE')
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="modalHapusAkunLabel">Konfirmasi Hapus</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                                            aria-label="Tutup"></button>
                                    </div>
                                    <div class="modal-body">
                                        <p>Apakah Anda yakin ingin menghapus pengguna ini?</p>
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
@endsection
