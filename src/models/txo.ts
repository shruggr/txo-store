import type { Block } from "./block"
import { IndexData } from "./index-data"
import type { Spend } from "./spend"
import { Buffer } from 'buffer'

export class Txo {
    block?: Block
    spend?: Spend
    owner = ''
    data: { [tag: string]: IndexData } = {}
    events: string[] = []

    constructor(
        public txid: string,
        public vout: number,
        public script: Uint8Array,
        public satoshis: bigint
    ) { }

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

export class TxoLookup {
    constructor(
        public indexer: string, 
        public id?: string,
        public value?: string,
        public spent?: boolean, 
        public owner?: string) {
    }

    toQueryKey(): string {
        return TxoLookup.buildQueryKey(this.indexer, this.id, this.value, this.spent)
    }

    static buildQueryKey(tag: string, id?: string, value?: string, spent?: boolean): string {
        let key = `${tag}`
        if (id) {
            key += `:${id}`
            if (value) {
                key += `:${value}`
                if (spent !== undefined) {
                    key += `:${spent ? '1' : '0'}`
                }
            }
        }
        return key
    }
}

export interface TxoResults {
    txos: Txo[]
    nextPage?: string
}