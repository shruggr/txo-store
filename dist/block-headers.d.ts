import type { ChainTracker } from "@bsv/sdk";
import { type DBSchema, type IDBPDatabase } from "@tempfix/idb";
export interface BlockHeader {
    hash: string;
    height: number;
    version: number;
    prevHash: string;
    merkleroot: string;
    time: number;
    bits: number;
    nonce: number;
}
export interface BlockSchema extends DBSchema {
    headers: {
        key: number;
        value: BlockHeader;
        indexes: {
            byHash: string;
        };
    };
}
export declare class BlockHeaderService implements ChainTracker {
    db: Promise<IDBPDatabase<BlockSchema>>;
    syncInProgress: boolean;
    constructor();
    syncBlocks(): Promise<void>;
    isValidRootForHeight(root: string, height: number): Promise<boolean>;
    getHashByHeight(height: number): Promise<string | undefined>;
    getHeightByHash(hash: string): Promise<number | undefined>;
}
