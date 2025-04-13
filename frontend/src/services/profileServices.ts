import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const FULLNODE_URL = import.meta.env.VITE_APP_FULLNODE_URL as string;
const NETWORK = import.meta.env.VITE_APP_NETWORK as "testnet";
const CONTENT_REGISTRY = import.meta.env.VITE_APP_CONTENT_REGISTRY as string;
const COIN_OBJECT_ID = import.meta.env.VITE_APP_BEAST_OBJECT_ID as string;
const COIN_TYPE = import.meta.env.VITE_APP_BEAST_COIN_TYPE as string;

export const CreateUserProfile = async (
  name: string,
  bio: string,
  flow: any
) => {
  const suiClient = new SuiClient({ url: FULLNODE_URL });
  const keypair = await flow.getKeypair({ network: NETWORK });
  const tx = new TransactionBlock();
  const signer = await keypair.getPublicKey().toSuiAddress();

  console.log("Transaction sender:", signer);
  console.log("Content registry:", CONTENT_REGISTRY);

  const creatorTokenName = "BEAST";
  const initialAmount = 10;

  // Fetch coins of the specific type owned by the user
  const coins = await suiClient.getCoins({
    owner: signer,
    coinType: COIN_TYPE,
  });

  console.log(`Available ${COIN_TYPE} coins:`, coins.data);

  if (coins.data.length === 0) {
    throw new Error(
      `No coins of type ${COIN_TYPE} found for address ${signer}`
    );
  }

  // Use the coin with the highest balance
  const coinToUse = coins.data.reduce(
    (max, current) =>
      BigInt(current.balance) > BigInt(max.balance) ? current : max,
    coins.data[0]
  );

  console.log("Using coin:", coinToUse);

  if (BigInt(coinToUse.balance) < BigInt(initialAmount)) {
    throw new Error(
      `Insufficient balance. Required: ${initialAmount}, Available: ${coinToUse.balance}`
    );
  }

  tx.moveCall({
    target: `${PACKAGE_ID}::contenteconomy::create_user_profile`,
    typeArguments: [COIN_TYPE],
    arguments: [
      tx.pure.string(name), // name
      tx.pure.string(bio), // bio
      tx.object(CONTENT_REGISTRY), // content_registry
      tx.pure.string(creatorTokenName), // creator_token_name
      tx.object(coinToUse.coinObjectId), // Pass the coin object directly
      tx.pure.u64(initialAmount), // initial_amount
    ],
  });

  try {
    const result = await suiClient.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showEvents: true,
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
        console.log(`Event ${i}:`, event);
      });
    }

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};

export const getIsCreator = async (userAddress: string) => {
  try {
    const tx = new TransactionBlock();
    const rpcUrl = import.meta.env.VITE_APP_FULLNODE_URL;
    const suiClient = new SuiClient({ url: rpcUrl });

    tx.moveCall({
      target: `${PACKAGE_ID}::contenteconomy::get_is_creator`,
      arguments: [tx.object(CONTENT_REGISTRY), tx.pure.address(userAddress)],
    });

    const response = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: userAddress,
    });

    // console.log("Raw Response:", response);

    if (!response.results?.[0]?.returnValues?.[0]) {
      throw new Error("No return value found");
    }

    const creatorStatus = response.results[0].returnValues[0][0][0];

    return creatorStatus;
  } catch (err) {
    console.log(err);
  }
};

export const AddSui = async (flow: any) => {
  const suiClient = new SuiClient({ url: FULLNODE_URL });
  const keypair = await flow.getKeypair({ network: NETWORK });
  const tx = new TransactionBlock();

  const amountToAdd = 1000000000;

  // Split some SUI from the gas payment for the transaction
  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(amountToAdd)]);
  tx.moveCall({
    target: `${PACKAGE_ID}::exchange::add_sui`,
    typeArguments: [COIN_TYPE],
    arguments: [
      tx.object(
        "0xd3288b60e5478fabb8d460efac5d0c077e5106d59183d8635f816dceabd0b911"
      ), //exchange
      payment, // sui coin
      tx.pure.u64(amountToAdd),
    ],
  });
  tx.transferObjects([payment], keypair.getPublicKey().toSuiAddress());
  try {
    const result = await suiClient.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: keypair,
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
        console.log(`Event ${i}:`, event);
      });
    }

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};
