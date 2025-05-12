import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient, SuiObjectData } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID;
const CONTENT_REGISTRY = import.meta.env.VITE_APP_CONTENT_REGISTRY;

export async function getAllCreators(userAddress: string) {
  try {
    const tx = new TransactionBlock();
    const rpcUrl = import.meta.env.VITE_APP_FULLNODE_URL;
    const suiClient = new SuiClient({ url: rpcUrl });

    tx.moveCall({
      target: `${PACKAGE_ID}::contenteconomy::get_all_creators`,
      arguments: [tx.object(CONTENT_REGISTRY)],
    });

    const response = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: userAddress,
    });

    console.log("Raw Response:", response);

    if (!response.results?.[0]?.returnValues?.[0]) {
      throw new Error("No return value found");
    }

    // The raw byte array from the response
    const returnValues = response.results[0].returnValues[0][0];

    // Parse the address vector from the byte array
    const objectIds = extractObjectIdsFromBCS(returnValues);

    return objectIds;
  } catch (error) {
    console.error("Error getting creators:", error);
    throw error;
  }
}

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

export async function getCreatorObjectDetails(
  creatorObjectIds: string[]
): Promise<SuiObjectData[]> {
  try {
    const rpcUrl = import.meta.env.VITE_APP_FULLNODE_URL;
    const suiClient = new SuiClient({ url: rpcUrl });

    // Use Promise.all to fetch all object details in parallel
    const creatorObjects = await Promise.all(
      creatorObjectIds.map(async (objectId) => {
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
          console.warn(`Object data not found for ID: ${objectId}`);
          return null;
        }

        return response.data;
      })
    );

    // Filter out any null values (objects that couldn't be fetched)
    return creatorObjects.filter((obj): obj is SuiObjectData => obj !== null);
  } catch (error) {
    console.error("Error fetching creator object details:", error);
    throw error;
  }
}
