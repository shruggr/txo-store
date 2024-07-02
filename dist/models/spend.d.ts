import { Block } from "./block";
export declare class Spend {
    txid: string;
    vin: number;
    block?: Block | undefined;
    constructor(txid: string, vin: number, block?: Block | undefined);
    toJSON(): {
        txid: string;
        vin: number;
        block: {
            height: number;
            idx: string;
            hash: string;
        } | undefined;
    };
}
