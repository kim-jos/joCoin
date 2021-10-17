import { Block } from "./block";
import { BlockDataDto } from "./dtos/blockData.dto";

export class Blockchain {
    public chain: Block[];
    
    constructor() {
        this.chain = [this.createGenesisBlock()]
    }

    createGenesisBlock() {
        return new Block(0, '', new Date().getTime() / 1000, 'Genesis Block');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    
    getBlockchain() {
        return this.chain;
    }

    addBlock(blockData: BlockDataDto) {
        const prevBlock: Block = this.getLatestBlock();
        const nextIdx: number = prevBlock.index + 1;
        const nextTimestamp: number = new Date().getTime() / 1000;
        const newBlock: Block = new Block(nextIdx, prevBlock.hash, nextTimestamp, blockData);

        this.chain.push(newBlock);
        return newBlock;
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currBlock: Block = this.chain[i];
            const prevBlock: Block = this.chain[i - 1];

            if (currBlock.hash !== currBlock.calculateHash()) return false;
            if (currBlock.previousHash !== prevBlock.hash) return false;
        }
        return true;
    }

    isBlockValid(block: Block): boolean {
        return typeof block.index === 'number' &&
            typeof block.hash === 'string' &&
            typeof block.previousHash === 'string' &&
            typeof block.timestamp === 'number' &&
            typeof block.data === 'string'
    }

    chooseLongestChain(newBlocks: Block[]) {
        if (this.isChainValid() && newBlocks.length > this.chain.length) {
            console.log('blockchain is valid');
            this.chain = newBlocks;
        } else console.log('blockchain is invalid');
    }
}