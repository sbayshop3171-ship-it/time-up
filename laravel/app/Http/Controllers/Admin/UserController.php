<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->toString();

        return Inertia::render('Admin/Users', [
            'rows' => User::query()
                ->with('wallet')
                ->when($search !== '', fn ($q) => $q
                    ->where('phone', 'like', "%{$search}%")
                    ->orWhere('referral_code', 'like', "%{$search}%"))
                ->latest()
                ->paginate(30)
                ->withQueryString(),
            'q' => $search,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'is_blocked' => ['nullable', 'boolean'],
            'vip_level' => ['nullable', 'integer', 'min:0', 'max:10'],
            'display_name' => ['nullable', 'string', 'max:64'],
        ]);

        $user->forceFill(array_filter($data, fn ($v): bool => $v !== null))->save();

        return back()->with('toast', 'ইউজার আপডেট হয়েছে');
    }

    /** Manual credit or debit. Always leaves a ledger entry with the reason. */
    public function adjust(Request $request, User $user, WalletService $wallet): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'not_in:0'],
            'note' => ['required', 'string', 'max:255'],
        ], [
            'amount.not_in' => 'শূন্য ছাড়া অন্য পরিমাণ দিন',
            'note.required' => 'কারণ লিখুন',
        ]);

        $paisa = (int) round($data['amount'] * 100);

        try {
            $wallet->apply($user, 'adjust', $paisa, $data['note']);
        } catch (RuntimeException $e) {
            return back()->with('toast', "অ্যাডজাস্ট করা যায়নি: {$e->getMessage()}");
        }

        return back()->with('toast', 'ব্যালেন্স অ্যাডজাস্ট হয়েছে');
    }
}
