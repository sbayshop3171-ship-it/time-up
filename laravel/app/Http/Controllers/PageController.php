<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

/** Marketing and information screens driven by editable records. */
class PageController extends Controller
{
    /** VIP tiers. Turnover thresholds are in paisa. */
    private const VIP_TIERS = [
        ['level' => 'VIP 1', 'need' => 5000000, 'rebate' => '0.3%', 'gift' => '৳৫০'],
        ['level' => 'VIP 2', 'need' => 25000000, 'rebate' => '0.5%', 'gift' => '৳৩০০'],
        ['level' => 'VIP 3', 'need' => 100000000, 'rebate' => '0.7%', 'gift' => '৳১,৫০০'],
        ['level' => 'VIP 4', 'need' => 500000000, 'rebate' => '0.9%', 'gift' => '৳৮,০০০'],
        ['level' => 'VIP 5', 'need' => 2000000000, 'rebate' => '1.2%', 'gift' => '৳৪০,০০০'],
    ];

    public function promotions(): Response
    {
        return Inertia::render('Promotions', [
            'promotions' => Promotion::active()->orderBy('sort_order')->get(),
        ]);
    }

    public function reward(): Response
    {
        return Inertia::render('Reward', [
            'tiers' => self::VIP_TIERS,
        ]);
    }

    public function vip(): Response
    {
        return Inertia::render('Vip', [
            'tiers' => self::VIP_TIERS,
        ]);
    }

    public function support(): Response
    {
        return Inertia::render('Support', [
            'contact' => Setting::get('support', []),
        ]);
    }

    public function download(): Response
    {
        return Inertia::render('Download', [
            'links' => Setting::get('app_links', ['android' => null, 'ios' => null]),
        ]);
    }
}
