import type { IndexContext } from "./index-context"
import type { IndexData } from "./index-data"
import type { Txo } from "./txo"

export abstract class Indexer {
    tag = ''
    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        return
    }
    save(ctx: IndexContext): void {
        return
    }
    emit(txo: Txo, id: string, value: string): void {
        const spent = txo.spend ? '1' : '0'
        const sort = txo.spend?.block?.height || txo.block?.height || Date.now()
        const event = `${this.tag}:${id}:${value}:${spent}:${sort.toString(16).padStart(8, '0')}:${txo.txid}:${txo.vout}`
        txo.events.push(event)
    }
}