export declare class Listing {
    payout: Uint8Array;
    price: bigint;
    constructor(payout?: Uint8Array, price?: bigint);
    toJSON(): {
        payout: string;
        price: string;
    };
}
