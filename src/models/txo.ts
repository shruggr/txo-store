import type { Block } from "./block"
import { IndexData } from "./index-data"
import type { Spend } from "./spend"
import { Buffer } from 'buffer'

export class Txo {
    block?: Block
    spend?: Spend
    data: { [tag: string]: IndexData } = {}
    events: string[] = []

    constructor(
        public txid: string,
        public vout: number,
        public script: Uint8Array,
        public satoshis: bigint
    ) { }

    index(): Txo {
        this.events = []
        for (const [tag, data] of Object.entries(this.data)) {
            for (const e of data.events) {
                const spent = this.spend ? '1' : '0'
                const sort = this.spend?.block?.height || this.block?.height || Date.now()
                const event = `${tag}:${e.id}:${e.value}:${spent}:${sort.toString(16).padStart(8, '0')}:${this.txid}:${this.vout}`
                this.events.push(event)
            }
        }
        return this
    }

    static buildQueryKey(tag: string, id: string, value?: string, spent?: boolean): string {
        let key = `${tag}:${id}`
        if (value) key += `:${value}` +
           spent !== undefined ? `:${spent ? '1' : '0'}` : ''   
        return key
    }

    static fromObject(obj: any): Txo {
        const txo = new Txo(obj.txid, obj.vout, obj.script, BigInt(obj.satoshis))
        txo.block = obj.block
        txo.spend = obj.spend
        txo.data = obj.data
        txo.events = obj.events
        return txo
    }

    toJSON(): any {
        return {
            txid: this.txid,
            vout: this.vout,
            script: Buffer.from(this.script).toString('base64'),
            satoshis: this.satoshis.toString(),
            block: {
                height: this.block?.height,
                idx: this.block?.idx.toString(),
                hash: this.block?.hash,
            },
            spend: {
                txid: this.spend?.txid,
                vin: this.spend?.vin,
                block: {
                    height: this.spend?.block?.height,
                    idx: this.spend?.block?.idx.toString(),
                    hash: this.spend?.block?.hash,
                },
            
            },
            data: this.data,
            events: this.events,
        }
    }
}