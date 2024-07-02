import { Transaction } from "@bsv/sdk";
import type { Indexer } from "./models/indexer";
import type { IndexContext } from "./models/index-context";
import { type DBSchema, type IDBPDatabase } from "@tempfix/idb";
import { Txo, TxoLookup, type TxoResults } from "./models/txo";
import { type Txn } from "./models/txn";
import { BlockHeaderService } from "./block-headers";
export interface TxoSchema extends DBSchema {
    txos: {
        key: [string, number];
        value: Txo;
        indexes: {
            events: string;
            owner: string;
        };
    };
    txns: {
        key: string;
        value: Txn;
    };
}
export declare class TxoStore {
    accountId: string;
    indexers: Indexer[];
    addresses: Set<string>;
    db: Promise<IDBPDatabase<TxoSchema>>;
    blocks: BlockHeaderService;
    constructor(accountId: string, indexers?: Indexer[], addresses?: Set<string>);
    getTx(txid: string, fromRemote?: boolean): Promise<Transaction | undefined>;
    getTxo(txid: string, vout: number): Promise<Txo | undefined>;
    searchTxos(lookup: TxoLookup, limit?: number, from?: string): Promise<TxoResults>;
    ingest(tx: Transaction, fromRemote?: boolean): Promise<IndexContext>;
}
