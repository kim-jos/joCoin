import * as CryptoJS from 'crypto-js';
import { BlockDataDto } from './dtos/blockData.dto';

export class Block {
    public hash: string;
    
    constructor(
        public index: number,
        public previousHash: string,
        public timestamp: number,
        public data: BlockDataDto | string,
    ) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = JSON.stringify(data);
        this.hash = this.calculateHash();
    }

    calculateHash(): string {
        return CryptoJS.SHA256(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            this.data
        ).toString();
    }
}