export declare class Origin {
    outpoint: string;
    nonce: number;
    data: {
        [key: string]: any;
    };
    constructor(outpoint: string, nonce: number, data?: {
        [key: string]: any;
    });
}
