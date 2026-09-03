<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentChannel;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings', [
            'site' => Setting::get('site'),
            'support' => Setting::get('support'),
            'signupBonus' => Setting::get('signup_bonus'),
            // account_no is Hidden on the model; this screen is the one place
            // it is meant to be visible, so it is selected explicitly
            'channels' => PaymentChannel::orderBy('sort_order')
                ->get()
                ->map(fn (PaymentChannel $c) => [
                    ...$c->toArray(),
                    'account_no' => $c->account_no,
                    'account_name' => $c->account_name,
                ]),
        ]);
    }

    public function updateSite(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:64'],
            'domain' => ['required', 'string', 'max:120'],
            'currency' => ['required', 'string', 'max:8'],
            'email' => ['required', 'email', 'max:120'],
            'whatsapp' => ['nullable', 'string', 'max:255'],
            'telegram' => ['nullable', 'string', 'max:255'],
            'facebook' => ['nullable', 'string', 'max:255'],
        ]);

        Setting::put('site', [
            'name' => $data['name'],
            'domain' => $data['domain'],
            'currency' => $data['currency'],
        ]);

        Setting::put('support', [
            'email' => $data['email'],
            'whatsapp' => $data['whatsapp'] ?? null,
            'telegram' => $data['telegram'] ?? null,
            'facebook' => $data['facebook'] ?? null,
        ]);

        return back()->with('toast', 'সেটিংস সেভ হয়েছে');
    }

    /** The operator's receiving account numbers live here, never in the front end. */
    public function updateChannel(Request $request, PaymentChannel $channel): RedirectResponse
    {
        $data = $request->validate([
            'account_no' => ['nullable', 'string', 'max:64'],
            'account_name' => ['nullable', 'string', 'max:64'],
            'min_amount' => ['required', 'numeric', 'min:0'],
            'max_amount' => ['required', 'numeric', 'gt:min_amount'],
            'supports_deposit' => ['boolean'],
            'supports_withdraw' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $channel->update([
            ...$data,
            'min_amount' => (int) round($data['min_amount'] * 100),
            'max_amount' => (int) round($data['max_amount'] * 100),
        ]);

        return back()->with('toast', "{$channel->name} আপডেট হয়েছে");
    }
}
