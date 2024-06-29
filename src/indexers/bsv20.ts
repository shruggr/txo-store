import { Bsv20 } from "../models/bsv20";
import type { IndexContext } from "../models/index-context";
import { IndexData } from "../models/index-data";
import { Indexer } from "../models/indexer";
import type { Inscription } from "../models/inscription";

export class Bsv20Indexer extends Indexer {
    tag: string = 'bsv20'

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        const insc = txo.data.insc?.data as Inscription
        if (!insc || insc.file.type !== 'application/bsv-20') return
        try {
            const bsv20 = Bsv20.fromJSON(JSON.parse(insc.file.text))
            const data = new IndexData(bsv20)
            const amt = BigInt(bsv20.amt)
            if (amt <= 0n || amt > 2**64-1) return
            switch (bsv20.op) {
                case 'deploy':
                    if (bsv20.dec || 0 > 18) return
                case 'mint':
                case 'transfer':
                case 'burn':
                    break
                default:
                    return
            }
            if(!bsv20.tick) {
                return
            }
            data.events.push({id: 'tick', value: bsv20.tick})
            return data
        } catch (e) {
            return
        }
    }

    fromObj(obj: IndexData): IndexData {
        return new IndexData(Bsv20.fromJSON(obj.data), obj.deps)
    }
}