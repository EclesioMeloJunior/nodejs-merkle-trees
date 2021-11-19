import { hashAndHex, Addres } from './hasher'
 
export interface Tx {
    input: Buffer
    output: Buffer
    amount: number
    timestamp: number
    hash: Buffer
}

export function calculateTxHash(from: Addres, to: Addres, amount: number, ts: number): Tx {
    let amountBuf = Buffer.alloc(4)
    amountBuf.writeInt32LE(amount ,0)

    let timestamp = Math.floor(ts / 1000)
    let timestampBuf = Buffer.alloc(4)
    timestampBuf.writeInt32LE(timestamp, 0)

    let toHash = Buffer.concat([from, to, amountBuf, timestampBuf])
    let hash = hashAndHex(toHash)

    return {
        input: from,
        output: to,
        amount: amount,
        timestamp: ts,
        hash: hash
    }
}