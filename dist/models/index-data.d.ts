import type { Event } from "./event";
export declare class IndexData {
    data?: any | undefined;
    deps: string[];
    events: Event[];
    tag?: string;
    constructor(data?: any | undefined, deps?: string[], events?: Event[]);
    toJSON(): any;
}
