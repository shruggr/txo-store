import type { AdmittanceInstructions, LookupAnswer, LookupFormula, LookupQuestion, LookupService, TopicManager } from "@bsv/overlay";
import { OP, Script, Transaction, Utils } from "@bsv/sdk";

export class FundingIndexer implements TopicManager, LookupService {
    constructor(
        public addresses: Set<string>,

    ) {}
    async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
        const tx = Transaction.fromBEEF(beef)
        const instructions: AdmittanceInstructions = {
            outputsToAdmit: [],
            coinsToRetain: []
        }
        for (let [vout, output] of tx.outputs.entries()) {
            if (output.lockingScript.chunks[0]?.op === OP.OP_DUP &&
                output.lockingScript.chunks[1]?.op === OP.OP_HASH160 &&
                output.lockingScript.chunks[2]?.data?.length === 20 &&
                output.lockingScript.chunks[3]?.op === OP.OP_EQUALVERIFY &&
                output.lockingScript.chunks[4]?.op === OP.OP_CHECKSIG && 
                output.satoshis && output.satoshis > 0 &&
                this.addresses.has(Utils.toBase58Check(output.lockingScript.chunks[2].data, [0]))
            ) {
                instructions.outputsToAdmit.push(vout)
            }
        }
        return instructions
    };

    async outputAdded(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
        // Do nothing
    }

    async outputSpent(txid: string, outputIndex: number, topic: string): Promise<void> {
        // Do nothing
    }

    async outputDeleted(txid: string, outputIndex: number, topic: string): Promise<void> {
        // Do nothing
    }

    async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> {
        return {
            type: 'freeform',
            result: 42
        }
    }

    async getDocumentation(): Promise<string> {
        return ""
    }
    async getMetaData(): Promise<{ name: string; shortDescription: string; iconURL?: string; version?: string; informationURL?: string; }> {
        return {
            name: "Funding",
            shortDescription: "An indexer for managing funding outputs.",
        }
    }
}
