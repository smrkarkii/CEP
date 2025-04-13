import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../../cep/scripts/utils/execStuff';
// import { packageId } from '../../cep/scripts/utils/packageInfo';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';

dotenv.config();

// Configuration - Replace these with your actual object IDs
// This should be the object ID of your shared ContentRegistry object from the blockchain
const CONTENT_REGISTRY_ID = "0x47501ba823e90874a2c78a3af3a125cccdb62df546477269f7f1f1e103d76c86"; 
// This should be the object ID of your existing coin that has enough balance
const COIN_OBJECT_ID = "0x6eac6af09998862d16f7e68a8caad690751e63ff0b851d0327004b0297a3e3ec"; 
// This should be the fully qualified type path for your token
const COIN_TYPE ="0xd34bc0997df3fc5b0face67a2b146c3e42fb95926a7819b12b6fb84cc210d6ce::beast::BEAST"; // Replace with your actual coin type


async function create_user_profile() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    // Parameters for create_user_profile function
    const name = "Smriti Karki";
    const bio = "Content creator passionate about blockchain technology";
    const creatorTokenName = "BEAST";
    const initialAmount = 1000000; // Initial supply of creator tokens
    const packageId = 0xa1d97168a230d9bc36e4fc0c629bc5e9d91f921a31122da887e72c25aa1609d6

    // Create a transaction to call create_user_profile
    tx.moveCall({
        target: `0xa1d97168a230d9bc36e4fc0c629bc5e9d91f921a31122da887e72c25aa1609d6::contenteconomy::create_user_profile`,
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