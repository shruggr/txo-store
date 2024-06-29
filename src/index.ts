import { Transaction } from '@bsv/sdk';
import { BlockHeaderService } from './block-headers';
import { FundIndexer } from './indexers/fund';
import { TxoStore } from './txo-store';
import { OriginIndexer } from './indexers/origin';
import { InscriptionIndexer } from './indexers/insc';
import { TxoLookup } from './models/txo';
import { OrdLockIndexer } from './indexers/ordlock';
import { Bsv21Indexer } from './indexers/bsv21';
import { Bsv20Indexer } from './indexers/bsv20';

const addresses = new Set<string>(['13AGuUcJKJm5JaT9qssFxK8DETo3tAaa66', '1FDHUkNu5QLH1XhdjJ3tpcEVSetB5QhnCZ'])

const indexers = [
    new FundIndexer(),
    new OrdLockIndexer(),
    new InscriptionIndexer(),
    new Bsv21Indexer(),
    new Bsv20Indexer(),
    new OriginIndexer(),
]
const store = new TxoStore('test', indexers, addresses)

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

async function ingestTxid() {
    try {
        const txid = (document.getElementById('txid') as HTMLInputElement).value
        if (!txid) return
        const tx = await store.getTx(txid, true)
        if (!tx) {
            throw new Error('Tx not found')
        }
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
    let resp = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${address}/unspent?limit=100`);
    const txos = await resp.json() as {outpoint: string, origin: {outpoint: string}}[];
    for (let txo of txos) {
        if (txo.origin) {
            const resp = await fetch(`https://ordinals.gorillapool.io/api/inscriptions/${txo.origin.outpoint}/history?limit=100000`);
            const txos = await resp.json() as {outpoint: string, origin: {outpoint: string}}[];
            for await (let txo of txos) {
                console.log("fast forward", txo.origin.outpoint, txo.outpoint)
                const [txid] = txo.outpoint.split('_');
                const tx = await store.getTx(txid, true);
                await store.ingest(tx!, true);
            }
        } else {
            const [txid] = txo.outpoint.split('_');
            const tx = await store.getTx(txid, true);
            await store.ingest(tx!, true);
        }
    }
    resp = await fetch(`https://ordinals.gorillapool.io/api/bsv20/${address}/balance`);
    const balance = await resp.json() as {id?: string}[];
    for await(let token of balance) {
        if(!token.id) continue
        console.log("importing", token.id)
        try {
            resp = await fetch(`https://ordinals.gorillapool.io/api/bsv20/${address}/id/${token.id}/txids`);
            const txids = await resp.json() as string[];
            for await (let txid of txids) {
                console.log("importing", token.id, txid)
                const tx = await store.getTx(txid, true);
                await store.ingest(tx!, true);
            }
        } catch (e) {
            console.error(e)
        }
    }

    console.log('done importing')
}

async function crawlBsv21(id: string, txid: string, descentants: string[] = [], queued?: Set<string>): Promise<string[]>{
    if(!queued) {
        queued = new Set<string>();
    } else if(queued.has(txid)) {
        return descentants
    }
    descentants.unshift(txid);
    queued.add(txid);

    if(!id.startsWith(txid)) {
        console.log("find parents", id, txid)
        const resp = await fetch(`https://ordinals.gorillapool.io/api/bsv20/spends/${txid}`);
        const txos = await resp.json() as {txid: string, id: string}[];
        for await(let txo of txos) {
            if(txo.id != id) continue;
            if(queued.has(txo.txid)) continue;
            descentants = await crawlBsv21(id, txo.txid, descentants, queued);
        }
    }
    return descentants;
}

async function search() {
    const indexer = (document.getElementById('indexer') as HTMLInputElement).value
    const id = (document.getElementById('id') as HTMLInputElement).value
    const value = (document.getElementById('value') as HTMLInputElement).value
    const spent = (document.getElementById('unspent') as HTMLInputElement).checked ? false : undefined
    const results = await store.searchTxos(new TxoLookup(indexer, id, value, spent));

    (document.getElementById('inventory') as HTMLDivElement).innerHTML = 
        JSON.stringify(results.txos, null, 2)
}

window.onload = function() {
    (document.getElementById('ingestBeef') as HTMLButtonElement).onclick = ingestBeef;
    (document.getElementById('ingestTxid') as HTMLButtonElement).onclick = ingestTxid;
    (document.getElementById('import') as HTMLButtonElement).onclick = importAddress;
    (document.getElementById('search') as HTMLButtonElement).onclick = search;
}