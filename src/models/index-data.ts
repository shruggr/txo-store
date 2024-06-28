import type { Event } from "./event"

export class IndexData {
    tag?: string
    constructor(
        public data: any = null,
        public deps = new Set<string>()
    ) {}
}