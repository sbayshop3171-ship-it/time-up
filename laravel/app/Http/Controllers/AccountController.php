<?php

namespace App\Http\Controllers;

use App\Models\AviatorBet;
use App\Models\Deposit;
use App\Models\Transaction;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** The player's own account screens: profile, records, balance, security. */
class AccountController extends Controller
{
    public function member(): Response
    {
        return Inertia::render('Account/Member');
    }

    public function profile(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Account/Profile', [
            'profile' => [
                'id' => $user->id,
                'phone' => $user->phone,
                'display_name' => $user->display_name,
                'vip_level' => $user->vip_level,
                'referral_code' => $user->referral_code,
                'created_at' => $user->created_at?->toDateString(),
            ],
        ]);
    }

    public function statement(Request $request): Response
    {
        return Inertia::render('Account/Statement', [
            'rows' => $request->user()->transactions()->latest()->paginate(30),
        ]);
    }

    public function betsHistory(Request $request): Response
    {
        return Inertia::render('Account/BetsHistory', [
            'rows' => AviatorBet::where('user_id', $request->user()->id)
                ->with('round:id,crash_at,crashed_at')
                ->latest()
                ->paginate(30),
        ]);
    }

    public function balanceOverview(Request $request): Response
    {
        $user = $request->user();
        $wallet = $user->wallet;

        $totalDeposit = Deposit::where('user_id', $user->id)->where('state', 'approved')->sum('amount');
        $totalWithdraw = Withdrawal::where('user_id', $user->id)->where('state', 'approved')->sum('amount');
        $totalBet = -Transaction::where('user_id', $user->id)->where('kind', 'bet')->sum('amount');
        $totalWin = Transaction::where('user_id', $user->id)->where('kind', 'win')->sum('amount');

        return Inertia::render('Account/BalanceOverview', [
            'cards' => [
                ['label' => 'মূল ব্যালেন্স', 'value' => (int) ($wallet?->balance ?? 0)],
                ['label' => 'বোনাস ব্যালেন্স', 'value' => (int) ($wallet?->bonus_balance ?? 0)],
                ['label' => 'মোট ডিপোজিট', 'value' => (int) $totalDeposit],
                ['label' => 'মোট উইথড্র', 'value' => (int) $totalWithdraw],
                ['label' => 'মোট বেট', 'value' => (int) $totalBet],
                ['label' => 'লাভ / ক্ষতি', 'value' => (int) ($totalWin - $totalBet)],
            ],
        ]);
    }

    public function turnover(Request $request): Response
    {
        $wallet = $request->user()->wallet;

        return Inertia::render('Account/Turnover', [
            'turnover' => [
                'need' => (int) ($wallet?->turnover_need ?? 0),
                'done' => (int) ($wallet?->turnover_done ?? 0),
            ],
        ]);
    }

    public function security(): Response
    {
        return Inertia::render('Account/Security');
    }

    public function refer(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Account/Refer', [
            'referralCode' => $user?->referral_code,
            'stats' => [
                'total' => $user ? $user->referrals()->count() : 0,
                'active' => $user
                    ? $user->referrals()->whereNotNull('last_login_at')->count()
                    : 0,
                'commission' => $user
                    ? (int) $user->transactions()->where('kind', 'rebate')->sum('amount')
                    : 0,
            ],
        ]);
    }
}
