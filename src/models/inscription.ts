export class File {
    hash = ''
    size = 0
    type = ''
    text = ''
}

export class Inscription {
    file = new File()
    fields?: {[key: string]: any}
    parent?: string
}
