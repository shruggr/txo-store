import { Block } from "./block";
import { IndexData } from "./index-data";
import type { Indexer } from "./indexer";
import { Spend } from "./spend";
export declare class Txo {
    txid: string;
    vout: number;
    satoshis: bigint;
    script: Uint8Array;
    block?: Block;
    spend?: Spend;
    data: {
        [tag: string]: IndexData;
    };
    events: string[];
    owner: string;
    constructor(txid: string, vout: number, satoshis: bigint, script: Uint8Array);
    static fromObject(obj: any, indexers?: Indexer[]): Txo;
    toJSON(): this & {
        script: string;
        satoshis: string;
        owner: string;
        data: {
            [tag: string]: any;
        };
        events: string[];
    };
}
export declare class TxoLookup {
    indexer: string;
    id?: string | undefined;
    value?: string | undefined;
    spent?: boolean | undefined;
    owner?: string | undefined;
    constructor(indexer: string, id?: string | undefined, value?: string | undefined, spent?: boolean | undefined, owner?: string | undefined);
    toQueryKey(): string;
    static buildQueryKey(tag: string, id?: string, value?: string, spent?: boolean): string;
}
export interface TxoResults {
    txos: Txo[];
    nextPage?: string;
}
