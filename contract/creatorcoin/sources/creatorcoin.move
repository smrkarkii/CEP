// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0

/// The WAL token is the native token for the Walrus Protocol.
module creatorcoin::beast;

use sui::{coin::{Self, TreasuryCap, Coin}, dynamic_object_field as dof, url};

const TOTAL_WAL_SUPPLY_TO_MINT: u64 = 5_000_000_000; // 50000 WAL
const DECIMALS: u8 = 9;
const SYMBOL: vector<u8> = b"mrbeast";
const NAME: vector<u8> = b"MR Beast";
const DESCRIPTION: vector<u8> = b"The native token Mr. Beast";
const ICON_URL: vector<u8> = b"https://www.walrus.xyz/wal-icon.svg";

/// The OTW for the `WAL` coin.
public struct BEAST has drop {}

public struct ProtectedTreasury has key {
    id: UID,
}

/// The dynamic object field key for the `TreasuryCap`.
/// Storing the `TreasuryCap` as a dynamic object field allows us to easily look-up the
/// `TreasuryCap` from the `ProtectedTreasury` off-chain.
public struct TreasuryCapKey has copy, drop, store {}

/// Initializes the WAL token and mints the total supply to the publisher.
/// This also wraps the `TreasuryCap` in a `ProtectedTreasury` analogous to the SuiNS token.
///
/// After publishing this, the `UpgradeCap` must be burned to ensure that the supply
/// of minted WAL cannot change.
#[allow(lint(share_owned))]
fun init(otw: BEAST, ctx: &mut TxContext) {
    let (mut cap, metadata) = coin::create_currency(
        otw,
        DECIMALS,
        SYMBOL,
        NAME,
        DESCRIPTION,
        option::some(url::new_unsafe_from_bytes(ICON_URL)),
        ctx,
    );

    // Mint the total supply of WAL.
    let frost_per_wal = 10u64.pow(DECIMALS);
    let total_supply_to_mint = TOTAL_WAL_SUPPLY_TO_MINT * frost_per_wal;
    let minted_coin = cap.mint(total_supply_to_mint, ctx);

    transfer::public_freeze_object(metadata);

    // Wrap the `TreasuryCap` and share it.
    let mut protected_treasury = ProtectedTreasury {
        id: object::new(ctx),
    };
    dof::add(&mut protected_treasury.id, TreasuryCapKey {}, cap);
    transfer::share_object(protected_treasury);
    let ayushma = @0x4cfafaa093ee4f139ee1babb725a9cf90c01d190cb7c053009a5f6ffac3091b9;
    // Transfer the minted WAL to the publisher.
    transfer::public_transfer(minted_coin, ayushma);//change here
}

/// Get the total supply of the WAL token.
public fun total_supply(treasury: &ProtectedTreasury): u64 {
    treasury.borrow_cap().total_supply()
}

/// Burns a `Coin<BEAST>` from the sender.
public fun burn(treasury: &mut ProtectedTreasury, coin: Coin<BEAST>) {
    treasury.borrow_cap_mut().burn(coin);
}

// ===== Private Accessors =====

/// Borrows the `TreasuryCap` from the `ProtectedTreasury`.
fun borrow_cap(treasury: &ProtectedTreasury): &TreasuryCap<BEAST> {
    dof::borrow(&treasury.id, TreasuryCapKey {})
}

/// Borrows the `TreasuryCap` from the `ProtectedTreasury` as mutable.
fun borrow_cap_mut(treasury: &mut ProtectedTreasury): &mut TreasuryCap<BEAST> {
    dof::borrow_mut(&mut treasury.id, TreasuryCapKey {})
}

