import type { IndexContext } from "../models/index-context";
import { IndexData } from "../models/index-data";
import { Indexer } from "../models/indexer";
export declare class Bsv20Indexer extends Indexer {
    tag: string;
    parse(ctx: IndexContext, vout: number): IndexData | undefined;
    fromObj(obj: IndexData): IndexData;
}
