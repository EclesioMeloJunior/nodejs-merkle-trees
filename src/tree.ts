import { off } from 'process';
import { hashAndHex } from './hasher'
import { calculateTxHash, Tx } from './txs'

export class Node {
    public left: Node = null;
    public rigth: Node = null;
    public hash: Buffer = null;

    constructor(l: Node, r: Node, hash: Buffer) {
        this.left = l;
        this.rigth = r;
        this.hash = hash;
    }

    static fromTransaction(tx: Tx): Node {
        tx = calculateTxHash(tx.input, tx.output, tx.amount, tx.timestamp)
        return new Node(null, null, tx.hash);
    }

    static fromTwoNodes(nodeL: Node, nodeR: Node): Node {
        let toConcat: Buffer[] = nodeR ? 
            [nodeL.hash, nodeR.hash] : 
            [nodeL.hash, nodeL.hash]

        let toHash: Buffer = Buffer.concat(toConcat)
        let hash = hashAndHex(toHash);

        return new Node(nodeL, nodeR, hash);
    }
}

type PType = 'left' | 'right'

export interface MerkleProof {
    position: PType
    hash: Buffer
}

export class MerkleTree {
    public root: Node
    public layers: Node[][]

    constructor(root: Node, leaves: Node[][]) {
        this.root = root
        this.layers = leaves;
    }

    static fromTransactions(txs: Array<Tx>): MerkleTree {
        // criar os leaf nodes
        let nodes = txs.map(tx => Node.fromTransaction(tx))

        let layers: Node[][] = []
        layers.push(nodes.slice())
        
        while (nodes.length > 1) {
            const midNodes: Node[] = new Array<Node>();

            for (let i = 0; i < nodes.length; i += 2) {
                let n: Node
                n = Node.fromTwoNodes(nodes[i], nodes[i + 1])

                midNodes.push(n)
            }

            layers.push(midNodes.slice())
            nodes = midNodes;
        }

        return new MerkleTree(nodes[0], layers);
    }

    generateProof(tx: Tx): MerkleProof[] {
        const node = Node.fromTransaction(tx);
        const leaves = this.layers[0];

        let proof: MerkleProof[] = []
        let index = -1

        for (let i = 0; i < leaves.length; i++) {
            const leafNode = leaves[i]
            const eq = Buffer.compare(leafNode.hash, node.hash) === 0
            if (eq) {
                index = i
                break
            }
        }

        // nao foi possivel encontrar o hash da transacao
        if (index < 0) {
            return proof
        }

        for (let i = 0; i < this.layers.length; i++) {
            const currLayer = this.layers[i]
            const rightNode = index % 2
            const pair = rightNode ? index - 1 : index + 1

            if (pair < currLayer.length) {
                proof.push({
                    position: rightNode ? 'left' : 'right',
                    hash: currLayer[pair].hash
                })
            }


            index = (index/2) | 0
        }

        return proof
    }

    verifyProof(proof: MerkleProof[], tx: Tx): Boolean {
        let fromNode = Node.fromTransaction(tx)
        let targetHash: Buffer = fromNode.hash
        
        for(let i = 0; i < proof.length; i ++) {
            const currProof = proof[i]

            let toHash: Buffer[]

            switch (currProof.position) {
                case 'left':
                    toHash = [currProof.hash, targetHash]
                    break
                case 'right':
                    toHash = [targetHash, currProof.hash]
                    break
            }

            targetHash = hashAndHex(Buffer.concat(toHash))
        }

        return Buffer.compare(this.root.hash, targetHash) === 0
    }
}