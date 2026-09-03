<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::put('site', [
            'name' => 'Sk88bd',
            'domain' => 'sk88bd.live',
            'currency' => 'BDT',
        ]);

        Setting::put('support', [
            'email' => 'mpmony1@gmail.com',
            'whatsapp' => 'https://wa.me/8801000000000',
            'telegram' => 'https://t.me/',
            'facebook' => 'https://facebook.com/',
        ]);

        // amount is paisa; turnover_multiplier is how many times it must be
        // wagered before the balance can be withdrawn
        Setting::put('signup_bonus', [
            'amount' => 0,
            'turnover_multiplier' => 10,
        ]);

        Setting::put('app_links', [
            'android' => null,
            'ios' => null,
        ]);
    }
}
