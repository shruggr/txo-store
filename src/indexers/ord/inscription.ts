// type File struct {
// 	Hash     []byte `json:"hash"`
// 	Size     uint32 `json:"size"`
// 	Type     string `json:"type"`
// 	Content  []byte `json:"-"`
// 	Encoding string `json:"encoding,omitempty"`
// 	Name     string `json:"name,omitempty"`
// }

import type { Origin } from "../../models/origin";
import type { Outpoint } from "../../models/outpoint";

export interface File {
    hash: string,
    size: number,
    type: string,
    content: Uint8Array,
}

export interface Inscription {
    file: File,
    parent?: Outpoint,
    fields: {[key: string]: any},
}

export interface Ordinal {
    inscription?: Inscription
    origin?: Origin
}