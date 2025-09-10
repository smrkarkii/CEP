import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../../cep/scripts/utils/execStuff';
import { } from '../../cep/scripts/utils/packageInfo';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';

dotenv.config();

// Configuration - Replace these with your actual object IDs
const CONTENT_REGISTRY_ID = "0x47501ba823e90874a2c78a3af3a125cccdb62df546477269f7f1f1e103d76c86";
const EXCHANGE_ID = ""; // Replace with the exchange object ID
const SUI_COIN_TYPE = "0x2::sui::SUI";
const packageId = 0xa1d97168a230d9bc36e4fc0c629bc5e9d91f921a31122da887e72c25aa1609d6
const CREATOR_TOKEN_TYPE = "0xd34bc0997df3fc5b0face67a2b146c3e42fb95926a7819b12b6fb84cc210d6ce::beast::BEAST"; // Replace with your token type

async function add_sui() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    // Parameters for buy_creator_tokens function
    const creatorTokenName = "BEAST"; // The name of the creator token you want to buy
    const amountToBuy = 1; // Amount of creator tokens to buy (just 1)
    
    // Exchange rate is 5 creator coins to 1 SUI
    // To buy 1 creator coin, we need 1/5 = 0.2 SUI
    // Since SUI is measured in MIST (10^9 MIST = 1 SUI), we need 0.2 * 10^9 = 200,000,000 MIST
    const paymentAmount = 200000000; // 0.2 SUI in MIST

    // Split some SUI from the gas payment for the transaction
    const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);

    // Call the buy_creator_tokens function
    tx.moveCall({
        target: `0xa1d97168a230d9bc36e4fc0c629bc5e9d91f921a31122da887e72c25aa1609d6::exchange::add_sui`,
        typeArguments: [CREATOR_TOKEN_TYPE], // The token type you're buying
        arguments: [
            tx.object("0xf628948f87093aab23ce07de04c75de5cf9571a3e1b0a1d7757bd164f485d652"),   //exchange          // exchange
            tx.object(CONTENT_REGISTRY_ID),     // content_registry
            tx.pure.string(creatorTokenName),   // creator_token_name
            payment,                            // payment in SUI
            tx.pure.u64(amountToBuy),           // amount of tokens to buy
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

        // Display balance changes
        if (result.balanceChanges) {
            console.log("Balance changes:");
            result.balanceChanges.forEach((change) => {
                // console.log(`- Owner: ${change.owner.AddressOwner}`);
                console.log(`  Coin type: ${change.coinType}`);
                console.log(`  Amount: ${change.amount}`);
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

buy_creator_tokens();