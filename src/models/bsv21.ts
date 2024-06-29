export enum Bsv21Status {
    Invalid = -1,
    Pending = 0,
    Valid = 1,
}

export class Bsv21 {
    status = Bsv21Status.Pending
    public id = ''
    public op = ''
    public amt = 0n
    public dec = 0
    public sym?: string
    public icon?: string
    public contract?: string
    public reason?: string


    toJSON(): any {
        return {
            ...this,
            amt: this.amt.toString(),
        }
    }

    static fromJSON(obj: any): Bsv21 {
        const bsv21 = new Bsv21()
        Object.assign(bsv21, {
            ...obj,
            amt: BigInt(obj.amt),
        })
        return bsv21
    }
}