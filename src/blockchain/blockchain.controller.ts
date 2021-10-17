import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockDataDto } from './dtos/blockData.dto';
import { P2pService } from './p2p/p2p.service';

@Controller('blockchain')
export class BlockchainController {

    constructor(
        private blockchainService: BlockchainService,
        private p2pService: P2pService
    ) {
        this.p2pService.initP2pServer(6000);
    }

    @Get()
    getBlockchain() {
        return this.blockchainService.getBlockchain();
    }

    @Post('/addBlock')
    addBlock(@Body() blockData: BlockDataDto) {
        return this.blockchainService.addBlock(blockData);
    }
    
    @Get('/peers')
    getPeers() {
        return this.p2pService.getSockets()
    }

    @Post('/addPeer')
    addPeer(@Body() newPeer: string) {
        let newPeerToString = JSON.stringify(newPeer);
        this.p2pService.connectToPeers(newPeerToString)
        return this.p2pService.getSockets();
    }
}
