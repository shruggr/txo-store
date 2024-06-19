import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { BlockHeader } from "../models/block-header";

const VERSION = 1
const PAGE_SIZE = 1000
export interface BlockSchema extends DBSchema {
    headers: {
        key: number;
        value: BlockHeader;
        indexes: {
            byHash: string;
        }
    }
}

export class JunglebusBlockHeaderService {
    db: Promise<IDBPDatabase<BlockSchema>>
    private interval?: NodeJS.Timeout
    private syncInProgress = false
    constructor() {
        this.db = openDB<BlockSchema>(`blocks`, VERSION, {
            upgrade(db) {
                const headers = db.createObjectStore('headers', { keyPath: 'height' })
                headers.createIndex('byHash', 'hash')
            }
        })
    }

    async startSync() {
        if (this.interval) return
        this.interval = setInterval(async () => {
            if (this.syncInProgress) return
            this.syncInProgress = true
            let lastHeight = 0
            const db = await this.db
            const cursor = await db.transaction('headers').store.openCursor(null, 'prev')
            if(cursor) {
                lastHeight = cursor.key - 6
            }

            try {
                let resp = await fetch(`https://junglebus.gorillapool.io/v1/blocks_headers/list/${lastHeight}?limit=${PAGE_SIZE}`)
                let blocks = await resp.json() as BlockHeader[]
                do {
                    console.log('Syncing', blocks.length, 'blocks from', lastHeight)
                    const t = db.transaction('headers', 'readwrite')
                    for (let block of blocks) {
                        t.store.put(block)
                    }
                    await t.done
                    resp = await fetch(`https://junglebus.gorillapool.io/v1/blocks_headers/list/${blocks[blocks.length - 1].height}?limit=${PAGE_SIZE}`)
                    blocks = await resp.json() as BlockHeader[]
                } while(blocks.length == PAGE_SIZE)
            } catch (e) {
                console.error(e)
            } finally {
                this.syncInProgress = false
            }
        }, 60000)
    }
}