import { Hash, OP, Utils } from "@bsv/sdk";
import type { IndexContext } from "../models/index-context";
import { Indexer } from "../models/indexer";
import { IndexData } from "../models/index-data";
import { Outpoint } from "../models/outpoint";
import { Buffer } from 'buffer'
import { parseAddress } from "../models/address";

const ORD = Buffer.from('ord')

export class Inscription {
    file = {
        hash: '',
        size: 0,
        type: '',
        content: ''
    }
    fields: {[key: string]: any} = {}
    parent?: Outpoint
}

export class InscriptionIndexer extends Indexer {
    tag: string = 'insc'

    constructor(public addresses: Set<string>) { 
        super()
    }

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const script = ctx.tx.outputs[vout].lockingScript
        for (let i = 0; i < script.chunks.length; i++) {
            const chunk = script.chunks[i]
            if (i >= 2 && chunk.data?.length === 3 &&
                Buffer.from(chunk.data).equals(ORD) &&
                script.chunks[i - 1].op == OP.OP_IF &&
                script.chunks[i - 2].op == OP.OP_FALSE
            ) {
                return this.pareseInscription(ctx, vout, i + 1)
            }
        }
    }

    pareseInscription(ctx: IndexContext, vout: number, fromPos: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        const insc = new Inscription()
        const data = new IndexData()
        data.data = insc
        const script = ctx.tx.outputs[vout].lockingScript
        const events: {id: string, value: string}[] = []
        for (let i = fromPos; i < script.chunks.length; i += 2) {
            const field = script.chunks[i]
            if (field.op == OP.OP_ENDIF) {
                let owner = txo.owner
                if (!owner) {
                    let owner = parseAddress(script, i + 1)
                    if (!owner && script.chunks[i + 1]?.op == OP.OP_CODESEPARATOR) {
                        owner = parseAddress(script, i + 1)
                    }
                }
                if (owner && this.addresses.has(owner)) {
                    txo.owner = owner
                    events.push({id: 'owner', value: owner})
                }
                for(const event of events) {
                    this.emit(txo, event.id, event.value)
                }
                return data
            }
            if (field.op > OP.OP_16) return

            const value = script.chunks[i + 1]
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
            switch (fieldNo) {
                case 0:
                    if (!value.data?.length) return
                    insc.file.content = Buffer.from(value.data || []).toString('base64')
                    insc.file.size = value.data?.length || 0
                    insc.file.hash = Buffer.from(Hash.sha256(value.data)).toString('hex')
                    events.push({id: 'hash', value: insc.file.hash})
                    break
                case 1:
                    insc.file.type = Buffer.from(value.data || []).toString()
                    events.push({id: 'type', value: insc.file.type})
                    break
                case 3:
                    try {
                        const parent = new Outpoint(new Uint8Array(value.data || []))
                        if (!ctx.spends.find(s => s.txid == parent.txidString() && s.vout == parent.vout)) continue
                        insc.parent = parent
                        events.push({id: 'parent', value: parent.toString()})
                    } catch {
                        console.log('Error parsing parent outpoint')
                    }
                    break
                default:
                    insc.fields[fieldNo.toString()] = value.data
            }

        }
        return
    }
}