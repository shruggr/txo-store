import type { Block } from "./block"
import type { Txo } from "./txo"

export interface IndexContext {
    rawtx: Uint8Array
    txid: string
    block?: Block
    spends: Txo[]
    txos: Txo[]
}