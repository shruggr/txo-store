import { Bsv21, Bsv21Status } from "../models/bsv21";
import type { IndexContext } from "../models/index-context";
import { IndexData } from "../models/index-data";
import { Indexer } from "../models/indexer";
import type { Inscription } from "../models/inscription";
import type { Txo } from "../models/txo";
import { Buffer } from 'buffer'

export class Bsv21Indexer extends Indexer {
    tag: string = 'bsv21'

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        const insc = txo.data.insc?.data as Inscription
        if (!insc || insc.file.type !== 'application/bsv-20') return
        const bsv21 = Bsv21.fromJSON(JSON.parse(insc.file.text))
        const data = new IndexData(bsv21)
        if (bsv21.amt <= 0n || bsv21.amt > 2 ** 64 - 1) return
        switch (bsv21.op) {
            case 'deploy+mint':
                if (bsv21.dec > 18) return
                bsv21.id = `${txo.txid}_${txo.vout}`
                bsv21.status = Bsv21Status.Valid
                break
            case 'transfer':
            case 'burn':
                break
            default:
                return
        }
        if (!bsv21.id) {
            return
        }
        data.events.push({ id: 'op', value: bsv21.op })
        data.events.push({ id: 'id', value: bsv21.id })
        if (bsv21.contract) {
            data.events.push({ id: 'contract', value: bsv21.contract })
        }

        return data
    }

    save(ctx: IndexContext) {
        let tokensIn = 0n
        let token: IndexData | undefined
        const deps = new Set<string>()
        for (const spend of ctx.spends) {
            const bsv21 = spend.data.bsv21
            if (!bsv21) continue
            if (bsv21.data.status == Bsv21Status.Valid) {
                token = bsv21
                tokensIn += BigInt(bsv21.data.amt)
                deps.add(`${spend.txid}_${spend.vout}`)
            }
        }
        const tokens: Txo[] = []
        let reason = ""
        for (const txo of ctx.txos) {
            const bsv21 = txo.data?.bsv21
            if (!bsv21 || !['transfer', 'burn'].includes(bsv21.data.op)) continue

            if (tokensIn >= bsv21.data.amt) {
                bsv21.data.status = Bsv21Status.Valid
            } else {
                reason = 'Insufficient tokens'
            }
            txo.data.bsv21.deps = deps
            tokens.push(txo)
            tokensIn -= BigInt(bsv21.data.amt)
        }

        for (const txo of tokens) {
            txo.data.bsv21.data.sym = token?.data.sym
            txo.data.bsv21.data.icon = token?.data.icon
            txo.data.bsv21.data.contract = token?.data.contract
            txo.data.bsv21.data.status = reason ? Bsv21Status.Invalid : Bsv21Status.Valid
            txo.data.bsv21.data.reason = reason
        }
    }

    fromObj(obj: IndexData): IndexData {
        return new IndexData(Bsv21.fromJSON(obj.data), obj.deps)
    }
}