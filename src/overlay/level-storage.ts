import type { Output, Storage } from "@bsv/overlay";
import type { AppliedTransaction } from "@bsv/overlay/storage/Storage";
import { Level } from "level";

export class LevelStorage implements Storage {
    private db = new Level<string, any>('txostore')
    private txos = this.db.sublevel<string, Output>('txos', { valueEncoding: 'json' })
    private appliedTx = this.db.sublevel<string, boolean>('appliedTxs', { valueEncoding: 'json' })

    async insertOutput(utxo: Output) {
        this.txos.put(`${utxo.txid}_${utxo.outputIndex}`, utxo)
    }
    
    async findOutput(txid: string, outputIndex: number, topic?: string | undefined, spent?: boolean | undefined): Promise<Output | null> {
        const out = await this.txos.get(`${txid}_${outputIndex}`).catch(() => null)
        if (topic && out?.topic != topic) return null
        return out
    }
    
    async findOutputsForTransaction(txid: string): Promise<Output[]> {
        const outputs: Output[] = []
        for await (const output of this.txos.values({ gte: txid, lt: txid + '\xff' })) {
            outputs.push(output)
        }
        return outputs
    }

    async deleteOutput(txid: string, outputIndex: number, topic: string): Promise<void> {
        const output = await this.findOutput(txid, outputIndex, topic)
        if (output) {
            this.txos.del(`${txid}_${outputIndex}`)
        }
    }

    async markUTXOAsSpent(txid: string, outputIndex: number, topic: string): Promise<void> {
        const output = await this.findOutput(txid, outputIndex, topic)
        if (output) {
            output.spent = true
            this.insertOutput(output)
        }
    }

    async updateConsumedBy(txid: string, outputIndex: number, topic: string, consumedBy: { txid: string; outputIndex: number; }[]): Promise<void> {
        const output = await this.findOutput(txid, outputIndex, topic)
        if (output) {
            output.consumedBy = consumedBy
            this.insertOutput(output)
        }
    }

    async updateOutputBeef(txid: string, outputIndex: number, topic: string, beef: number[]): Promise<void> {
        const output = await this.findOutput(txid, outputIndex, topic)
        if (output) {
            output.beef = beef
            this.insertOutput(output)
        }
    }

    async insertAppliedTransaction(tx: AppliedTransaction): Promise<void> {
        this.appliedTx.put(`${tx.topic}:${tx.txid}`, true)
    }

    async doesAppliedTransactionExist(tx: AppliedTransaction): Promise<boolean> {
        return this.appliedTx.get(`${tx.topic}:${tx.txid}`).then(() => true).catch(() => false)
    }    
}