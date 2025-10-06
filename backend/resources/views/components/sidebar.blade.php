<aside id="sidebar" class="left-sidebar">
    <!-- Sidebar scroll-->
    <div>
        <div class="brand-logo d-flex align-items-center justify-content-between">
            <a href="./index.html" class="text-nowrap logo-img">
                <img src="../assets/images/logos/SIAD.png" alt="" width="230" />
            </a>

            <!-- Mobile close button - keep the original one -->
            <div class="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
                <i class="ti ti-x fs-8"></i>
            </div>

        </div>

        @php
            $role = Auth::user()->role;
        @endphp


        <!-- Sidebar navigation-->
        <nav class="sidebar-nav scroll-sidebar mt-3" data-simplebar="">
            <ul id="sidebarnav">

                <li class="sidebar-item">
                    <a href="/"
                        class="sidebar-link fw-semibold" style="border-radius: 8px !important;">
                        <span class="hide-menu">Beranda</span>
                    </a>

                </li>


                @if ($role == 'admin')
                    <li class="sidebar-item">
                        <a class="sidebar-link has-arrow d-flex align-items-center fw-semibold "
                            href="javascript:void(0)" aria-expanded="false"
                            style="padding: 10px 16px; background-color: #cacaca49; color: #333; border-radius: 6px;">
                            <span class="hide-menu fs-3">Akun Pengguna</span>
                            <iconify-icon icon="mdi:chevron-down" class="ms-auto toggle-icon"
                                data-icon-down="mdi:chevron-down" data-icon-up="mdi:chevron-up"></iconify-icon>
                        </a>
                        <ul class="collapse first-level">
                            <li class="sidebar-item">
                                <a href="/admin/buat-akun" class="sidebar-link">
                                    <span class="hide-menu">Tambah Pengguna</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="/akuntan-unit" class="sidebar-link">
                                    <span class="hide-menu">Akuntan Unit</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="/auditor" class="sidebar-link">
                                    <span class="hide-menu">Auditor</span>
                                </a>
                            </li>
                        </ul>
                    </li>



                    <li class="sidebar-item">
                        <a class="sidebar-link has-arrow d-flex align-items-center fw-semibold "
                            href="javascript:void(0)" aria-expanded="false"
                            style="padding: 10px 16px; background-color: #cacaca49; color: #333; border-radius: 6px;">
                            <span class="hide-menu fs-3">Akun Keuangan</span>
                            <iconify-icon icon="mdi:chevron-down" class="ms-auto toggle-icon"
                                data-icon-down="mdi:chevron-down" data-icon-up="mdi:chevron-up"></iconify-icon>
                        </a>

                        <ul class="collapse first-level">
                            <li class="sidebar-item">
                                <a href="/kategori-akun" class="sidebar-link">
                                    <span class="hide-menu">Kategori Akun</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="/sub-kategori-akun" class="sidebar-link">
                                    <span class="hide-menu">Sub Kategori Akun</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="/akun" class="sidebar-link">
                                    <span class="hide-menu">Akun</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="/budget-rapbs-akun" class="sidebar-link">
                                    <span class="hide-menu">RAPBS Akun</span>
                                </a>
                            </li>
                        </ul>
                    </li>





                    <li class="sidebar-item">
                        <a class="sidebar-link has-arrow d-flex align-items-center fw-semibold "
                            href="javascript:void(0)" aria-expanded="false"
                            style="padding: 10px 16px; background-color: #cacaca49; color: #333; border-radius: 6px;">
                            <span class="hide-menu fs-3">Kegiatan</span>
                            <iconify-icon icon="mdi:chevron-down" class="ms-auto toggle-icon"
                                data-icon-down="mdi:chevron-down" data-icon-up="mdi:chevron-up"></iconify-icon>
                        </a>

                        <ul class="collapse first-level">
                            <li class="sidebar-item">
                                <a href="/kegiatan" class="sidebar-link">
                                    <span class="hide-menu">Data Kegiatan</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="/budget-rapbs-kegiatan" class="sidebar-link">
                                    <span class="hide-menu">RAPBS Kegiatan</span>
                                </a>
                            </li>
                        </ul>
                    </li>
                @endif


                <!-- Menu Pencatatan dan Laporan hanya untuk user selain admin -->

                @props(['role', 'hak_akses'])
                @if ($role == 'akuntan_unit')
                    <li class="sidebar-item">
                        <a class="sidebar-link has-arrow d-flex align-items-center fw-semibold"
                            href="javascript:void(0)" aria-expanded="false"
                            style="padding: 10px 16px; background-color: #cacaca49; color: #333; border-radius: 6px;">
                            <span class="hide-menu fs-3">RAPBS</span>
                            <iconify-icon icon="mdi:chevron-down" class="ms-auto toggle-icon"
                                data-icon-down="mdi:chevron-down" data-icon-up="mdi:chevron-up"></iconify-icon>
                        </a>
                        <ul class="collapse first-level">
                            @if (in_array($role, ['akuntan_unit']) && optional($hak_akses)->view_rapbs_akun)
                                <li class="sidebar-item">
                                    <a href="/budget-rapbs-akun" class="sidebar-link">
                                        <span class="hide-menu">RAPBS Akun</span>
                                    </a>
                                </li>
                            @endif

                            @if (in_array($role, ['akuntan_unit']) && optional($hak_akses)->view_rapbs_kegiatan)
                                <li class="sidebar-item">
                                    <a href="/budget-rapbs-kegiatan" class="sidebar-link">
                                        <span class="hide-menu">RAPBS Kegiatan</span>
                                    </a>
                                </li>
                            @endif

                        </ul>
                    </li>
                @endif








                <li class="sidebar-item">
                    <a class="sidebar-link has-arrow d-flex align-items-center fw-semibold " href="javascript:void(0)"
                        aria-expanded="false"
                        style="padding: 10px 16px; background-color: #cacaca49; color: #333; border-radius: 6px;">
                        <span class="hide-menu fs-3">Pencatatan</span>
                        <iconify-icon icon="mdi:chevron-down" class="ms-auto toggle-icon"
                            data-icon-down="mdi:chevron-down" data-icon-up="mdi:chevron-up"></iconify-icon>
                    </a>
                    <ul class="collapse first-level">
                        @if (in_array($role, ['admin']) || optional($hak_akses)->create_jurnal_umum)
                            <li class="sidebar-item">
                                <a href="/input-transaksi" class="sidebar-link">
                                    <span class="hide-menu">Input Transaksi</span>
                                </a>
                            </li>
                        @endif

                        @if (in_array($role, ['admin', 'auditor']) || optional($hak_akses)->view_jurnal_umum)
                            <li class="sidebar-item">
                                <a href="/jurnal-umum" class="sidebar-link">
                                    <span class="hide-menu">Jurnal Umum</span>
                                </a>
                            </li>
                        @endif

                        @if (in_array($role, ['admin', 'auditor']) || optional($hak_akses)->view_buku_besar)
                            <li class="sidebar-item">
                                <a href="/buku-besar" class="sidebar-link">
                                    <span class="hide-menu">Buku Besar</span>
                                </a>
                            </li>
                        @endif

                    </ul>
                </li>





                <li class="sidebar-item">
                    <a class="sidebar-link has-arrow d-flex align-items-center fw-semibold " href="javascript:void(0)"
                        aria-expanded="false"
                        style="padding: 10px 16px; background-color: #cacaca49; color: #333; border-radius: 6px;">
                        <span class="hide-menu fs-3">Laporan</span>
                        <iconify-icon icon="mdi:chevron-down" class="ms-auto toggle-icon"
                            data-icon-down="mdi:chevron-down" data-icon-up="mdi:chevron-up"></iconify-icon>
                    </a>

                    @php
                        $menus = [
                            'view_laporan_komprehensif' => [
                                'url' => '/laporan-komprehensif',
                                'label' => 'Komprehensif',
                            ],
                            'view_laporan_posisi_keuangan' => [
                                'url' => '/neraca-saldo',
                                'label' => 'Posisi Keuangan',
                            ],
                            'view_laporan_arus_kas' => ['url' => '/arus-kas', 'label' => 'Arus Kas'],
                            'view_laporan_perubahan_aset_neto' => [
                                'url' => '/perubahan-aset-neto',
                                'label' => 'Perubahan Aset Neto',
                            ],
                            'view_laporan_catatan_atas_laporan_keuangan' => ['url' => '/calk', 'label' => 'CALK'],
                            'view_laporan_proyeksi_rencana_dan_realisasi_anggaran' => [
                                'url' => '/prra',
                                'label' => 'PRRA',
                            ],
                        ];
                    @endphp

                    <ul class="collapse first-level">
                        @foreach ($menus as $permission => $menu)
                            @if (in_array($role, ['admin', 'auditor']) || optional($hak_akses)->$permission)
                                <li class="sidebar-item">
                                    <a href="{{ $menu['url'] }}" class="sidebar-link">
                                        <span class="hide-menu">{{ $menu['label'] }}</span>
                                    </a>
                                </li>
                            @endif
                        @endforeach

                    </ul>
                </li>



                @if ($role == 'admin')
                    <li class="sidebar-item">
                        <a href="/sop" class="sidebar-link fw-semibold" style="border-radius: 8px !important;">
                            <span class="hide-menu">SOP</span>
                        </a>
                    </li>
                @elseif ($role == 'akuntan_unit' || $role == 'auditor')
                    <li class="sidebar-item">
                        <a class="sidebar-link has-arrow d-flex align-items-center fw-semibold "
                            href="javascript:void(0)" aria-expanded="false"
                            style="padding: 10px 16px; background-color: #cacaca49; color: #000000; border-radius: 6px;">
                            <span class="hide-menu fs-3">SOP</span>
                            <iconify-icon icon="mdi:chevron-down" class="ms-auto toggle-icon"
                                data-icon-down="mdi:chevron-down" data-icon-up="mdi:chevron-up"></iconify-icon>
                        </a>

                        <ul class="collapse first-level">
                            @foreach ($sidebarSop as $item)
                                <li class="sidebar-item">
                                    <a href="{{ asset('storage/' . $item->file) }}" class="sidebar-link"
                                        target="_blank">
                                        <span class="hide-menu">{{ $item->keterangan }}</span>
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    </li>
                @endif





                @if ($role == 'admin' || $role == 'auditor')
                    <li class="sidebar-item">
                        <a href="/log-aktivitas" class="sidebar-link fw-semibold"
                            style="border-radius: 8px !important;">
                            <span class="hide-menu">Log Aktivitas</span>
                        </a>
                    </li>
                @endif


            </ul>
        </nav>


        <!-- End Sidebar navigation -->
    </div>
    <!-- End Sidebar scroll-->
</aside>



<script>
    document.querySelectorAll('.sidebar-link.has-arrow').forEach(function(link) {
        link.addEventListener('click', function() {
            const icon = link.querySelector('.toggle-icon');
            const submenu = link.nextElementSibling; // ul.collapse
            const isOpen = submenu.classList.contains('show');

            // Tutup semua submenu lain
            document.querySelectorAll('.sidebar-link.has-arrow').forEach(function(otherLink) {
                const otherSubmenu = otherLink.nextElementSibling;
                const otherIcon = otherLink.querySelector('.toggle-icon');

                if (otherLink !== link && otherSubmenu.classList.contains('show')) {
                    otherSubmenu.classList.remove('show');
                    otherLink.setAttribute('aria-expanded', 'false');
                    if (otherIcon) {
                        otherIcon.setAttribute('icon', otherIcon.dataset.iconDown);
                    }
                }
            });

            // Toggle submenu yang diklik
            submenu.classList.toggle('show');
            link.setAttribute('aria-expanded', !isOpen);

            if (icon) {
                icon.setAttribute('icon', isOpen ? icon.dataset.iconDown : icon.dataset.iconUp);
            }
        });
    });
</script>
