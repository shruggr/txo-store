import type { Output, Storage, AppliedTransaction } from "@bsv/overlay";
import { openDB, type DBSchema, type IDBPDatabase } from "@tempfix/idb";
import type { Txn } from "../../models/txn";

export interface TxoSchema extends DBSchema {
    txos: {
        key: [string, number];
        value: Output;
        indexes: {
            byTxid: string;
        }
    }
    txns: {
        key: string;
        value: Txn;
    }
    appliedTxs: {
        key: [string, string];
        value: AppliedTransaction;
    }
}


const VERSION = 1
export class TxoStorage implements Storage {
    db: Promise<IDBPDatabase<TxoSchema>>

    constructor(accountId: string) {
        this.db = openDB<TxoSchema>(`txostore-${accountId}`, VERSION, {
            upgrade(db) {
                const txos = db.createObjectStore('txos', { keyPath: ['txid', 'outputIndex'] })
                txos.createIndex('byTxid', 'txid')
                db.createObjectStore('appliedTxs', { keyPath: ['topic', 'txid'] })
            }
        })
    }

    async insertOutput(utxo: Output) {
        const db = await this.db
        db.put('txos', utxo)
    }

    async findOutput(txid: string, outputIndex: number, topic?: string | undefined, spent?: boolean | undefined): Promise<Output | null> {
        const db = await this.db
        const out = await db.get('txos', [txid, outputIndex])
        if (!out || (topic && out?.topic != topic)) return null
        return out
    }

    async findOutputsForTransaction(txid: string): Promise<Output[]> {
        const db = await this.db
        return db.getAllFromIndex('txos', 'byTxid', txid)
    }

    async deleteOutput(txid: string, outputIndex: number, topic: string): Promise<void> {
        const db = await this.db
        const t = db.transaction('txos', 'readwrite')
        const output = await t.store.get([txid, outputIndex])
        if (output) {
            t.store.delete([txid, outputIndex])
        }
        await t.done
    }

    async markUTXOAsSpent(txid: string, outputIndex: number, topic: string): Promise<void> {
        const db = await this.db
        const t = db.transaction('txos', 'readwrite')
        const output = await t.store.get([txid, outputIndex])
        if (output) {
            output.spent = true
            t.store.put(output)
        }
        await t.done
    }

    async updateConsumedBy(txid: string, outputIndex: number, topic: string, consumedBy: { txid: string; outputIndex: number; }[]): Promise<void> {
        const db = await this.db
        const t = db.transaction('txos', 'readwrite')
        const output = await t.store.get([txid, outputIndex])
        if (output) {
            output.consumedBy = consumedBy
            t.store.put(output)
        }
        await t.done
    }

    async updateOutputBeef(txid: string, outputIndex: number, topic: string, beef: number[]): Promise<void> {
        const db = await this.db
        const t = db.transaction('txos', 'readwrite')
        const output = await t.store.get([txid, outputIndex])
        if (output) {
            output.beef = beef
            t.store.put(output)
        }
        await t.done
    }

    async insertAppliedTransaction(tx: AppliedTransaction): Promise<void> {
        const db = await this.db
        db.put('appliedTxs', tx)
    }

    async doesAppliedTransactionExist(tx: AppliedTransaction): Promise<boolean> {
        const db = await this.db
        return !!await db.get('appliedTxs', [tx.topic, tx.txid])
    }
}