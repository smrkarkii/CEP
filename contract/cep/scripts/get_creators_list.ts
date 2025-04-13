import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import getExecStuff from '../../cep/scripts/utils/execStuff';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';

// Configuration
const PACKAGE_ID = "0x7569d195022a7b650eb2f633abf50f0f9b3ee1c56d5267d5cb6be2fe1df1bc93";
const CONTENT_REGISTRY = "0xab71f73619a3bb971cdf56779e4f90a911f5928c6bd8f65891c349d77eb47911";

async function getAllCreators() {
  try {
    const { keypair, client } = getExecStuff();
    const senderAddress = await keypair.getPublicKey().toSuiAddress();
    
    console.log("Sender address:", senderAddress);
    console.log("Package ID:", PACKAGE_ID);
    console.log("Content Registry ID:", CONTENT_REGISTRY);

    const tx = new TransactionBlock();

    // Important: Make sure the module path is correct
    // If your module is in the cep namespace, use contenteconomy::get_all_creators
    // If it's directly in the package root, use cep::contenteconomy::get_all_creators
    tx.moveCall({
      target: `${PACKAGE_ID}::contenteconomy::get_all_creators`,
      arguments: [tx.object(CONTENT_REGISTRY)],
    });

    // Use devInspectTransactionBlock to read data without executing a transaction
    const response = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: senderAddress,
    });

    console.log("Raw Response:", JSON.stringify(response, null, 2));

    if (!response.results?.[0]?.returnValues?.[0]) {
      throw new Error("No return value found");
    }

    const returnValues = response.results[0].returnValues[0];
    console.log("Return values:", returnValues);

    // Extract object IDs from BCS-encoded data
    const objectIds = extractObjectIdsFromBCS(returnValues[0]);
    console.log("Extracted creator IDs:", objectIds);

    // If you want to fetch the actual objects
    if (objectIds.length > 0) {
      const creatorObjects = await getCreatorObjects(objectIds, client);
      console.log("Creator objects:", inspect(creatorObjects, false, null, true));
    }

    return objectIds;
  } catch (error) {
    console.error("Error getting creators:", error);
    throw error;
  }
}

/**
 * Extracts object IDs from BCS-encoded data
 * The data is a BCS-encoded vector of Sui Object IDs
 */
function extractObjectIdsFromBCS(byteArray: number[]): string[] {
  try {
    // Try using the bcs library first
    const decodedValue = bcs.de('vector<address>', Uint8Array.from(byteArray));
    return decodedValue.map(addr => addr.toString());
  } catch (error) {
    console.error("Error decoding with BCS library:", error);
    
    // Fall back to manual extraction
    const objectIds: string[] = [];
    // First byte indicates the number of elements in the vector
    const count = byteArray[0];
    // Each object ID is 32 bytes (or 20 bytes if the network uses 20-byte addresses)
    const idLength = 32;
    // Start from index 1 (after the count byte)
    let currentIndex = 1;

    for (let i = 0; i < count; i++) {
      // Extract bytes for each object ID
      const idBytes = byteArray.slice(currentIndex, currentIndex + idLength);
      // Convert to hex string with 0x prefix
      const objectId = "0x" + Array.from(idBytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      
      objectIds.push(objectId);
      // Move to the next ID
      currentIndex += idLength;
    }

    return objectIds;
  }
}

async function getCreatorObjects(objectIds: string[], client: SuiClient) {
  try {
    // Use multiGetObjects to fetch multiple objects in a single request
    const response = await client.multiGetObjects({
      ids: objectIds,
      options: {
        showContent: true,
        showOwner: true,
        showDisplay: true,
        showType: true,
      },
    });

    // Filter out any null or undefined objects
    return response
      .filter((obj) => obj && obj.data)
      .map((obj) => obj.data);
  } catch (error) {
    console.error("Error fetching creator objects:", error);
    throw error;
  }
}

// Execute the function
getAllCreators().catch(error => {
  console.error("Script failed:", error);
});