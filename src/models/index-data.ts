import type { Event } from "./event"

export class IndexData {
    tag?: string
    constructor(
        public data: any = null,
        public events: Event[] = [],
        public deps = new Set<string>()
    ) {}
}