<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class WalletServiceTest extends TestCase
{
    use RefreshDatabase;

    private WalletService $wallet;

    protected function setUp(): void
    {
        parent::setUp();
        $this->wallet = app(WalletService::class);
    }

    public function test_credit_raises_the_balance_and_writes_a_ledger_entry(): void
    {
        $user = User::factory()->create();

        $balance = $this->wallet->apply($user, 'deposit', 50_000, 'deposit:1');

        $this->assertSame(50_000, $balance);
        $this->assertSame(50_000, $user->wallet->fresh()->balance);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'kind' => 'deposit',
            'amount' => 50_000,
            'balance_after' => 50_000,
            'ref' => 'deposit:1',
        ]);
    }

    public function test_debit_below_zero_is_refused_and_leaves_no_trace(): void
    {
        $user = User::factory()->withBalance(10_000)->create();

        try {
            $this->wallet->apply($user, 'withdraw', -20_000);
            $this->fail('expected the debit to be refused');
        } catch (RuntimeException) {
            // expected
        }

        $this->assertSame(10_000, $user->wallet->fresh()->balance);
        $this->assertSame(0, Transaction::where('user_id', $user->id)->count());
    }

    public function test_balance_always_equals_the_sum_of_the_ledger(): void
    {
        $user = User::factory()->create();

        $this->wallet->apply($user, 'deposit', 100_000);
        $this->wallet->apply($user, 'bet', -30_000);
        $this->wallet->apply($user, 'win', 45_000);
        $this->wallet->apply($user, 'withdraw', -15_000);

        $this->assertSame(
            (int) Transaction::where('user_id', $user->id)->sum('amount'),
            $user->wallet->fresh()->balance,
        );
    }

    public function test_a_bonus_raises_the_turnover_the_player_must_clear(): void
    {
        $user = User::factory()->create();

        $this->wallet->grantBonus($user, 1_800, 10, 'signup');

        $wallet = $user->wallet->fresh();
        $this->assertSame(1_800, $wallet->balance);
        $this->assertSame(18_000, $wallet->turnover_need);
    }
}
