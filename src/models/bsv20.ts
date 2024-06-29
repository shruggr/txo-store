export class Bsv20 {
    status = 0
    public tick = ''
    public op = ''
    public amt = 0n
    public dec?: number
    public reason?: string

    toJSON(): any {
        return {
            ...this,
            amt: this.amt.toString(),
        }
    }

    static fromJSON(obj: any): Bsv20 {
        const bsv20 = new Bsv20()
        Object.assign(bsv20, {
            ...obj,
            amt: BigInt(obj.amt),
        })
        return bsv20
    }
}