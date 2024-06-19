import { PrivateKey, PublicKey } from "@bsv/sdk";
import { Level } from "level";

export interface Account {
    id: String,
    wif: String,
}

export interface Derivation {
    counterParty?: string
    invoice: string
    wif?: string
    publicKey: string
    address: string
}

export interface Public {
    publicKey: string
    address: string
}

export class AccountManager {
    private db = new Level<string, Account>('accountManager', {valueEncoding: 'json'})
    private accounts = this.db.sublevel<string,Account>('accounts', {valueEncoding: 'json'})
    private derivations = this.db.sublevel<string, Derivation>('derivations', {valueEncoding: 'json'})
    // private byAddress: AbstractLevel.AbstractLevel<string, string>
    private priv: PrivateKey
    constructor(id: string, primaryWif: string, ) {
        this.priv = PrivateKey.fromWif(primaryWif)
        this.byAddress = this.db.sublevel<string, string>('byAddress', {valueEncoding: 'json'})
    }

    createAccount(id: string, wif: string, additionalWifs: {[invoice: string]}): Account {
        const account = {id, wif}
        this.accounts.put(id, account)
        return account
    }
    getPubKey(): string {
        return this.priv.toPublicKey().toString()
    }

    getDerivation(invoice: string, counterParty?: string): Public {
        const key = `${counterParty || ''}_${invoice}`
        try {
            const pub = this.db.get(key)
        }
        this.priv.deriveChild
    }
}