export declare class Outpoint {
    txid: Uint8Array;
    vout: number;
    constructor(txidOrOutpoint: string | Uint8Array, vout?: number);
    toString(): string;
    txidString(): string;
    toBytes(): Uint8Array;
    toJSON(): string;
    static fromJSON(json: string): Outpoint;
    static fromProperties(txid: string | Uint8Array, vout: number): Outpoint;
}
