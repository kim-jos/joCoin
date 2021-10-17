import { Injectable } from '@nestjs/common';
import { BlockDataDto } from './dtos/blockData.dto';
import { joCoin } from './joCoin';

@Injectable()
export class BlockchainService {
    getBlockchain() {
        return joCoin.getBlockchain();
    }

    addBlock(blockData: BlockDataDto) {
        return joCoin.addBlock(blockData);
    }
}
