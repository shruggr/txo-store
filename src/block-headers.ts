import type { ChainTracker } from "@bsv/sdk";
import { openDB, type DBSchema, type IDBPDatabase } from "@tempfix/idb";

const VERSION = 1
const PAGE_SIZE = 10000

export interface BlockHeader {
    hash: string
    height: number
    version: number
    prevHash: string
    merkleroot: string
    time: number
    bits: number
    nonce: number
}

export interface BlockSchema extends DBSchema {
    headers: {
        key: number;
        value: BlockHeader;
        indexes: {
            byHash: string;
        }
    }
}

export class BlockHeaderService implements ChainTracker{
    db: Promise<IDBPDatabase<BlockSchema>>
    syncInProgress = false
    constructor() {
        this.db = openDB<BlockSchema>(`blocks`, VERSION, {
            upgrade(db) {
                const headers = db.createObjectStore('headers', { keyPath: 'height' })
                headers.createIndex('byHash', 'hash')
            }
        })
    }

    async syncBlocks() {
        if (this.syncInProgress) return
        this.syncInProgress = true
        let lastHeight = 1
        const db = await this.db
        const cursor = await db.transaction('headers').store.openCursor(null, 'prev')
        if (cursor) {
            lastHeight = cursor.key > 5 ? cursor.key - 5 : 1
        }

        try {
            let resp = await fetch(`https://ordinals.gorillapool.io/api/blocks/list/${lastHeight}?limit=${PAGE_SIZE}`)
            let blocks = await resp.json() as BlockHeader[]
            do {
                console.log('Syncing from', lastHeight)
                const t = db.transaction('headers', 'readwrite')
                for (let block of blocks) {
                    t.store.put(block)
                    lastHeight = block.height + 1
                }
                await t.done
                resp = await fetch(`https://ordinals.gorillapool.io/api/blocks/list/${lastHeight}?limit=${PAGE_SIZE}`)
                blocks = await resp.json() as BlockHeader[]
            } while (blocks.length == PAGE_SIZE)
        } catch (e) {
            console.error(e)
        } finally {
            this.syncInProgress = false
            setTimeout(() => this.syncBlocks(), 1000 * 60)
        }
    }

    async isValidRootForHeight(root: string, height: number): Promise<boolean> {
        const db = await this.db
        const block = await db.get('headers', height)
        return block?.merkleroot == root
    }

    async getHashByHeight(height: number): Promise<string | undefined> {
        const db = await this.db
        return (await db.get('headers', height))?.hash
    }

    async getHeightByHash(hash: string): Promise<number | undefined> {
        const db = await this.db
        return (await db.getFromIndex('headers', 'byHash', hash))?.height
    }
}