import { Hash, OP, Utils } from "@bsv/sdk";
import type { IndexContext } from "../../models/index-context";
import type { Indexer } from "../../models/indexer";
import { IndexData } from "../../models/index-data";
import type { Inscription, Ordinal } from "./inscription";
import { Outpoint } from "../../models/outpoint";
import { Buffer } from 'buffer'
import type { Origin } from "../../models/origin";
import { parseAddress } from "../../models/address";

const ORD = Buffer.from('ord')

export class OrdIndexer implements Indexer {
    tag: string = 'ord'

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const script = ctx.tx.outputs[vout].lockingScript
        let insc: IndexData | undefined
        for(let i = 0; i < script.chunks.length; i++) {
            const chunk = script.chunks[i]
            if (i>=2 && chunk.data?.length === 3 && 
                Buffer.from(chunk.data).equals(ORD) &&
                script.chunks[i-1].op == OP.OP_IF && 
                script.chunks[i-2].op == OP.OP_FALSE
            ) {
                insc = this.pareseInscription(ctx, vout, i+1)
                break
            }
        }
        
        const origin = this.parseOrigin(ctx, vout)
        if (!insc && !origin) return
        const data = new IndexData({})
        if (insc) {
            data.data.inscription = insc.data
            data.events.push(...insc.events)
            insc.deps.forEach(d => data.deps.add(d))
        }
        if (origin) {
            data.data.origin = origin.data
            data.events.push(...origin.events)
            origin.deps.forEach(d => data.deps.add(d))
        }
        let address = parseAddress(script, 0)
        if (address) {
            data.events.push({ id: 'address', value: address })
        }
        return data
    }

    pareseInscription(ctx: IndexContext, vout: number, fromPos: number): IndexData | undefined {
        const insc: Inscription = {
            file: {
                size: 0,
                type: '',
                hash: '',
                content: Buffer.alloc(0),
            },
            fields: {},
        }
        const data = new IndexData()
        data.data = insc
        const script = ctx.tx.outputs[vout].lockingScript
        for(let i = fromPos; i < script.chunks.length; i+=2) {
            const field = script.chunks[i]
            if (field.op == OP.OP_ENDIF) {
                let address = parseAddress(script, i+1)
                if (!address && script.chunks[i+1].op == OP.OP_CODESEPARATOR) {
                    address = parseAddress(script, i+1)
                }
                if (address) {
                    data.events.push({ id: 'address', value: address })
                }
                return data
            }
            if (field.op > OP.OP_16) return

            const value = script.chunks[i+1]
            if (value.op > OP.OP_PUSHDATA4) return

            if (field.data?.length || 0 > 1) {
                insc.fields[Buffer.from(field.data!).toString()] = value.data
                continue
            }
            // TODO: handle MAP

            let fieldNo = 0
            if (field.op > OP.OP_PUSHDATA4 && field.op <= OP.OP_16) {
                fieldNo = field.op - 80
            } else if (field.data?.length) {
                fieldNo = field.data![0]
            }
            switch(fieldNo) {
                case 0:
                    if (!value.data?.length) return
                    insc.file.content = Buffer.from(value.data || [])
                    insc.file.size = value.data?.length || 0
                    insc.file.hash = Buffer.from(Hash.sha256(value.data)).toString('hex')
                    data.events.push({ id: 'hash', value: insc.file.hash })
                    break
                case 1:
                    insc.file.type = Buffer.from(value.data || []).toString()
                    data.events.push({ id: 'type', value: insc.file.type })
                    break
                case 3:
                    const parent = new Outpoint(new Uint8Array(value.data || []))
                    if (!ctx.spends.find(s => s.txid == parent.txidString() && s.vout == parent.vout)) continue
                    insc.parent = parent
                    break
                default:
                    insc.fields[fieldNo.toString()] = value.data
            }
                        
        }
        return
    }

    parseOrigin(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        if(ctx.txos[vout].satoshis != 1n) return
        
        let outSat = 0n
        for (let i = 0; i < vout; i++) {
            outSat += ctx.txos[i].satoshis
        }
        let inSat = 0n
        const data = new IndexData()
        for (const spend of ctx.spends) {
            data.deps.add(spend.txid.toString())
            if (inSat == outSat ) {
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
                    data.events.push({ id: 'outpoint', value: origin.outpoint.toString() })
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