
    // document.addEventListener('DOMContentLoaded', function() {
    //     // Toggle untuk desktop
    //     document.getElementById('desktopSidebarToggle').addEventListener('click', function() {
    //         toggleSidebar();
    //     });

    //     // Toggle untuk handle
    //     document.getElementById('sidebarToggleHandle').addEventListener('click', function() {
    //         toggleSidebar();
    //     });

    //     // Toggle untuk mobile (header button)
    //     document.getElementById('headerCollapse').addEventListener('click', function() {
    //         document.querySelector('.left-sidebar').classList.toggle('sidebar-display');
    //     });

    //     // Toggle untuk mobile (close button di sidebar)
    //     document.getElementById('sidebarCollapse').addEventListener('click', function() {
    //         document.querySelector('.left-sidebar').classList.remove('sidebar-display');
    //     });

    //     function toggleSidebar() {
    //         const sidebar = document.querySelector('.left-sidebar');
    //         const handle = document.getElementById('sidebarToggleHandle');
    //         const icon = document.querySelectorAll('#desktopSidebarToggle i, #sidebarToggleHandle i');

    //         sidebar.classList.toggle('hide-sidebar');
    //         document.querySelector('.body-wrapper').classList.toggle('full-width');

    //         icon.forEach(i => {
    //             i.classList.toggle('ti-chevrons-left');
    //             i.classList.toggle('ti-chevrons-right');
    //         });
    //     }
    // });


    document.addEventListener('DOMContentLoaded', function() {
        // Toggle untuk mobile (tombol header)
        const headerCollapseBtn = document.getElementById('headerCollapse');
        if (headerCollapseBtn) {
            headerCollapseBtn.addEventListener('click', function() {
                document.querySelector('.left-sidebar').classList.toggle('sidebar-display');
            });
        }
    
        // Toggle untuk mobile (tombol tutup di sidebar)
        const sidebarCollapseBtn = document.getElementById('sidebarCollapse');
        if (sidebarCollapseBtn) {
            sidebarCollapseBtn.addEventListener('click', function() {
                document.querySelector('.left-sidebar').classList.remove('sidebar-display');
            });
        }
    
        // Toggle untuk desktop
        const desktopToggleBtn = document.getElementById('desktopSidebarToggle');
        if (desktopToggleBtn) {
            desktopToggleBtn.addEventListener('click', function() {
                const sidebar = document.querySelector('.left-sidebar');
                sidebar.classList.toggle('hide-sidebar');
                document.querySelector('.body-wrapper').classList.toggle('full-width');
                
                // Ganti ikon jika ada
                const icon = desktopToggleBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('ti-chevrons-left');
                    icon.classList.toggle('ti-chevrons-right');
                }
            });
        }
    });