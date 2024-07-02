export declare class Block {
    height: number;
    idx: bigint;
    hash: string;
    constructor(height?: number, idx?: bigint, hash?: string);
    toJSON(): {
        height: number;
        idx: string;
        hash: string;
    };
}
