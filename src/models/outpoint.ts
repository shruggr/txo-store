
export class Outpoint {
    txid: Uint8Array;
    vout: number;

    constructor(outpoint: string | Uint8Array) {
        if (typeof outpoint === 'string') {
            const [txid, vout] = outpoint.split("_");
            this.txid = Buffer.from(txid, 'hex').reverse();
            this.vout = parseInt(vout, 10)
        } else {
            this.txid = outpoint.slice(0, 32);
            const view = new DataView(outpoint.buffer);
            this.vout = view.getUint32(32, true);
        }
    }

    toString(): string {
        return `${Buffer.from(this.txid).reverse().toString('hex')}_${this.vout}`;
    }

    txidString(): string {
        return Buffer.from(this.txid).reverse().toString('hex');
    }

    toBytes(): Uint8Array {
        const b = Buffer.alloc(36);
        Buffer.from(this.txid).copy(b, 0);
        b.writeUInt32LE(this.vout, 32);
        return b;
    }

    toJSON() {
        return this.toString();
    }

    static fromJSON(json: string) {
        return new Outpoint(json);
    }

}