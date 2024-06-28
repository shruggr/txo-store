import { OP, Utils } from "@bsv/sdk";
import type { IndexContext } from "../models/index-context";
import { Indexer } from "../models/indexer";
import { IndexData } from "../models/index-data";
import { parseAddress } from "../models/address";

export class FundIndexer extends Indexer {
    tag: string = 'fund'

    constructor(public addresses: Set<string>) {
        super()
    }

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        const script = ctx.tx.outputs[vout].lockingScript
        const address = parseAddress(script, 0)
        if (address && this.addresses.has(address)) {
            txo.owner = address
            if (txo.satoshis > 1n) {
                this.emit(txo, 'owner', address)
                return new IndexData()
            }
        }
        return
    }
}