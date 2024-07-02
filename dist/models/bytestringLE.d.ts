export declare class ByteStringLE {
    data: Uint8Array;
    constructor(data: string | Uint8Array);
    toString(): string;
    toBytes(): Uint8Array;
    toJSON(): string;
    static fromJSON(json: string): ByteStringLE;
}
