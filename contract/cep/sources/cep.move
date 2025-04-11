module cep::cep ;

    use std::string::{String};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use cep::roles::{AdminCap};
    use std::vector;

    //Errors

    //constants
    const EAlreadyRegisteredBlob:u64 = 0;

    //structs

    public struct ContentRegistry has key, store {
        id: UID,
        user_engagement:Table<address, u64>,//points/engangement per  user
        registered_content:vector<ID>,
        // registered_blobs:vector<ID>,
        content_creator:Table<String, address> //owner of blob
        //what more needed?
    }

    public struct Content has key, store {
        id: UID, 
        blob_id: String, 
        owner: address, 
        title: String, 
        description: String, 
        tag: vector<String>,
        file_type: String, 
    }

    public struct UserProfile has key {
        id:UID,
        name:String,
        bio:String,
        total_engagement:u64,
        published_contents:vector<ID>//vector of the contents id
    }

    public struct CreatorToken has key {
        id:UID,
        name:String,
        symbol:String,
        total_supply:u64,
        creator:address,
    }

    // Token tier pricing structure (SUI amount)
    public struct TokenPricing has key, store {
        id: UID,
        tier_1_price: u64, // < 100 engagement
        tier_2_price: u64, // 100-199 engagement
        tier_3_price: u64, // 200-499 engagement
        tier_4_price: u64, // 500-999 engagement
        tier_5_price: u64, // 1000-4999 engagement
        tier_6_price: u64  // 5000+ engagement
    }

    fun init(ctx: &mut TxContext) {

        let content_registry = ContentRegistry {
            id: object::new(ctx),
            user_engagement: table::new(ctx),
            registered_content:vector::empty(),
            content_creator:table::new(ctx)
        };

        let token_pricing = TokenPricing {
            id: object::new(ctx),
            tier_1_price: 10_000_000, // 0.01 SUI
            tier_2_price: 20_000_000, // 0.02 SUI
            tier_3_price: 50_000_000, // 0.05 SUI
            tier_4_price: 100_000_000, // 0.1 SUI
            tier_5_price: 500_000_000, // 0.5 SUI
            tier_6_price: 1_000_000_000  //1 SUI
        };

        transfer::share_object(content_registry);
        transfer::share_object(token_pricing);
    }

// ==== PUblic functions ====

//user profile functions

    public fun create_user_profile(
        name:String,
        bio:String,
        ctx:&mut TxContext
    ) {
        let user_profile = UserProfile {
            id:object::new(ctx),
            name,
            bio,
            total_engagement: 0,
            published_contents:vector::empty()
        };
        transfer::transfer(user_profile, ctx.sender());
    }


//creator token functions only admin
    public fun create_token(
        _:&AdminCap,
        name:String,
        symbol:String,
        total_supply:u64,
        creator:address,
        ctx:&mut TxContext
    )
    {
        let creator_token = CreatorToken {
            id:object::new(ctx),
            name,
            symbol,
            total_supply,
            creator
        };
        transfer::transfer(creator_token, creator);
    }

    public fun buy_token(creator_token:&CreatorToken, token_number:u64) {
        //decrease the supply of total tokens
        //mint the token and transfer it
    }

     // Get token tier based on engagement
    public fun get_token_tier(engagement: u64): u8 {
        if (engagement < 100) { 1 }
        else if (engagement < 200) { 2 }
        else if (engagement < 500) { 3 }
        else if (engagement < 1000) { 4 }
        else if (engagement < 5000) { 5 }
        else { 6 }
    }

    // Get token price based on tier
    public fun get_token_price(
        token_pricing: &TokenPricing,
        tier: u8
    ): u64 {
        if (tier == 1) { token_pricing.tier_1_price }
        else if (tier == 2) { token_pricing.tier_2_price }
        else if (tier == 3) { token_pricing.tier_3_price }
        else if (tier == 4) { token_pricing.tier_4_price }
        else if (tier == 5) { token_pricing.tier_5_price }
        else { token_pricing.tier_6_price }
    }
    
    public fun mint_content (
        title: String,
        description: String,
        blob_id: String, 
        tag: vector<String>, 
        file_type: String,
        content_registry: &mut ContentRegistry,
        ctx: &mut TxContext
    ) {
        // check if the content is already created using the blob id.
        assert!(!content_registry.content_creator.contains(blob_id), EAlreadyRegisteredBlob);

        let sender = ctx.sender();
        let content = Content {
            id: object::new(ctx),  
            blob_id, 
            owner: sender, 
            title,
            description, 
            tag,
            file_type, 
        }; 
        content_registry.content_creator.add(blob_id, sender);
        let id = object::id(&content);
        content_registry.registered_content.push_back(id);

        table::add(&mut content_registry.content_creator, blob_id, sender);
        // transfer the content ownership to sender
        transfer::transfer(content, sender);
    }

    public fun calculate_user_total_engagement(user_profile:&mut UserProfile, content_registry:&mut ContentRegistry, total_likes:u64, followers:u64, comments:u64, ctx:&mut TxContext) {
        let sender = ctx.sender();
        let points = (total_likes + followers * 3 + comments * 2)/3;
        if (content_registry.user_engagement.contains(sender)) {
            let engagement = content_registry.user_engagement.borrow_mut(sender);
            *engagement = points;
        } else {
            table::add(&mut content_registry.user_engagement, sender, points);
        };
        user_profile.total_engagement = points;
    }



