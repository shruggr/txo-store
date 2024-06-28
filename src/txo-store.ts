import { MerklePath, Transaction } from "@bsv/sdk";
import type { Indexer } from "./models/indexer";
import type { IndexContext } from "./models/index-context";
import { openDB, type DBSchema, type IDBPDatabase } from "@tempfix/idb";
import { Txo } from "./models/txo";
import { TxnStatus, type Txn } from "./models/txn";
import { BlockHeaderService } from "./block-headers";
import type { Block } from "./models/block";

const VERSION = 1

export interface TxoSchema extends DBSchema {
    txos: {
        key: [string, number]
        value: Txo
        indexes: {
            events: string
        }
    }
    txns: {
        key: string
        value: Txn
    }
}

export class TxoStore {
    db: Promise<IDBPDatabase<TxoSchema>>
    blocks = new BlockHeaderService()
    constructor(
        public accountId: string,
        public indexers: Indexer[] = [],
    ) {
        this.db = openDB<TxoSchema>(`txostore-${accountId}`, VERSION, {
            upgrade(db) {
                const txos = db.createObjectStore('txos', { keyPath: ['txid', 'vout'] })
                txos.createIndex('events', 'events', { multiEntry: true })
                db.createObjectStore('txns', { keyPath: 'txid' })
            }
        })
    }

    async getTx(txid: string, fromRemote = false): Promise<Transaction | undefined> {
        let txn = await (await this.db).get('txns', txid)
        if (txn) {
            const tx = Transaction.fromBinary(Array.from(new Uint8Array(txn.rawtx)))
            tx.merklePath = MerklePath.fromBinary(Array.from(txn.proof))
            return tx
        }
        if (!fromRemote) return
        console.log('Fetching', txid)
        const [rawtx, proof] = await Promise.all([
            fetch(`https://junglebus.gorillapool.io/v1/transaction/get/${txid}/bin`)
                .then(resp => resp.arrayBuffer()),
            fetch(`https://junglebus.gorillapool.io/v1/transaction/proof/${txid}`)
                .then(resp => resp.arrayBuffer()),
        ]);
        const tx = Transaction.fromBinary(Array.from(new Uint8Array(rawtx)));
        tx.merklePath = MerklePath.fromBinary(Array.from(new Uint8Array(proof)));
        txn = { 
            txid,
            rawtx: new Uint8Array(rawtx), 
            proof: new Uint8Array(proof), 
            block: {
                height: tx.merklePath.blockHeight,
                idx: BigInt(tx.merklePath.path[0].find(p => p.hash == txid)?.offset || 0)
            },
            status: TxnStatus.CONFIRMED,
        }
        await (await this.db).put('txns', txn)
        return tx
    }

    async getTxo(txid: string, vout: number): Promise<Txo | undefined> {
        return (await this.db).get('txos', [txid, vout])
    }

    async findTxos(indexer: string, id: string, value?: string, spent?: boolean): Promise<Txo[]> {
        const dbkey = Txo.buildQueryKey(indexer, id, value, spent)
        const txos = await (await this.db).getAllFromIndex('txos', 'events', IDBKeyRange.bound(dbkey, dbkey + '\uffff', true, false))
        return txos.map(d => Txo.fromObject(d))
    }

    async ingest(tx: Transaction, fromRemote = false): Promise<IndexContext> {
        const txid = tx.id('hex') as string
        let block = {
            height: Date.now(),
            idx: 0n
        } as Block
        if (tx.merklePath) {
            const txHash = tx.hash('hex')
            const idx = tx.merklePath.path[0].find(p => p.hash == txHash)?.offset || 0
            block.height = tx.merklePath.blockHeight
            block.idx = BigInt(idx)
            block.hash = await this.blocks.getHashByHeight(tx.merklePath.blockHeight)
        }

        const ctx: IndexContext = {
            txid,
            tx,
            block,
            spends: [],
            txos: [],
        }

        for (const input of tx.inputs) {
            if (!input.sourceTXID) input.sourceTXID = input.sourceTransaction!.id('hex') as string
            if (input.sourceTransaction) {
                if (await (await this.db).getKey('txns', input.sourceTXID)) {
                    continue
                }
                await this.ingest(input.sourceTransaction)
            } else {
                input.sourceTransaction = await this.getTx(input.sourceTXID!, fromRemote)
                if (!input.sourceTransaction) throw new Error(`Failed to get source tx ${input.sourceTXID!}`)
            }
        }

        const t = (await this.db).transaction('txos', 'readwrite')

        for await (const [vin, input] of tx.inputs.entries()) {
            let data = await t.store.get([input.sourceTXID!, input.sourceOutputIndex])
            const spend = data ?
                Txo.fromObject(data) :
                new Txo(
                    txid,
                    input.sourceOutputIndex,
                    new Uint8Array(input.sourceTransaction!.outputs[input.sourceOutputIndex]!.lockingScript.toBinary()),
                    BigInt(input.sourceTransaction!.outputs[input.sourceOutputIndex]!.satoshis!)
                )

            spend.spend = { txid, vin, block }
            ctx.spends.push(spend)
            t.store.put(spend.index())
        }

        for await (const [vout, output] of tx.outputs.entries()) {
            let data = await t.store.get([txid, vout])
            let txo = data ? 
                Txo.fromObject(data) :
                new Txo(
                    txid,
                    vout,
                    new Uint8Array(output.lockingScript.toBinary()),
                    BigInt(output.satoshis!)
                )
            txo.block = block
            ctx.txos.push(txo)
            this.indexers.forEach(i => {
                const data = i.parse(ctx, vout)
                if (data) {
                    txo.data[i.tag] = data
                }
            })
            if (Object.keys(txo.data).length) {
                t.store.put(txo.index())
            }
        }
        await t.done
        return ctx
    }
}