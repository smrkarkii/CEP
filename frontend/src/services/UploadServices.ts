import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const FULLNODE_URL = import.meta.env.VITE_APP_FULLNODE_URL as string;
const NETWORK = import.meta.env.VITE_APP_NETWORK as "testnet";
const CONTENT_REGISTRY = import.meta.env.VITE_APP_CONTENT_REGISTRY as string;

export const UploadContent = async (
  title: string,
  body: string,
  blobId: string,
  fileType: string,
  flow: any
) => {
  console.log(blobId, title, body, fileType, CONTENT_REGISTRY);

  try {
    const suiClient = new SuiClient({ url: FULLNODE_URL });
    const keypair = await flow.getKeypair({ network: NETWORK });
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${PACKAGE_ID}::contenteconomy::mint_content`,
      arguments: [
        tx.pure.string(title),
        tx.pure.string(body),
        tx.pure.string(blobId),
        tx.pure.string(fileType),
        tx.object(CONTENT_REGISTRY),
      ],
    });

    const txnRes = await suiClient.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
    });
    console.log("txnRes", txnRes);
    console.log("digest", txnRes.digest);
  } catch (error) {
    console.error("Error in content", error);
    throw error;
  }
};
