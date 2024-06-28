import type { IndexContext } from "../models/index-context";
import { IndexData } from "../models/index-data";
import { Indexer } from "../models/indexer";
import type { Txo } from "../models/txo";
import type { Inscription } from "./insc";

enum Bsv20Status {
    Invalid = -1,
    Pending = 0,
    Valid = 1,
}

export class Bsv21 {
    status = Bsv20Status.Pending
    public id = ''
    public op = ''
    public amt = 0n
    public dec = 0n
    public sym?: string
    public icon?: string
    public contract?: string
    public reason?: string

    constructor(props: { [key: string]: any }) {
        Object.assign(this, {
            ...props,
            amt: BigInt(props.amt),
            dec: BigInt(props.dec),
        })
    }

    toJSON(): any {
        return {
            id: this.id,
            op: this.op,
            amt: this.amt.toString(),
            dec: this.dec.toString(),
            sym: this.sym,
            icon: this.icon,
            contract: this.contract,
        }
    }

    static fromJSON(obj: any): Bsv21 {
        return new Bsv21(obj)
    }
}

export class Bsv21Indexer extends Indexer {
    tag: string = 'bsv21'

    constructor(public addresses: Set<string>) {
        super()
    }

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]

        const insc = txo.data.insc?.data as Inscription
        if (!insc || insc.file.type !== 'application/bsv20') return
        try {
            const bsv21 = new Bsv21(
                JSON.parse(Buffer.from(insc.file.content).toString())
            )
            if (bsv21.amt <= 0n || bsv21.amt > 2**64-1) return
            if (bsv21.dec > 18) return
            switch (bsv21.op) {
                case 'deploy+mint':
                    bsv21.id = `${ctx.txid}_${vout}`
                    bsv21.status = Bsv20Status.Valid
                    break
                case 'transfer':
                case 'burn':
                    break
                default:
                    return
            }
            if(!bsv21.id) {
                return
            }
            this.emit(txo, 'op', bsv21.op)
            this.emit(txo, 'id', bsv21.id)
            if (bsv21.contract) {
                this.emit(txo, 'contract', bsv21.contract)
            }

            return new IndexData(bsv21)
        } catch (e) {
            return
        }
    }

    save(ctx: IndexContext) {
        let tokensIn = 0n
        let token: IndexData | undefined
        const deps = new Set<string>()
        for (const spend of ctx.spends) {
            const bsv21 = spend.data.bsv21
            if (!bsv21) continue
            if (bsv21.data.status == Bsv20Status.Valid) {
                token = bsv21
                tokensIn += bsv21.data.amt 
                deps.add(spend.txid)  
            }
        }
        const tokens: Txo[] = []
        let reason = ""
        for (const txo of ctx.txos) {
            const bsv21 = txo.data?.bsv21
            if (!bsv21) continue
            
            if (tokensIn >= bsv21.data.amt) {
                bsv21.data.status = Bsv20Status.Valid
            } else {
                reason = 'Insufficient tokens'
            }
            txo.data.bsv21.deps = deps
            tokens.push(txo)
            tokensIn -= bsv21.data.amt
        }
        for (const txo of tokens) {
            txo.data.bsv21.data.sym = token?.data.sym
            txo.data.bsv21.data.icon = token?.data.icon
            txo.data.bsv21.data.contract = token?.data.contract
            txo.data.bsv21.data.status = reason ? Bsv20Status.Invalid : Bsv20Status.Valid
            txo.data.bsv21.data.reason = reason
            if (txo.owner && this.addresses.has(txo.owner)) {
                this.emit(txo, 'owner', txo.owner)
            }
        }
    }
}