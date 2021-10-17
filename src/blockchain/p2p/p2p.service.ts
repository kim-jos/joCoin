import { Injectable } from '@nestjs/common';
import * as WebSocket from "ws"
import { Server } from 'ws';
import { Block } from '../block';
import { BlockDataDto } from '../dtos/blockData.dto';
import { joCoin } from '../joCoin';
import { Message } from './message.dto';
import { MessageType } from './message.type';

@Injectable()
export class P2pService {
    public sockets: WebSocket[] = [];

    private jsonToObject <T>(data: string): T {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    
    getSockets() {
        return this.sockets;
    }
    
    initP2pServer(port: number) {
        console.log('initP2pServer');

        const server: Server = new WebSocket.Server({port});

        server.on('connection', (ws: WebSocket) => {
            this.initConnection(ws);
        });

        console.log('listening websocket p2p port on: ' + port);
    }

    initConnection(ws: WebSocket) {
        console.log('initConnection');

        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        ws.send(JSON.stringify(this.queryChainLenMsg()));
    }

    initMessageHandler(ws: WebSocket) {
        console.log('initMessageHandler');

        ws.on('message', (data: string) => {
            const message: Message = JSON.parse(data);

            if (!message) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }

            console.log('Received message' + JSON.stringify(message));
            
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    ws.send(this.responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    ws.send(this.responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = this.jsonToObject<Block[]>(JSON.stringify(message.data));
                    if (!receivedBlocks) {
                        console.log('invalid blocks received:');
                        console.log(message.data)
                        break;
                    }
                    this.handleBlockchainResponse(receivedBlocks);
                    break;
            }
        });
    }

    initErrorHandler(ws: WebSocket) {
        console.log('error handler');

        const closeConnection = (myWs: WebSocket) => {
            console.log('connection failed to peer: ' + myWs.url);
            this.sockets.splice(this.sockets.indexOf(myWs), 1);
        };
        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    }

    connectToPeers (newPeer: string): void {
        console.log('connect to peers p2pservice', newPeer);

        const ws: WebSocket = new WebSocket(newPeer);
        
        ws.on('open', () => {
            this.initConnection(ws);
        });
        ws.on('error', () => {
            console.log('connection failed');
        });
    };

    private responseLatestMsg(): Message {
        console.log('res latest message');
        return {
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([joCoin.getLatestBlock()])
        }
    }
    
    private responseChainMsg(): Message {
        console.log('res chainm message');
        return {
            'type': MessageType.RESPONSE_BLOCKCHAIN, 
            'data': JSON.stringify(joCoin.getBlockchain())
        }
    }

    private handleBlockchainResponse(receivedBlocks: Block[]) {
        console.log('handle blockchain res');

        if (receivedBlocks.length === 0) {
            console.log('received block chain size of 0');
            return;
        }
        
        const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
        if (!joCoin.isBlockValid(latestBlockReceived)) {
            console.log('block structuture not valid');
            return;
        }
        const latestBlockHeld: Block = joCoin.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log('blockchain possibly behind. We got: '
                + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                if (joCoin.addBlock(latestBlockReceived.data as BlockDataDto)) {
                    this.broadcast(this.responseLatestMsg());
                }
            } else if (receivedBlocks.length === 1) {
                console.log('We have to query the chain from our peer');
                this.broadcast(this.queryAllMsg());
            } else {
                console.log('Received blockchain is longer than current blockchain');
                joCoin.chooseLongestChain(receivedBlocks);
            }
        } 
        
        else console.log('received blockchain is not longer than received blockchain. Do nothing');
    }

    private broadcast(message: Message) {
        console.log('broadcast');

        return this.sockets.forEach((socket: WebSocket) => {
            return socket.send(message)
        })
    }

    private queryAllMsg(): Message {
        console.log('query all message');

        return {'type': MessageType.QUERY_ALL, 'data': null}
    }

    private queryChainLenMsg() {
        console.log('query chain msg');
        return {'type': MessageType.QUERY_LATEST, 'data': null}
    }


}
