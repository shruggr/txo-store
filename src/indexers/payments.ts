import { OP, Utils } from "@bsv/sdk";
import type { IndexContext } from "../models/index-context";
import type { Indexer } from "../models/indexer";
import { IndexData } from "../models/index-data";
import { parseAddress } from "../models/address";

export class PaymentsIndexer implements Indexer {
    tag: string = 'payments'

    constructor(public addresses: Set<string>) { }

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        const script = ctx.tx.outputs[vout].lockingScript
        const address = parseAddress(script, 0)
        if (address && this.addresses.has(address) && txo.satoshis > 1n) {
            return new IndexData([{ id: 'address', value: address }])
        }
    }
}