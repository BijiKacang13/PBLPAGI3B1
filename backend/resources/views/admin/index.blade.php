@extends('layouts.layout')

@push('styles')
    <title>SIA Yayasan Darussalam | Akun</title>

    <style>
        html,
        body {
            height: 100%;
            margin: 0;
            background-color: #f8f9fa; /* latar abu-abu */
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
                    <h5 class="card-title">Selamat datang, {{ $user->nama }}</h5>
                </div>

                <div class="container mt-4">
                    <p class="card-text ms-4">Transaksi dalam 30 hari terakhir.</p>

                    <form method="GET" action="{{ route('admin-dashboard.index') }}" class="mb-3 ms-4">
                        <div class="row g-2 align-items-center">
                            <div class="col-auto">
                                <label for="unit" class="form-label mb-0">Filter Unit:</label>
                            </div>
                            <div class="col-auto">
                                <select name="unit" id="unit" class="form-select" onchange="this.form.submit()">
                                    <option value="all" {{ request('unit') === 'all' ? 'selected' : '' }}>Semua Unit
                                    </option>
                                    @foreach ($units as $unit)
                                        <option value="{{ $unit->id_unit }}"
                                            {{ request('unit') == $unit->id_unit ? 'selected' : '' }}>
                                            {{ $unit->kode_unit }} - {{ $unit->unit }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </form>

                    <canvas id="transaksiChart" height="100"></canvas>
                </div>

            </div>
        </div>
    </div>

    <div class="py-6 px-6 text-center">
        <p class="mb-0 fs-4">Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025</p>
    </div>

    {{-- Chart.js CDN --}}
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        const ctx = document.getElementById('transaksiChart').getContext('2d');
        const transaksiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: @json($labels),
                datasets: [{
                    label: 'Jumlah Transaksi',
                    data: @json($data),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    </script>
@endsection
