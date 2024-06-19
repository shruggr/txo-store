import type { Block } from "./block"
import type { IndexData } from "./index-data"
import { Outpoint } from "./outpoint"
import type { Spend } from "./spend"

export class Txo {
    outpoint: Outpoint
    script: Uint8Array
    satoshis: bigint
    block?: Block
    spend?: Spend
    data: {[key: string]: IndexData} = {}
    private _score?: Uint8Array

    constructor(outpoint: Outpoint, script: Uint8Array, satoshis: bigint) {
        this.outpoint = outpoint
        this.script = script
        this.satoshis = satoshis
    }

    get score() {
        if (!this._score) {
            this._score = new Uint8Array(12)
            const view = new DataView(this._score.buffer)
            view.setUint32(0, this.spend?.block?.height || this.block?.height || Date.now(), false)
            view.setBigUint64(4, this.spend?.block?.idx || this.block?.idx || 0n, false)
        }
        return this._score
    }

    toJSON() {
        return {
            outpoint: this.outpoint.toJSON(),
            script: Buffer.from(this.script).toString('base64'),
            satoshis: this.satoshis.toString(10),
            block: this.block,
            spend: this.spend,
            data: this.data,
            score: Buffer.from(this.score).toString('base64')
        }
    }

    static fromJSON(json: any) {
        const txo = new Txo(
            new Outpoint(json.outpoint), 
            Buffer.from(json.script, 'base64'), 
            BigInt(json.satoshis)
        )
        txo.block = json.block
        txo.spend = json.spend
        txo.data = json.data
        txo._score = Buffer.from(json.score, 'base64')
        return txo
    }
}