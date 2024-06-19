import type { Event } from "./event"

export class IndexData {
    ids: string[] = []
    events: Event[] = []
    data: ArrayBuffer = new ArrayBuffer(0)
    deps: ArrayBuffer[] = []
}