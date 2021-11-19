import { fromNameToAddress } from './hasher';
import { MerkleTree, Node } from './tree'
import { calculateTxHash, Tx } from './txs';

const ADDR = {
    Alice: fromNameToAddress('ALICE'),
    Bob: fromNameToAddress('BOB'),
    Charlie: fromNameToAddress('CHARLIE'),
    Dan: fromNameToAddress('DAN'),
    Elise: fromNameToAddress('ELISE')
}

function createTxs(): Tx[] {
    let txs: Tx[] = new Array<Tx>();

    txs.push(calculateTxHash(ADDR.Alice, ADDR.Bob, 10, new Date().getTime()))
    txs.push(calculateTxHash(ADDR.Bob, ADDR.Charlie, 20, new Date().getTime()))
    txs.push(calculateTxHash(ADDR.Alice, ADDR.Charlie, 50, new Date().getTime()))
    txs.push(calculateTxHash(ADDR.Elise, ADDR.Dan, 45, new Date().getTime()))
    txs.push(calculateTxHash(ADDR.Alice, ADDR.Elise, 5, new Date().getTime()))
    txs.push(calculateTxHash(ADDR.Dan, ADDR.Alice, 15, new Date().getTime()))
    txs.push(calculateTxHash(ADDR.Charlie, ADDR.Elise, 13, new Date().getTime()))
    txs.push(calculateTxHash(ADDR.Bob, ADDR.Dan, 90, new Date().getTime()))

    return txs
}

function main() {
    const txs = createTxs()
    const tree = MerkleTree.fromTransactions(txs);

    console.log(tree.root.hash.toString('hex'))

    for (let i = tree.layers.length-1; i >= 0; i--) {
        console.log("Amount on layer: ", i, tree.layers[i].length)
    }

    txs.forEach((tx, idx) => {
        const proof = tree.generateProof(tx)

        if (idx === 6) {
            tx = {
                hash: tx.hash,
                input: ADDR.Charlie, 
                output: ADDR.Bob,
                amount: 10000,
                timestamp: new Date().getTime(),
            }
        }        

        const eq = tree.verifyProof(proof, tx)
        console.log(`#${idx} transaction proof -> ${eq}`)
    })
}

main();




