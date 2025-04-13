import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const FULLNODE_URL = import.meta.env.VITE_APP_FULLNODE_URL as string;
const NETWORK = import.meta.env.VITE_APP_NETWORK as "testnet";
const CONTENT_REGISTRY = import.meta.env.VITE_APP_CONTENT_REGISTRY as string;
const COIN_OBJECT_ID =
  "0xfffc611f1f5d38441ec7035df1415b6cf16ef4627c34f04ca4cfa62c4daf1f30";
const COIN_TYPE =
  "0x2c6e03dbece192364ce5aa0ca4ef998b14bc2ffa743d8ea948bf1ef1bb34ef63::beast::BEAST";

export const CreateUserProfile = async (
  name: string,
  bio: string,
  flow: any
) => {
  const suiClient = new SuiClient({ url: FULLNODE_URL });
  const keypair = await flow.getKeypair({ network: NETWORK });
  const tx = new TransactionBlock();

  const creatorTokenName = "BEAST";
  const initialAmount = 1000000;

  // Create a transaction to call create_user_profile
  tx.moveCall({
    target: `${PACKAGE_ID}::contenteconomy::create_user_profile`,
    typeArguments: [COIN_TYPE], // The token type
    // typeArguments: ["0x2::sui::SUI"],
    arguments: [
      tx.pure.string(name), // name
      tx.pure.string(bio), // bio
      tx.object(CONTENT_REGISTRY), // content_registry (as string ID)
      tx.pure.string(creatorTokenName), // creator_token_name
      tx.object(COIN_OBJECT_ID), // creator_coin - using a split coin
      tx.pure.u64(initialAmount), // initial_amount
    ],
  });

  const signer = await keypair.getPublicKey().toSuiAddress();
  console.log(`Transaction sender: ${signer}`);

  try {
    // Execute the transaction
    const result = await suiClient.signAndExecuteTransactionBlock({
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
};
