import { Engine } from "@bsv/overlay";
import { LevelStorage } from "./overlay/level-storage";

export class TxoStore {
    private engine: Engine

    constructor(public addresses: Set<string>) {
        const storage = new LevelStorage()
        this.engine = new Engine(
            {},
            {},
            storage,
            {isValidRootForHeight: () => Promise.resolve(true)}
        )
    }

    async ingest(beef: ArrayBuffer) {
        await this.engine.submit({
            beef: Array.from(new Uint8Array(beef)),
            topics: Object.keys(this.engine.managers)
        })
    }
}

