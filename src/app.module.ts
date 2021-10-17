import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainController } from './blockchain/blockchain.controller';
import { BlockchainService } from './blockchain/blockchain.service';
import { P2pService } from './blockchain/p2p/p2p.service';

@Module({
  imports: [],
  controllers: [AppController, BlockchainController],
  providers: [AppService, BlockchainService, P2pService],
})
export class AppModule {}
