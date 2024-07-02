export declare class File {
    hash: string;
    size: number;
    type: string;
    text: string;
}
export declare class Inscription {
    file: File;
    fields?: {
        [key: string]: any;
    };
    parent?: string;
}
