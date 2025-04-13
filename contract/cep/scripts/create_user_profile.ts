import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../../cep/scripts/utils/execStuff';
// import { packageId } from '../../cep/scripts/utils/packageInfo';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';

dotenv.config();

// Configuration - Replace these with your actual object IDs
// This should be the object ID of your shared ContentRegistry object from the blockchain
const CONTENT_REGISTRY_ID = "0xab71f73619a3bb971cdf56779e4f90a911f5928c6bd8f65891c349d77eb47911"; 
// This should be the object ID of your existing coin that has enough balance
const COIN_OBJECT_ID = "0x4c0977bfec6c43ed337cb7a7c7a9aa10f9a2a07f8b484e6b53e3ff55879eab76"; 
// This should be the fully qualified type path for your token
const COIN_TYPE ="0x2::coin::Coin<0x2bf060079a1b5b53e6e3ff91a630fd4e33c04382a11de8cfbbcbca4099f2f31e::sikri_harayo::SIKRI_HARAYO>"; // Replace with your actual coin type

async function create_user_profile() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    // Parameters for create_user_profile function
    const name = "Sikri Harayo";
    const bio = "Tiktoker Sikri Harayo";
    const creatorTokenName = "SIKRI_HARAYO";
    const initialAmount = 10; // Initial supply of creator tokens
    const packageId = 0x7569d195022a7b650eb2f633abf50f0f9b3ee1c56d5267d5cb6be2fe1df1bc93

    // Create a transaction to call create_user_profile
    tx.moveCall({
        target: `0x7569d195022a7b650eb2f633abf50f0f9b3ee1c56d5267d5cb6be2fe1df1bc93::contenteconomy::create_user_profile`,
        typeArguments: [COIN_TYPE], // The token type
        // typeArguments: ["0x2::sui::SUI"],
        arguments: [
            tx.pure.string(name),                // name
            tx.pure.string(bio),                 // bio
            tx.object(CONTENT_REGISTRY_ID),      // content_registry (as string ID)
            tx.pure.string(creatorTokenName),    // creator_token_name
            tx.object(COIN_OBJECT_ID),                                // creator_coin - using a split coin
            tx.pure.u64(initialAmount),         // initial_amount
        ],
    });

    const signer = await keypair.getPublicKey().toSuiAddress();
    console.log(`Transaction sender: ${signer}`);

    try {
        // Execute the transaction
        const result = await client.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: keypair,
            options: {
                showEffects: true,
                showEvents: true,
                showInput: true,
            },
        });

        console.log("Transaction successful!");
        console.log(`Transaction digest: ${result.digest}`);
        console.log(`Status: ${result.effects?.status}`);
        
        // Display created objects
        if (result.effects?.created) {
            console.log("Created objects:");
            result.effects.created.forEach((obj) => {
                console.log(`- ${obj.reference.objectId} (${obj.owner})`);
            });
        }

        // Display events
        if (result.events && result.events.length > 0) {
            console.log("Events:");
            result.events.forEach((event, i) => {
                console.log(`Event ${i}: ${inspect(event, false, null, true)}`);
            });
        }
    } catch (error) {
        console.error("Transaction failed:", error);
        // Add more detailed error information
        if (error.message) {
            console.error("Error message:", error.message);
        }
        // If there are nested errors, try to log those too
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

create_user_profile()