import type { IndexContext } from "../../models/index-context";
import { IndexData } from "../../models/index-data";
import type { Indexer } from "../../models/indexer";
import type { Outpoint } from "../../models/outpoint";
import type { Ordinal } from "../ord/inscription";

// Id            *lib.Outpoint  `json:"id,omitempty"`
// Op            string         `json:"op"`
// Symbol        *string        `json:"-"`
// Max           uint64         `json:"-"`
// Limit         uint64         `json:"-"`
// Decimals      uint8          `json:"-"`
// Icon          *lib.Outpoint  `json:"-"`
// Supply        uint64         `json:"-"`
// Amt           *uint64        `json:"amt"`
// Implied       bool           `json:"-"`
// Status        Bsv20Status    `json:"-"`
// Reason        *string        `json:"reason,omitempty"`
// PKHash        []byte         `json:"-"`
// Price         uint64         `json:"price,omitempty"`
// PayOut        []byte         `json:"payout,omitempty"`
// Listing       bool           `json:"listing"`
// PricePerToken float64        `json:"pricePer,omitempty"`

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
    public sym?: string
    public icon?: string

    constructor(props: {[key: string]: any}) {
        Object.assign(this, props)
    }
}

export class Bsv21Indexer implements Indexer {
    tag: string = 'bsv21'

    parse(ctx: IndexContext, vout: number): IndexData | undefined {
        const txo = ctx.txos[vout]
        const ord = txo.data.ord?.data as Ordinal
        if (!ord || ord.inscription?.file.type !== 'application/bsv20') return
        try {
            const bsv21 = new Bsv21(
                JSON.parse(Buffer.from(ord.inscription.file.content).toString())
            )
            if (bsv21.op == 'deploy+mint') {
                bsv21.id = `${ctx.txid}_${vout}`
            }
            const data = new IndexData({})

        } catch (e) {
            return
        }
    }

    preSave(ctx: IndexContext) {

    }
}