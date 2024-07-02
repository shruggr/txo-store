import type { IndexContext } from "../models/index-context";
import { Indexer } from "../models/indexer";
import { IndexData } from "../models/index-data";
export declare class InscriptionIndexer extends Indexer {
    tag: string;
    parse(ctx: IndexContext, vout: number): IndexData | undefined;
    pareseInscription(ctx: IndexContext, vout: number, fromPos: number): IndexData | undefined;
    fromObj(obj: IndexData): IndexData;
}
