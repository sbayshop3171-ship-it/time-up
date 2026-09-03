<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * The only sanctioned way to move money.
 *
 * Every call locks the wallet row, applies the delta and writes the matching
 * ledger entry in one transaction, so `wallets.balance` always equals the sum
 * of that user's `transactions.amount`. All amounts are paisa.
 */
class WalletService
{
    /**
     * Apply a signed delta and return the new balance.
     *
     * @param  'deposit'|'withdraw'|'bet'|'win'|'bonus'|'rebate'|'adjust'  $kind
     *
     * @throws RuntimeException when a debit would take the balance below zero
     */
    public function apply(User|int $user, string $kind, int $amount, ?string $ref = null): int
    {
        $userId = $user instanceof User ? $user->id : $user;

        return DB::transaction(function () use ($userId, $kind, $amount, $ref): int {
            /** @var Wallet $wallet */
            $wallet = Wallet::query()
                ->lockForUpdate()
                ->firstOrCreate(['user_id' => $userId]);

            $balance = $wallet->balance + $amount;

            if ($balance < 0) {
                throw new RuntimeException('ব্যালেন্স যথেষ্ট নয়');
            }

            $wallet->balance = $balance;
            $wallet->save();

            Transaction::create([
                'user_id' => $userId,
                'kind' => $kind,
                'amount' => $amount,
                'balance_after' => $balance,
                'ref' => $ref,
            ]);

            return $balance;
        });
    }

    /** Credit a bonus and raise the turnover the player must clear to withdraw it. */
    public function grantBonus(User|int $user, int $amount, int $turnoverMultiplier, ?string $ref = null): int
    {
        $userId = $user instanceof User ? $user->id : $user;

        return DB::transaction(function () use ($userId, $amount, $turnoverMultiplier, $ref): int {
            $balance = $this->apply($userId, 'bonus', $amount, $ref);

            Wallet::query()
                ->where('user_id', $userId)
                ->increment('turnover_need', $amount * $turnoverMultiplier);

            return $balance;
        });
    }

    public function balanceOf(User|int $user): int
    {
        $userId = $user instanceof User ? $user->id : $user;

        return (int) (Wallet::query()->where('user_id', $userId)->value('balance') ?? 0);
    }
}
