<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Jurnal_Umum;
use App\Models\Buku_Besar;
use Illuminate\Support\Facades\DB;

class PostAllJurnal extends Command
{
    protected $signature = 'jurnal:post-all';
    protected $description = 'Post all unposted journals to Buku Besar';

    public function handle()
    {
        DB::statement('SET @current_user_id = 1');
        
        $unposted = Jurnal_Umum::whereDoesntHave('buku_besar')->get();
        
        $this->info("Found {$unposted->count()} unposted journals");
        
        $count = 0;
        foreach ($unposted as $jurnal) {
            Buku_Besar::firstOrCreate(['id_jurnal_umum' => $jurnal->id_jurnal_umum]);
            $count++;
            $this->line("Posted: {$jurnal->id_jurnal_umum} - {$jurnal->keterangan}");
        }
        
        $this->info("Successfully posted {$count} journals!");
        
        return Command::SUCCESS;
    }
}
