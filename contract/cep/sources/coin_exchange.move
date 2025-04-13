module cep::exchange;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::object::{Self, UID, ID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};


// Keep errors in `walrus-sui/types/move_errors.rs` up to date with changes here.
const EInsufficientFundsInExchange: u64 = 0;
const EInsufficientInputBalance: u64 = 1;
const EUnauthorizedAdminCap: u64 = 2;
const EInvalidExchangeRate: u64 = 3;

/// A public exchange that allows exchanging SUI for WAL at a fixed exchange rate.
public struct Exchange<phantom T> has key, store {
    id: UID,
    creator_coin: Balance<T>,
    sui: Balance<SUI>,
    rate: ExchangeRate,
    admin: ID,
}

/// Capability that allows the holder to modify an `Exchange`'s exchange rate and withdraw funds.
public struct AdminCap has key, store {
    id: UID,
}

/// Represents an exchange rate: `wal` WAL = `sui` SUI.
public struct ExchangeRate has copy, drop, store {
    creator_coin: u64,
    sui: u64,
}

// === Functions for `ExchangeRate` ===

/// Creates a new exchange rate, making sure it is valid.
public fun new_exchange_rate(creator_coin: u64, sui: u64): ExchangeRate {
    assert!(creator_coin != 0 && sui != 0, EInvalidExchangeRate);
    ExchangeRate { creator_coin, sui }
}

fun creator_coin_to_sui(self: &ExchangeRate, amount: u64): u64 {
    amount * self.sui / self.creator_coin
}

fun sui_to_creator_coin(self: &ExchangeRate, amount: u64): u64 {
    amount * self.creator_coin / self.sui
}

// === Functions for `Exchange` ===

// Creation functions

/// Creates a new shared exchange with a 1:1 exchange rate and returns the associated `AdminCap`.
public fun new<T>(ctx: &mut TxContext): AdminCap {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer::share_object(Exchange<T>{
        id: object::new(ctx),
        creator_coin: balance::zero<T>(),
        sui: balance::zero(),
        rate: ExchangeRate { creator_coin: 1, sui: 1 },
        admin: object::id(&admin_cap),
    });
    admin_cap
}

/// Creates a new shared exchange with a 1:1 exchange rate, funds it with WAL, and returns the
/// associated `AdminCap`.
public fun new_funded<T>(creator_coin: &mut Coin<T>, amount: u64, ctx: &mut TxContext): AdminCap {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    let mut exchange = Exchange {
        id: object::new(ctx),
        creator_coin: balance::zero<T>(),
        sui: balance::zero(),
        rate: ExchangeRate { creator_coin: 1, sui: 1 },
        admin: object::id(&admin_cap),
    };
    exchange.add_creator_coin(creator_coin, amount);

    transfer::share_object(exchange);
    admin_cap
}

/// Adds WAL to the balance stored in the exchange.
public fun add_creator_coin<T>(self: &mut Exchange<T>, creator_coin: &mut Coin<T>, amount: u64) {
    self.creator_coin.join(creator_coin.balance_mut().split(amount));
}

/// Adds SUI to the balance stored in the exchange.
public fun add_sui<T>(self: &mut Exchange<T>, sui: &mut Coin<SUI>, amount: u64) {
    self.sui.join(sui.balance_mut().split(amount));
}

/// Adds WAL to the balance stored in the exchange.
public fun add_all_creator_coin<T>(self: &mut Exchange<T>, creator_coin: Coin<T>) {
    self.creator_coin.join(creator_coin.into_balance());
}

/// Adds SUI to the balance stored in the exchange.
public fun add_all_sui<T>(self: &mut Exchange<T>, sui: Coin<SUI>) {
    self.sui.join(sui.into_balance());
}

// Admin functions

fun check_admin<T>(self: &Exchange<T>, admin_cap: &AdminCap) {
    assert!(self.admin == object::id(admin_cap), EUnauthorizedAdminCap);
}

/// Withdraws WAL from the balance stored in the exchange.
public fun withdraw_creator_coin<T>(
    self: &mut Exchange<T>,
    amount: u64,
    admin_cap: &AdminCap,
    ctx: &mut TxContext,
): Coin<T> {
    self.check_admin<T>(admin_cap);
    assert!(self.creator_coin.value() >= amount, EInsufficientFundsInExchange);
    self.creator_coin.split(amount).into_coin(ctx)
}

/// Withdraws SUI from the balance stored in the exchange.
public fun withdraw_sui<T>(
    self: &mut Exchange<T>,
    amount: u64,
    admin_cap: &AdminCap,
    ctx: &mut TxContext,
): Coin<SUI> {
    self.check_admin<T>(admin_cap);
    assert!(self.sui.value() >= amount, EInsufficientFundsInExchange);
    self.sui.split(amount).into_coin(ctx)
}

/// Sets the exchange rate of the exchange to `wal` WAL = `sui` SUI.
public fun set_exchange_rate<T>(self: &mut Exchange<T>, creator_coin: u64, sui: u64, admin_cap: &AdminCap) {
    self.check_admin<T>(admin_cap);
    self.rate = new_exchange_rate(creator_coin, sui);
}

// User functions

/// Exchanges the provided SUI coin for WAL at the exchange's rate.
public fun exchange_all_for_creator_coin<T>(
    self: &mut Exchange<T>,
    sui: Coin<SUI>,
    ctx: &mut TxContext,
): Coin<T> {
    let value_creator_coin = self.rate.sui_to_creator_coin(sui.value());
    assert!(self.creator_coin.value() >= value_creator_coin, EInsufficientFundsInExchange);
    self.sui.join(sui.into_balance());
    self.creator_coin.split(value_creator_coin).into_coin(ctx)
}

/// Exchanges `amount_sui` out of the provided SUI coin for WAL at the exchange's rate.
public fun exchange_for_creator_coin<T>(
    self: &mut Exchange<T>,
    sui: &mut Coin<SUI>,
    amount_sui: u64,
    ctx: &mut TxContext,
): Coin<T> {
    assert!(sui.value() >= amount_sui, EInsufficientInputBalance);
    self.exchange_all_for_creator_coin(sui.split(amount_sui, ctx), ctx)
}

/// Exchanges the provided WAL coin for SUI at the exchange's rate.
public fun exchange_all_for_sui<T>(
    self: &mut Exchange<T>,
    creator_coin: Coin<T>,
    ctx: &mut TxContext,
): Coin<SUI> {
    let value_sui = self.rate.creator_coin_to_sui(creator_coin.value());
    assert!(self.sui.value() >= value_sui, EInsufficientFundsInExchange);
    self.creator_coin.join(creator_coin.into_balance());
    self.sui.split(value_sui).into_coin(ctx)
}

/// Exchanges `amount_wal` out of the provided WAL coin for SUI at the exchange's rate.
public fun exchange_for_sui<T>(
    self: &mut Exchange<T>,
    creator_coin: &mut Coin<T>,
    amount_coin: u64,
    ctx: &mut TxContext,
): Coin<SUI> {
    assert!(creator_coin.value() >= amount_coin, EInsufficientInputBalance);
    self.exchange_all_for_sui(creator_coin.split(amount_coin, ctx), ctx)
}

public fun get_coin<T>(
    self: &mut Exchange<T>,
    sui: Coin<SUI>,
    amount: u64, 
    ctx: &mut TxContext
): Coin<T> {
    self.sui.join(sui.into_balance());
    self.creator_coin.split(amount).into_coin(ctx)
}