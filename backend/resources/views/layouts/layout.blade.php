<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" type="image/png" href="../assets/images/logos/YDB_PNG.png" />
    <link rel="stylesheet" href="../assets/css/styles.min.css" />
    <link rel="stylesheet" href="../css/sidebar.css" />

    {{-- Style --}}
    @stack('styles')
</head>

<body>

    @php
        $user = Auth::user();
    @endphp

    {{-- Body Wrapper --}}
    <div class="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
        data-sidebar-position="fixed" data-header-position="fixed">
        
        {{-- Sidebar --}}
        <x-sidebar :role="$sidebarRole" :hak_akses="$sidebarHakAkses" />

        <!--  Main wrapper -->
        <div class="body-wrapper">

            {{-- Header  --}}
            <x-header/>

            {{-- Content --}}
            <div class="container-fluid">
                @yield('content')
            </div>

        </div>
        <script src="../assets/libs/jquery/dist/jquery.min.js"></script>
        <script src="../assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
        <script src="../assets/libs/apexcharts/dist/apexcharts.min.js"></script>
        <script src="../assets/libs/simplebar/dist/simplebar.js"></script>
        <script src="../assets/js/sidebarmenu.js"></script>
        <script src="../assets/js/app.min.js"></script>
        <script src="../assets/js/dashboard.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"></script>

        <script src="../js/sidebar.js"></script>

        {{-- Script --}}
        @stack('scripts')


</body>

</html>
