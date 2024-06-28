import type { Outpoint } from "./outpoint";

export interface Origin {
    outpoint: Outpoint
    nonce: number
    map?: {[key: string]: any}
}