import type { IndexContext } from "./index-context"
import type { IndexData } from "./index-data"

export interface Indexer {
    tag: string
    parse: (ctx: IndexContext, vout: number) => IndexData | undefined
}