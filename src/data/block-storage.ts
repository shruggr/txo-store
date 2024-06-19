import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { BlockHeader } from "../models/block-header";

export interface BlockSchema extends DBSchema {
    headers: {
        key: number;
        value: BlockHeader;
        indexes: {
            byHash: string;
        }
    }
}

const VERSION = 1
export class BlockStorage {
    db: Promise<IDBPDatabase<BlockSchema>>
    constructor() {
        this.db = openDB<BlockSchema>(`blocks`, VERSION, {
            upgrade(db) {
                const headers = db.createObjectStore('headers', { keyPath: 'height' })
                headers.createIndex('byHash', 'hash')
            }
        })
    }

    async byHeight(height: number): Promise<BlockHeader | undefined> {
        const db = await this.db
        return db.get('headers', height)
    }

    async byHash(hash: string): Promise<BlockHeader | undefined> {
        const db = await this.db
        return db.getFromIndex('headers', 'byHash', hash)
    }

    async insertBlock(block: BlockHeader) {
        const db = await this.db
        db.put('headers', block)
    }

    async currentBlock(): Promise<BlockHeader | undefined> {
        const db = await this.db
        const cursor = await db.transaction('headers').store.openCursor(null, 'prev')
        if (cursor) {
            return cursor.value
        }
        return
    }
}