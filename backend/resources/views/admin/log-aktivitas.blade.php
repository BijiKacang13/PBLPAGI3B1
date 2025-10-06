@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | Log Aktivitas</title>

    <style>
        html,
        body {
            height: 100%;
            margin: 0;
            padding: 0;
            /* background-color: #f0f0f0; */
            /* warna abu-abu */
        }

        .page-wrapper {
            min-height: 100vh;
            /* background-color: #f0f0f0; */
            /* warna abu-abu */
            display: flex;
            flex-direction: column;
        }

        .body-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .container-fluid {
            flex: 1;
        }
    </style>

    <style>
        .card-hover:hover {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            transform: scale(1.01);
            transition: all 0.2s ease-in-out;
        }
    </style>
@endpush

@section('content')
    <div class="row">
        <div class="col-lg-12">
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body">
                    <h5 class="card-title mb-4">Log Aktivitas</h5>

                    <form action="" method="GET" class="mb-4" id="filter-form">
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <label>Dari Tanggal </label>
                                <input type="date" name="start_date" class="form-control"
                                    value="{{ request('start_date') ?? \Carbon\Carbon::now()->startOfMonth()->format('Y-m-d') }}"
                                    onchange="submitFilter()">
                            </div>

                            <div class="col-md-3">
                                <label>Sampai Tanggal </label>
                                <input type="date" name="end_date" class="form-control"
                                    value="{{ request('end_date') ?? \Carbon\Carbon::now()->endOfMonth()->format('Y-m-d') }}"
                                    onchange="submitFilter()">
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-3">
                                <label>Dari Jam </label>
                                <input type="time" name="start_time" class="form-control"
                                    value="{{ request('start_time') }}" onchange="submitFilter()">
                            </div>
                            <div class="col-md-3">
                                <label>Sampai Jam </label>
                                <input type="time" name="end_time" class="form-control" value="{{ request('end_time') }}"
                                    onchange="submitFilter()">
                            </div>

                            <div class="col-md-6">
                                <label>Cari </label>
                                <div class="input-group">
                                    <input type="text" class="form-control" name="search" placeholder="Cari apa saja..."
                                        value="{{ request('search') }}">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="ti ti-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <a href="{{ route('log-aktivitas.index') }}" class="btn btn-secondary">
                                    <i class="ti ti-refresh"></i> Reset
                                </a>
                            </div>
                        </div>
                    </form>

                    <script>
                        function submitFilter() {
                            document.getElementById('filter-form').submit();
                        }
                    </script>





                    <table class="table table-bordered table-striped">
                        <thead class="table-light">
                            <tr>
                                <th>No</th>
                                <th>Waktu</th>
                                <th>Username</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>

                            @foreach ($log_aktivitas as $data)
                                <tr>
                                    <td>{{ ($log_aktivitas->currentPage() - 1) * $log_aktivitas->perPage() + $loop->iteration }}
                                    </td>
                                    <td>{{ \Carbon\Carbon::parse($data->created_at)->translatedFormat('d F Y H:i') }}
                                    </td>
                                    <td>{{ $data->user->username }}</td>
                                    <td>{{ $data->keterangan }}</td>
                                </tr>
                            @endforeach


                        </tbody>
                    </table>
                    <div class="mt-3">
                        {{ $log_aktivitas->links('pagination::bootstrap-5') }}
                    </div>


                </div>
            </div>
        </div>
        <div class="py-6 px-6 text-center">
            <p class="mb-0 fs-4">Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025</p>

        </div>
    </div>
@endsection
