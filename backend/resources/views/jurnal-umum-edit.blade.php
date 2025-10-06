@extends('layouts.layout')
@push('styles')
    <title>SIA Yayasan Darussalam | Edit Transaksi</title>
@endpush

@section('content')
    <div class="card">
        <div class="card-body">
            <h5 class="card-title fw-semibold mb-4">Edit Transaksi</h5>
            <div class="card">
                <div class="card-body">
                    <form method="POST" action="/jurnal-umum/{{ $jurnalUmum->id_jurnal_umum }}">
                        @csrf
                        @method('PUT')
                        <div class="mb-3">
                            <label for="tanggal" class="form-label">Tanggal</label>
                            <input type="date" class="form-control" name="tanggal" id="tanggal"
                                value="{{ $jurnalUmum->tanggal }}" required>
                        </div>

                        <div class="mb-3">
                            <label for="keterangan" class="form-label">Keterangan</label>
                            <input type="text" class="form-control" name="keterangan" id="keterangan"
                                value="{{ $jurnalUmum->keterangan }}" required>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Jenis Transaksi</label>
                                <select name="jenis_transaksi" class="form-select" required>
                                    <option value="Terikat"
                                        {{ $jurnalUmum->jenis_transaksi == 'Terikat' ? 'selected' : '' }}>
                                        Terikat</option>
                                    <option value="Tidak Terikat"
                                        {{ $jurnalUmum->jenis_transaksi == 'Tidak Terikat' ? 'selected' : '' }}>
                                        Tidak Terikat</option>
                                </select>
                            </div>

                            @if (Auth::user()->role === 'akuntan_unit')
                                <input type="hidden" name="id_unit" value="{{ $id_unit }}">
                            @else
                                <div class="col-md-3">
                                    <label class="form-label">Unit</label>
                                    <select name="id_unit" class="form-select" required>
                                        <option value="">Pilih Unit</option>
                                        @foreach ($unit as $data_unit)
                                            <option value="{{ $data_unit->id_unit }}"
                                                {{ $data_unit->id_unit == $jurnalUmum->id_unit ? 'selected' : '' }}>
                                                {{ $data_unit->kode_unit }} - {{ $data_unit->unit }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            @endif

                            @if (Auth::user()->role === 'akuntan_divisi')
                                <input type="hidden" name="id_divisi" value="{{ $id_divisi }}">
                            @else
                                <div class="col-md-3">
                                    <label class="form-label">Divisi</label>
                                    <select name="id_divisi" class="form-select" required>
                                        <option value="">Pilih Divisi</option>
                                        @foreach ($divisi as $data_divisi)
                                            <option value="{{ $data_divisi->id_divisi }}"
                                                {{ $data_divisi->id_divisi == $jurnalUmum->id_divisi ? 'selected' : '' }}>
                                                {{ $data_divisi->divisi }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            @endif
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6 kegiatan-group">
                                <label class="form-label">Kegiatan</label>
                                {{-- <input list="kegiatan-list" class="form-control kegiatan-search"
                                    placeholder="Pilih kegiatan" autocomplete="off" required
                                    value="{{ $jurnalUmum->kegiatan->kode_kegiatan }} - {{ $jurnalUmum->kegiatan->kegiatan }}"> --}}
                                <input list="kegiatan-list" class="form-control kegiatan-search"
                                    placeholder="Pilih kegiatan" autocomplete="off"
                                    value="{{ $jurnalUmum->kegiatan?->kode_kegiatan }} - {{ $jurnalUmum->kegiatan?->kegiatan }}">

                                {{-- Tampilkan label --}}
                                <input type="hidden" name="id_kegiatan" class="kegiatan-id"
                                    value="{{ $jurnalUmum->id_kegiatan }}"> {{-- Simpan ID --}}


                                <datalist id="kegiatan-list">
                                    @foreach ($kegiatan as $data_kegiatan)
                                        <option data-id="{{ $data_kegiatan->id_kegiatan }}"
                                            value="{{ $data_kegiatan->kode_kegiatan }} - {{ $data_kegiatan->kegiatan }}">
                                        </option>
                                    @endforeach
                                </datalist>
                            </div>
                            <div class="col-md-6 sumber-group">
                                <label class="form-label">Sumber Anggaran</label>
                                <input list="sumber-list" class="form-control sumber-search" placeholder="Pilih sumber"
                                    autocomplete="off"
                                    value="{{ optional($jurnalUmum->sumber_anggaran)->kode_akun }} - {{ optional($jurnalUmum->sumber_anggaran)->akun }}">
                                {{-- Tampilkan label --}}
                                <input type="hidden" name="id_sumber_anggaran" class="sumber-id"
                                    value="{{ $jurnalUmum->id_sumber_anggaran }}"> {{-- Simpan ID --}}


                                <datalist id="sumber-list">
                                    @foreach ($sumber_anggaran as $data_sumber_anggaran)
                                        <option data-id="{{ $data_sumber_anggaran->id_akun }}"
                                            value="{{ $data_sumber_anggaran->kode_akun }} - {{ $data_sumber_anggaran->akun }}">
                                        </option>
                                    @endforeach
                                </datalist>
                            </div>

                        </div>


                        <hr class="border border-3 border-dark">

                        <div id="akunContainer">
                            @foreach ($jurnalUmum->detail_jurnal_umum as $detail)
                                <div class="row mb-3 akun-row">
                                    <div class="col-md-6">
                                        <label class="form-label">Akun</label>
                                        @php
                                            // Ambil akun yang sesuai dengan $detail->id_akun
                                            $akun_terpilih = $akun->firstWhere('id_akun', $detail->id_akun);
                                            $label_akun_terpilih = $akun_terpilih
                                                ? $akun_terpilih->kode_akun . ' - ' . $akun_terpilih->akun
                                                : '';
                                        @endphp

                                        <input list="akun-list" class="form-control akun-search" placeholder="Pilih Akun"
                                            autocomplete="off" required value="{{ $label_akun_terpilih }}">

                                        <input type="hidden" name="id_akun[]" class="akun-id"
                                            value="{{ $detail->id_akun }}">

                                        <datalist id="akun-list">
                                            @foreach ($akun as $data_akun)
                                                <option data-id="{{ $data_akun->id_akun }}"
                                                    value="{{ $data_akun->kode_akun }} - {{ $data_akun->akun }}">
                                                </option>
                                            @endforeach
                                        </datalist>

                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Debit</label>
                                        <div class="input-group">
                                            <span class="input-group-text">Rp</span>
                                            <input type="text" class="form-control format-rupiah" name="debit[]"
                                                value="{{ $detail->debit_kredit === 'debit' ? number_format($detail->nominal, 0, ',', '.') : '' }}"
                                                oninput="formatRupiah(this)">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Kredit</label>
                                        <div class="input-group">
                                            <span class="input-group-text">Rp</span>
                                            <input type="text" class="form-control format-rupiah" name="kredit[]"
                                                value="{{ $detail->debit_kredit === 'kredit' ? number_format($detail->nominal, 0, ',', '.') : '' }}"
                                                oninput="formatRupiah(this)">
                                        </div>
                                    </div>
                                </div>
                            @endforeach

                        </div>

                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-success mb-3" onclick="tambahAkun()">Tambah
                                Akun</button>
                        </div>

                        @php
                            $user = Auth::user();
                            $bolehPosting = false;

                            if ($user->role === 'admin') {
                                $bolehPosting = true;
                            } elseif ($user->role === 'akuntan_unit' && isset($sidebarHakAkses)) {
                                $bolehPosting =
                                    $sidebarHakAkses->create_buku_besar || $sidebarHakAkses->delete_buku_besar;
                            }
                        @endphp

                        @if ($bolehPosting)
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="postingBukuBesar"
                                    name="postingBukuBesar" {{ $jurnalUmum->buku_besar ? 'checked' : '' }}>
                                <label class="form-check-label" for="postingBukuBesar">Posting ke Buku Besar</label>
                            </div>
                        @endif




                        <button type="submit" class="btn btn-primary col-12">Simpan</button>
                    </form>

                    <script>
                        function tambahAkun() {
                            let container = document.getElementById('akunContainer');
                            let newRow = document.createElement('div');
                            newRow.classList.add('row', 'mb-3', 'akun-row');
                            newRow.innerHTML = `
                                            <div class="col-md-6">
                                                <label class="form-label">Akun</label>
                                                <select name="id_akun[]" class="form-select" required>
                                                    <option value="">Pilih Akun</option>
                                                    @foreach ($akun as $data_akun)
                                                        <option value="{{ $data_akun->id_akun }}">{{ $data_akun->kode_akun }} - {{ $data_akun->akun }}</option>
                                                    @endforeach
                                                </select>
                                            </div>
                                            <div class="col-md-3">
                                                <label class="form-label">Debit</label>
                                                <div class="input-group">
                                                    <span class="input-group-text">Rp</span>
                                                    <input type="text" class="form-control format-rupiah" name="debit[]" oninput="formatRupiah(this)">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <label class="form-label">Kredit</label>
                                                <div class="input-group">
                                                    <span class="input-group-text">Rp</span>
                                                    <input type="text" class="form-control format-rupiah" name="kredit[]" oninput="formatRupiah(this)">
                                                </div>
                                            </div>
                                            <div class="col-md-12 text-end">
                                                <button type="button" class="btn btn-danger btn-sm" onclick="hapusAkun(this)">Hapus</button>
                                            </div>
                                        `;
                            container.appendChild(newRow);
                        }

                        function hapusAkun(button) {
                            let row = button.closest('.akun-row');
                            row.remove();
                        }

                        function formatRupiah(input) {
                            let value = input.value.replace(/\D/g, '');
                            input.value = new Intl.NumberFormat('id-ID').format(value);
                        }
                    </script>
                </div>
            </div>

        </div>
    </div>
    <div class="py-6 px-6 text-center">
        <p class="mb-0 fs-4">Sistem Informasi Akuntansi Yayasan Darussalam Batam | 2025</p>
    </div>
@endsection

@push('scripts')
    <script>
        document.querySelectorAll('.akun-search').forEach((input, index) => {
            const hiddenInput = document.querySelectorAll('.akun-id')[index];

            input.addEventListener('input', function() {
                const val = this.value;
                const option = [...document.getElementById('akun-list').options]
                    .find(opt => opt.value === val);

                if (option) {
                    hiddenInput.value = option.dataset.id;
                } else {
                    hiddenInput.value = ''; // Clear jika input tidak valid
                }
            });
        });
    </script>

    <script>
        document.addEventListener('input', function(e) {
            // Untuk kegiatan
            if (e.target.classList.contains('kegiatan-search')) {
                const input = e.target;
                const val = input.value;
                const options = document.getElementById('kegiatan-list').options;

                let foundId = '';
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === val) {
                        foundId = options[i].getAttribute('data-id');
                        break;
                    }
                }

                const parentDiv = input.closest('.kegiatan-group');
                if (parentDiv) {
                    const hiddenInput = parentDiv.querySelector('.kegiatan-id');
                    hiddenInput.value = foundId;
                }
            }

            // Untuk sumber anggaran
            if (e.target.classList.contains('sumber-search')) {
                const input = e.target;
                const val = input.value;
                const options = document.getElementById('sumber-list').options;

                let foundId = '';
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === val) {
                        foundId = options[i].getAttribute('data-id');
                        break;
                    }
                }

                const parentDiv = input.closest('.sumber-group');
                if (parentDiv) {
                    const hiddenInput = parentDiv.querySelector('.sumber-id');
                    hiddenInput.value = foundId;
                }
            }
        });
    </script>
@endpush
