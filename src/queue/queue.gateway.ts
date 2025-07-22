import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { TableType, QueueStatus } from '@prisma/client';
import { CreateQueueEntryDto } from './dto/create-queue-entry.dto';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/auth/guards/ws-auth.guard';
import { AuthenticatedSocket } from 'src/common/interfaces/socket.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class QueueGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) {}

  private async broadcastActiveQueue() {
    const activeQueue = await this.prisma.queueEntry.findMany({
      where: {
        status: { in: [QueueStatus.WAITING, QueueStatus.CALLED] },
      },
      orderBy: {
        queueNumber: 'asc',
      },
    });
    this.server.emit('queueUpdated', activeQueue);
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    await this.broadcastActiveQueue();
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('test')
  handleTest(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    console.log('xxxxx', socket.user);
    console.log('Data received:', data);
    return 'Test message received';
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('joinQueue')
  async handleJoinQueue(
    @ConnectedSocket() authData: AuthenticatedSocket,
    @MessageBody()
    data: CreateQueueEntryDto,
  ) {
    console.log('Join queue request:', authData);
    if (!data.partySize) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const existingEntry = await tx.queueEntry.findFirst({
        where: {
          userId: authData.user.id,
          status: { in: [QueueStatus.WAITING, QueueStatus.CALLED] },
        },
      });

      if (existingEntry) {
        console.log('User already in queue:', existingEntry);
        return;
      }

      const lastQueue = await tx.queueEntry.findFirst({
        orderBy: { queueNumber: 'desc' },
      });
      const newQueueNumber = (lastQueue?.queueNumber ?? 0) + 1;

      let assignedTableType: TableType;
      if (data.partySize >= 1 && data.partySize <= 2) {
        assignedTableType = TableType.SMALL;
      } else if (data.partySize >= 3 && data.partySize <= 4) {
        assignedTableType = TableType.MEDIUM;
      } else if (data.partySize >= 5 && data.partySize <= 6) {
        assignedTableType = TableType.LARGE;
      } else if (data.partySize > 6) {
        assignedTableType = TableType.XLARGE;
      } else {
        throw new BadRequestException();
      }

      await tx.queueEntry.create({
        data: {
          queueNumber: newQueueNumber,
          partySize: data.partySize,
          tableType: assignedTableType,
          userId: authData.user.id,
          status: QueueStatus.WAITING,
        },
      });
    });

    await this.broadcastActiveQueue();
  }

  @SubscribeMessage('callNext')
  async handleCallNext() {
    const nextInQueue = await this.prisma.queueEntry.findFirst({
      where: { status: QueueStatus.WAITING },
      orderBy: { queueNumber: 'asc' },
    });
    console.log('nextInQueue', nextInQueue);
    if (nextInQueue) {
      await this.prisma.queueEntry.update({
        where: { id: nextInQueue.id },
        data: {
          status: QueueStatus.CALLED,
          calledAt: new Date(),
        },
      });
      await this.broadcastActiveQueue();
    }
  }

  async handleSeatCustomer(@MessageBody() queueId: string) {
    console.log('Seating customer for queue entry:', queueId);
    await this.prisma.queueEntry.update({
      where: { id: queueId },
      data: {
        status: QueueStatus.SEATED,
        seatedAt: new Date(),
      },
    });
    await this.broadcastActiveQueue();
  }

  @SubscribeMessage('cancelQueue')
  async handleCancelQueue(@MessageBody() data: { queueEntryId: string }) {
    await this.prisma.queueEntry.update({
      where: { id: data.queueEntryId },
      data: {
        status: QueueStatus.CANCELED,
        canceledAt: new Date(),
      },
    });
    await this.broadcastActiveQueue();
  }
}
