import type { IndexContext } from "../models/index-context";
import { Indexer } from "../models/indexer";
import { IndexData } from "../models/index-data";
export declare class OpNSIndexer extends Indexer {
    tag: string;
    parse(ctx: IndexContext, vout: number): IndexData | undefined;
}
