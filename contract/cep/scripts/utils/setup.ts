import { SuiObjectChangePublished } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import getExecStuff from './execStuff';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

const getPackageId = async () => {
    let packageId = ''; 
    let ContentRegistry = '';
    let AdminCap = '';
    let UpgradeCap = '';


    try {
        const { keypair, client } = getExecStuff();
        // change account to your own address to deploy the contract
        const account = "0x422fcea4af57526d12efe8200c70598c46543fe73d3514ef291f5bdec0fd9f9c";
        const packagePath = process.cwd();
        const { modules, dependencies } = JSON.parse(
            execSync(`sui move build --silence-warnings --dump-bytecode-as-base64 --path ${packagePath} --skip-fetch-latest-git-deps`, {
                encoding: "utf-8",
            })
        );
        const tx = new TransactionBlock();
        const [upgradeCap] = tx.publish({
            modules,
            dependencies,
        });
        tx.transferObjects([upgradeCap], tx.pure(account));
        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
                showObjectChanges: true,
            }
        });
        console.log(result.digest);
        const digest_ = result.digest;

        packageId = ((result.objectChanges?.filter(
            (a) => a.type === 'published',
        ) as SuiObjectChangePublished[]) ?? [])[0].packageId.replace(/^(0x)(0+)/, '0x') as string;

        await sleep(10000);

        if (!digest_) {
            console.log("Digest is not available");
            return { packageId };
        }

        const txn = await client.getTransactionBlock({
            digest: String(digest_),
            options: {
                showEffects: true,
                showInput: false,
                showEvents: false,
                showObjectChanges: true,
                showBalanceChanges: false,
            },
        });
        let output: any;
        output = txn.objectChanges;

        for (let i = 0; i < output.length; i++) {
            const item = output[i];
            if (await item.type === 'created') {

                if (await item.objectType === `${packageId}::cep::ContentRegistry`) {
                    ContentRegistry = String(item.objectId);
                }

                if (await item.objectType === `${packageId}::roles::AdminCap`) {
                    AdminCap = String(item.objectId);
                }
                if (await item.objectType === `${packageId}::roles::AdminCap`) {
                    AdminCap = String(item.objectId);
                }
                if (await item.objectType === `0x2::package::UpgradeCap`) {
                    UpgradeCap = String(item.objectId);
               } 
            }
        }

        // Write the results to a file
        const content = `export let packageId = '${packageId}';
export let ContentRegistry = '${ContentRegistry}';
export let AdminCap = '${AdminCap}';
export let UpgradeCap = '${UpgradeCap}';\n`;

        await fs.writeFile(`${packagePath}/scripts/utils/packageInfo.ts`, content)

        return { packageId, ContentRegistry, AdminCap , UpgradeCap};
    } catch (error) {
        console.error(error);
        return { packageId, ContentRegistry, AdminCap,UpgradeCap};
    }
};

// Call the async function and handle the result.
getPackageId()
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });

export default getPackageId;
