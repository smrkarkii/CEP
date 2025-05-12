import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient, SuiObjectData } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const CONTENT_REGISTRY = import.meta.env.VITE_APP_CONTENT_REGISTRY as string;

export async function getAllContentsByUser(userAddress: string) {
  try {
    const tx = new TransactionBlock();
    const rpcUrl = import.meta.env.VITE_APP_FULLNODE_URL;
    const suiClient = new SuiClient({ url: rpcUrl });

    tx.moveCall({
      target: `${PACKAGE_ID}::contenteconomy::get_all_contents_by_user`,
      arguments: [tx.object(CONTENT_REGISTRY), tx.pure.address(userAddress)],
    });

    const response = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: userAddress,
    });

    console.log("Raw Response:", response);

    if (!response.results?.[0]?.returnValues?.[0]) {
      throw new Error("No return value found");
    }

    const returnValues = response.results[0].returnValues[0];

    // Extract object IDs from BCS-encoded data
    const objectIds = extractObjectIdsFromBCS(returnValues[0]);

    return objectIds;
  } catch (error) {
    console.error("Error getting content by user:", error);
    throw error;
  }
}

/**
 * Extracts object IDs from BCS-encoded data
 *
 * The data is a BCS-encoded vector of Sui Object IDs.
 * - First byte is the length of the vector
 * - Each Object ID is 32 bytes
 */
function extractObjectIdsFromBCS(byteArray: number[]): string[] {
  const objectIds: string[] = [];

  // First byte indicates the number of elements in the vector
  const count = byteArray[0];

  // Each object ID is 32 bytes long
  const idLength = 32;

  // Start from index 1 (after the count byte)
  let currentIndex = 1;

  for (let i = 0; i < count; i++) {
    // Extract 32 bytes for each object ID
    const idBytes = byteArray.slice(currentIndex, currentIndex + idLength);

    // Convert to hex string with 0x prefix
    const objectId =
      "0x" +
      Array.from(idBytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    objectIds.push(objectId);

    // Move to the next ID
    currentIndex += idLength;
  }

  return objectIds;
}

export async function getContentObject(
  objectId: string
): Promise<SuiObjectData | null> {
  try {
    const rpcUrl = import.meta.env.VITE_APP_FULLNODE_URL;
    const suiClient = new SuiClient({ url: rpcUrl });

    const response = await suiClient.getObject({
      id: objectId,
      options: {
        showContent: true,
        showOwner: true,
        showDisplay: true,
        showType: true,
      },
    });

    if (!response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching content object ${objectId}:`, error);
    throw error;
  }
}

export async function getContentObjects(
  objectIds: string[]
): Promise<SuiObjectData[]> {
  try {
    const rpcUrl = import.meta.env.VITE_APP_FULLNODE_URL;
    const suiClient = new SuiClient({ url: rpcUrl });

    // Use multiGetObjects to fetch multiple objects in a single request
    const response = await suiClient.multiGetObjects({
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
      .map((obj) => obj.data as SuiObjectData);
  } catch (error) {
    console.error("Error fetching content objects:", error);
    throw error;
  }
}
