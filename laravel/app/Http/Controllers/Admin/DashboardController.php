<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AviatorRound;
use App\Models\Deposit;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Withdrawal;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now()->startOfDay();

        $betsToday = -Transaction::where('kind', 'bet')->where('created_at', '>=', $today)->sum('amount');
        $winsToday = Transaction::where('kind', 'win')->where('created_at', '>=', $today)->sum('amount');

        return Inertia::render('Admin/Dashboard', [
            'tiles' => [
                ['label' => 'আজকের ডিপোজিট', 'value' => (int) Deposit::where('state', 'approved')->where('reviewed_at', '>=', $today)->sum('amount'), 'money' => true],
                ['label' => 'আজকের উইথড্র', 'value' => (int) Withdrawal::where('state', 'approved')->where('reviewed_at', '>=', $today)->sum('amount'), 'money' => true],
                ['label' => 'পেন্ডিং ডিপোজিট', 'value' => Deposit::where('state', 'pending')->count()],
                ['label' => 'পেন্ডিং উইথড্র', 'value' => Withdrawal::where('state', 'pending')->count()],
                ['label' => 'মোট ইউজার', 'value' => User::where('role', 'player')->count()],
                ['label' => 'আজ সক্রিয়', 'value' => User::where('last_login_at', '>=', $today)->count()],
                ['label' => 'আজকের GGR', 'value' => (int) ($betsToday - $winsToday), 'money' => true],
                ['label' => 'Aviator রাউন্ড', 'value' => AviatorRound::where('created_at', '>=', $today)->count()],
            ],
        ]);
    }
}
