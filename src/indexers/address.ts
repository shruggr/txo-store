import { OP, Script, Utils } from "@bsv/sdk"
import type { IndexContext } from "../models/index-context"
import { IndexData } from "../models/index-data"

export function indexAddress(idxCtx: IndexContext, vout: number): IndexData {
    const idxData = new IndexData()
    const script = Script.fromBinary(Array.from(new Uint8Array(idxCtx.txos[vout].script))) 
    if(script.chunks[0]?.op == OP.OP_DUP &&
        script.chunks[1]?.op == OP.OP_HASH160 &&
        script.chunks[3]?.op == OP.OP_EQUALVERIFY &&
        script.chunks[4]?.op == OP.OP_CHECKSIG &&
        script.chunks[2]?.data?.length == 20) 
    {
        idxData.ids.push(Utils.toBase58Check(script.chunks[2].data!))
    }
    return idxData
}