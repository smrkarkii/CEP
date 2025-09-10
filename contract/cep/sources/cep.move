module cep::contenteconomy;

    use std::string::{String};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use cep::roles::{AdminCap};
    use std::vector; 
    use sui::coin::{Coin};
    use sui::sui::{SUI};
    use sui::balance::{Balance};
    use cep::exchange::{Self, Exchange};

    //Errors

    // Error constants
    const EAlreadyRegisteredBlob: u64 = 0;
    const EInsufficientSupply: u64 = 1;
    const EInsufficientFunds: u64 = 2;
    const EInvalidTokenAmount: u64 = 3;
    const EUserNotFound: u64 = 4;
    const ETokenNotFound: u64 = 5;
    const EExchangeNotFound: u64 = 6;

    const PLATFORM_FEE: u64 = 250; // 2.5%

    //structs

    public struct ContentRegistry has key {
        id: UID,
        user_engagement:Table<address, u64>,//points/engangement per  user
        // registered_content:vector<ID>,//arrays of content id
        content_creator:Table<String, address>,//owner of blob
        token_holders:Table<address, Table<String, u64>>,//track ueers to theri token balances
        user_content:Table<address, vector<ID>>,//all content of a iser
        exchanges: Table<String, ID>,
        creators_list:vector<ID>,//list of userprofile id
        is_creator:Table<address, bool>
    }

    public struct Content has key, store {
        id: UID, 
        blob_id: String, 
        owner: address, 
        title: String, 
        description: String,
        file_type: String, 
    }

    public struct UserProfile has key {
        id:UID,
        name:String,
        bio:String,
        total_engagement:u64,
        published_contents:vector<ID>,//vector of the contents id,
        creator_coin:Option<String>,//token-name or symbol of the users_creator
    }

    fun init(ctx: &mut TxContext) {

        let content_registry = ContentRegistry {
            id: object::new(ctx),
            user_engagement: table::new(ctx),
            // registered_content:vector::empty(),
            content_creator:table::new(ctx),
            token_holders:table::new(ctx),
            exchanges:table::new(ctx),
            user_content: table::new(ctx),
            creators_list:vector::empty(),
            is_creator:table::new(ctx)
        };

        transfer::share_object(content_registry);
    }

// ==== PUblic functions ====

//user profile functions

    public fun create_user_profile<T>(
        name:String,
        bio:String,
        content_registry:&mut ContentRegistry,
        creator_token_name:String,
        creator_coin: &mut Coin<T>,
        initial_amount:u64,
        ctx:&mut TxContext
    ) {
        let user_profile = UserProfile {
            id:object::new(ctx),
            name,
            bio,
            total_engagement: 0,
            published_contents:vector::empty(),
            creator_coin: option::none()
        };
        //create exchange 
        let exchange_admin_cap = exchange::new_funded<T>(creator_coin, initial_amount, ctx);
        let exchange_id = object::id(&exchange_admin_cap);
        // Store the exchange admin cap with the creator
        transfer::public_transfer(exchange_admin_cap, ctx.sender());
        // Register the exchange in the content registry
        table::add(&mut content_registry.exchanges, creator_token_name, exchange_id);
        content_registry.creators_list.push_back(object::id(&user_profile));
        content_registry.is_creator.add(ctx.sender(), true);
        transfer::transfer(user_profile, ctx.sender());
    }

    public fun buy_creator_tokens<T>(
        exchange:&mut Exchange<T>,
        content_registry: &mut ContentRegistry,
        creator_token_name: String,
        payment: Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
        ) {
            // Get the exchange ID for the creator token
        assert!(table::contains(&content_registry.exchanges, creator_token_name), ETokenNotFound);
        let creator_coin = exchange::exchange_all_for_creator_coin<T>(exchange, payment, ctx);

        transfer::public_transfer(creator_coin, ctx.sender());

            // Update token holdings in registry
        let sender = tx_context::sender(ctx);
        if (!table::contains(&content_registry.token_holders, sender)) {
            table::add(&mut content_registry.token_holders, sender, table::new(ctx));
        };
        
        let token_table = table::borrow_mut(&mut content_registry.token_holders, sender);
        
        if (table::contains(token_table, creator_token_name)) {
            let token_count = table::borrow_mut(token_table, creator_token_name);
            *token_count = *token_count + amount;
        } else {
            table::add(token_table, creator_token_name, amount);
        }
    } 

       // Sell creator tokens
    public fun sell_creator_tokens<T>(
        exchange:&mut Exchange<T>,
        content_registry: &mut ContentRegistry,
        creator_token_name: String,
        creator_coin: Coin<T>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(amount > 0, EInvalidTokenAmount);
        
        // Get the exchange ID for the creator token
        assert!(table::contains(&content_registry.exchanges, creator_token_name), ETokenNotFound);        
        // Execute the exchange
        let sui_coins = exchange::exchange_all_for_sui<T>(exchange, creator_coin, ctx);
        
        // Transfer the SUI coins to the seller
        transfer::public_transfer(sui_coins, tx_context::sender(ctx));
        
        // Update token holdings in registry
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&content_registry.token_holders, sender), EUserNotFound);
        
        let token_table = table::borrow_mut(&mut content_registry.token_holders, sender);
        
        assert!(table::contains(token_table, creator_token_name), ETokenNotFound);
        let token_count = table::borrow_mut(token_table, creator_token_name);
        assert!(*token_count >= amount, EInsufficientFunds);
        
        *token_count = *token_count - amount;
    }
    

    
    public fun mint_content (
        title: String,
        description: String,
        blob_id: String, 
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
            file_type, 
        }; 
        content_registry.content_creator.add(blob_id, sender);
        let id = object::id(&content);
        // content_registry.registered_content.push_back(id);
        // Check if the entry exists first, if not create it
if (!table::contains(&content_registry.user_content, sender)) {
    table::add(&mut content_registry.user_content, sender, vector::empty<ID>());
};

// Now it's safe to borrow and modify
let vec = table::borrow_mut(&mut content_registry.user_content, sender);
vector::push_back(vec, id);
        
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

    //getter functions
    public fun get_all_contents_by_user(content_registry:& ContentRegistry, user:address):vector<ID> {
          *content_registry.user_content.borrow(user)
    }
    
    public fun get_all_content_creators_user_profile(content_registry:& ContentRegistry):vector<ID> {
          content_registry.creators_list
    }
    public fun get_is_creator(content_registry:& ContentRegistry, user:address):bool{
          content_registry.is_creator.contains(user)
    }

    public fun get_all_creators(content_registry:&ContentRegistry): vector<ID> {
        content_registry.creators_list
    }
    

    


