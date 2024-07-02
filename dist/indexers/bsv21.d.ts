import type { IndexContext } from "../models/index-context";
import { IndexData } from "../models/index-data";
import { Indexer } from "../models/indexer";
export declare class Bsv21Indexer extends Indexer {
    tag: string;
    parse(ctx: IndexContext, vout: number): IndexData | undefined;
    save(ctx: IndexContext): void;
    fromObj(obj: IndexData): IndexData;
}
