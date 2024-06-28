import { OP, Utils } from "@bsv/sdk";
import type { IndexContext } from "../models/index-context";
import type { Indexer } from "../models/indexer";
import { IndexData } from "../models/index-data";

export class PaymentsIndexer implements Indexer {
    tag: string = 'payments'

    constructor(public addresses: Set<string>) {}

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        const script = ctx.tx.outputs[vout].lockingScript
        if (script.chunks[0]?.op === OP.OP_DUP &&
            script.chunks[1]?.op === OP.OP_HASH160 &&
            script.chunks[2]?.data?.length === 20 &&
            script.chunks[3]?.op === OP.OP_EQUALVERIFY &&
            script.chunks[4]?.op === OP.OP_CHECKSIG && 
            txo.satoshis > 1n
        ) {
            const address = Utils.toBase58Check(script.chunks[2].data, [0])
            if (this.addresses.has(address)) {
                return new IndexData([{ id: 'address', value: address }])
            }
        }
    }
}