import { MerklePath, Transaction } from '@bsv/sdk';
import fs from 'fs';

async function main() {
    await getPaymentBeefs('13AGuUcJKJm5JaT9qssFxK8DETo3tAaa66')
    // await getOrdBeefs('1FDHUkNu5QLH1XhdjJ3tpcEVSetB5QhnCZ')
}

async function getPaymentBeefs(address: string) {
    const resp = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${address}/unspent`);
    const txids = new Set<string>();
    const txos = await resp.json() as {outpoint: string, }[];
    for (let txo of txos) {
        const [txid] = txo.outpoint.split('_');
        txids.add(txid);
    }

}

// async function toBEEF(tx: Transaction): number[] {
//     const writer = new Writer()
//     writer.writeUInt32LE(4022206465)
//     const BUMPs: MerklePath[] = []
//     const txs: Array<{ tx: Transaction, pathIndex?: number }> = []

//     // Recursive function to add paths and input transactions for a TX
//     const addPathsAndInputs = (tx: Transaction): void => {
//       const obj: { tx: Transaction, pathIndex?: number } = { tx }
//       const hasProof = typeof tx.merklePath === 'object'
//       if (hasProof) {
//         let added = false
//         // If this proof is identical to another one previously added, we use that first. Otherwise, we try to merge it with proofs from the same block.
//         for (let i = 0; i < BUMPs.length; i++) {
//           if (BUMPs[i] === tx.merklePath) { // Literally the same
//             obj.pathIndex = i
//             added = true
//             break
//           }
//           if (BUMPs[i].blockHeight === tx.merklePath?.blockHeight) {
//             // Probably the same...
//             const rootA = BUMPs[i].computeRoot()
//             const rootB = tx.merklePath.computeRoot()
//             if (rootA === rootB) {
//               // Definitely the same... combine them to save space
//               BUMPs[i].combine(tx.merklePath)
//               obj.pathIndex = i
//               added = true
//               break
//             }
//           }
//         }
//         // Finally, if the proof is not yet added, add a new path.
//         if (!added) {
//           obj.pathIndex = BUMPs.length
//           BUMPs.push(tx.merklePath)
//         }
//       }
//       const duplicate = txs.some(x => x.tx.id('hex') === tx.id('hex'))
//       if (!duplicate) {
//         txs.unshift(obj)
//       }
//       if (!hasProof) {
//         for (let i = 0; i < tx.inputs.length; i++) {
//           const input = tx.inputs[i]
//           if (typeof input.sourceTransaction !== 'object') {
//             throw new Error('A required source transaction is missing!')
//           }
//           addPathsAndInputs(input.sourceTransaction)
//         }
//       }
//     }

//     addPathsAndInputs(tx)

//     writer.writeVarIntNum(BUMPs.length)
//     for (const b of BUMPs) {
//       writer.write(b.toBinary())
//     }
//     writer.writeVarIntNum(txs.length)
//     for (const t of txs) {
//       writer.write(t.tx.toBinary())
//       if (typeof t.pathIndex === 'number') {
//         writer.writeUInt8(1)
//         writer.writeVarIntNum(t.pathIndex)
//       } else {
//         writer.writeUInt8(0)
//       }
//     }
//     return writer.toArray()
//   }

main().catch(console.error).then(() => process.exit(0));