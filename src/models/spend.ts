import type { Block } from "./block";

export interface Spend {
    txid: string,
    vin: number,
    block?: Block
}