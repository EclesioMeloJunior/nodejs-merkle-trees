import { createHash } from 'crypto'

export type Addres = Buffer

export function hashAndHex(d: Buffer): Buffer {
    const hashFunction = createHash('sha256')
    const hex = hashFunction.update(d.toString('hex')).digest('hex')
    return Buffer.from(hex, 'hex')
}

export function fromNameToAddress(name: String): Addres {
    let nameBuff = Buffer.from(name, 'hex')
    return hashAndHex(nameBuff)
}