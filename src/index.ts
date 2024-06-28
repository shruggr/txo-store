import { Transaction } from '@bsv/sdk';
import { BlockHeaderService } from './block-headers';
import { PaymentsIndexer } from './indexers/payments';
import { TxoStore } from './txo-store';
import { OriginIndexer } from './indexers/origin/origin';
import { OrdIndexer } from './indexers/ord/ord';

const addresses = new Set<string>(['13AGuUcJKJm5JaT9qssFxK8DETo3tAaa66', '1FDHUkNu5QLH1XhdjJ3tpcEVSetB5QhnCZ'])
const payments = new PaymentsIndexer(addresses)
const origin = new OriginIndexer()
const ord = new OrdIndexer()
const store = new TxoStore(
    'test', 
    [payments, ord, origin],
)

const blockHeaderService = new BlockHeaderService()
blockHeaderService.syncBlocks()


async function ingestBeef() {
    try {
        const beef = (document.getElementById('beef') as HTMLInputElement).value
        if (!beef) return
        const tx = Transaction.fromHexBEEF(beef)
        // const valid = await tx.verify(blockHeaderService)
        // if (!valid) {
        //     throw new Error('Invalid beef')
        // }
        console.log(await store.ingest(tx, true))
    } catch (e) {
        console.error(e)
    }
}

async function importAddress() {
    const address = (document.getElementById('address') as HTMLInputElement).value
    const resp = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${address}/unspent`);
    const txos = await resp.json() as {outpoint: string, origin: {outpoint: string}}[];
    for (let txo of txos) {
        if (!txo.origin) {
            const [txid] = txo.outpoint.split('_');
            const tx = await store.getTx(txid, true);
            await store.ingest(tx!, true);
        } else {
            const resp = await fetch(`https://ordinals.gorillapool.io/api/inscriptions/${txo.origin.outpoint}/history`);
            const txos = await resp.json() as {outpoint: string, origin: {outpoint: string}}[];
            for await (let txo of txos) {
                console.log("fast forward", txo.origin.outpoint, txo.outpoint)
                const [txid] = txo.outpoint.split('_');
                const tx = await store.getTx(txid, true);
                await store.ingest(tx!, true);
            }
        }

    }
}

async function search() {
    const indexer = (document.getElementById('indexer') as HTMLInputElement).value
    const id = (document.getElementById('id') as HTMLInputElement).value
    const value = (document.getElementById('value') as HTMLInputElement).value
    const spent = (document.getElementById('spent') as HTMLInputElement).checked
    const txos = await store.findTxos(indexer, id, value, spent);
    (document.getElementById('inventory') as HTMLDivElement).innerHTML = JSON.stringify(txos, null, 2) as string
}

window.onload = function() {
    (document.getElementById('ingest') as HTMLButtonElement).onclick = ingestBeef;
    (document.getElementById('import') as HTMLButtonElement).onclick = importAddress;
    (document.getElementById('search') as HTMLButtonElement).onclick = search;
}