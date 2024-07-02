export declare class Bsv20 {
    status: number;
    tick: string;
    op: string;
    amt: bigint;
    dec?: number;
    reason?: string;
    toJSON(): any;
    static fromJSON(obj: any): Bsv20;
}
