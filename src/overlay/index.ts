import { Engine, type LookupService, type TopicManager } from "@bsv/overlay";
import { TxoStorage } from "./data/txo-storage";
import { BlockHeaderService } from "../block-headers";
import { FundingIndexer } from "./indexers/funding";

export class TxoStore {
    private engine: Engine

    constructor(
        accountId: string, 
        public managers: { [key: string]: TopicManager },
        public lookupServices: { [key: string]: LookupService },
    ) {
        this.engine = new Engine(
            managers,
            lookupServices,
            new TxoStorage(accountId),
            new BlockHeaderService(),
            '',
        )
    }

    async ingest(beef: ArrayBuffer) {
        await this.engine.submit({
            beef: Array.from(new Uint8Array(beef)),
            topics: Object.keys(this.engine.managers)
        })
    }
}

