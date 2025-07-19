import { Logger } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*' // FIX specific allow domain in prod
  },
  namespace: '/queue'
})
export class QueueUpdatesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  private readonly logger = new Logger(QueueUpdatesGateway.name)

  public handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  public handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  public emitQueueUpdate(data: any) {
    this.logger.debug(`Emitting queueUpdate: ${JSON.stringify(data)}`);
    this.server.emit('queueUpdate', data);
  }

  @SubscribeMessage('requestQueueStatus')
  public handleRequestQueueStatus(
    client: Socket,
    @MessageBody() data: any
  ): void {
    this.logger.log(`Client ${client.id} requested queue status.`);
  }
}
