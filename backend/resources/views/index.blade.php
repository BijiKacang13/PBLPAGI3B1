@extends('layouts.layout')

@push('styles')
    <title>SIA Yayasan Darussalam | Dashboard</title>

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
    </style>
@endpush

@section('content')
    <div class="row">
        <div class="col-lg-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Selamat datang , {{ $user->nama }}</h5>
                </div>


                <div class="container mt-4">
                    <p class="card-text ms-4">Transaksi dalam 30 hari terakhir.</p>
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
