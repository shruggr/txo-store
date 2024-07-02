import type { IndexContext } from "./index-context";
import { IndexData } from "./index-data";
export declare abstract class Indexer {
    addresses: Set<string>;
    tag: string;
    constructor(addresses?: Set<string>);
    parse(ctx: IndexContext, vout: number): IndexData | undefined;
    save(ctx: IndexContext): void;
    static parseEvent(event: string): {
        tag: string;
        id: string;
        value: string;
        spent: boolean;
        sort: number;
        idx: number;
        vout: number;
        satoshis: bigint;
    };
    fromObj(obj: IndexData): IndexData;
}
