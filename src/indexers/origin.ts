import type { IndexContext } from "../models/index-context";
import { Indexer } from "../models/indexer";
import { IndexData } from "../models/index-data";
import type { Origin } from "../models/origin";
import { Outpoint } from "../models/outpoint";


export class OriginIndexer extends Indexer {
    tag: string = 'origin'

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        if (ctx.txos[vout].satoshis != 1n) return

        let outSat = 0n
        for (let i = 0; i < vout; i++) {
            outSat += ctx.txos[i].satoshis
        }
        let inSat = 0n
        const data = new IndexData()
        for (const spend of ctx.spends) {
            data.deps.add(spend.txid.toString())
            if (inSat == outSat) {
                let origin: Origin | undefined
                if (spend.satoshis != 1n) {
                    origin = {
                        nonce: 0,
                        outpoint: new Outpoint(txo.txid, txo.vout),
                    }
                } else if (spend.data['origin']) {
                    origin = Object.assign({}, spend.data['origin'].data) as Origin
                    origin.nonce++
                }
                if (origin) {
                    if (txo.data['map']) {
                        origin.map = Object.assign(origin.map || {}, txo.data['map'].data)
                    }
                    this.emit(txo, 'outpoint', origin.outpoint.toString())
                    data.data = origin
                    return data
                }
                return
            } else if (inSat > outSat) {
                return
            }
            inSat += spend.satoshis
        }
        return
    }
}