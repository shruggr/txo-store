export declare enum Bsv21Status {
    Invalid = -1,
    Pending = 0,
    Valid = 1
}
export declare class Bsv21 {
    status: Bsv21Status;
    id: string;
    op: string;
    amt: bigint;
    dec: number;
    sym?: string;
    icon?: string;
    contract?: string;
    reason?: string;
    toJSON(): any;
    static fromJSON(obj: any): Bsv21;
}
