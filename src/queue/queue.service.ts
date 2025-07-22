import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQueueEntryDto } from './dto/create-queue-entry.dto';
import { QueueStatus, TableType } from '@prisma/client';
import * as moment from 'moment-timezone';

@Injectable()
export class QueueService {
  constructor(
    private readonly prismaService: PrismaService,
    // private readonly queueUpdateGateway: QueueUpdatesGateway,
  ) {}

  public async createQueueEntry(
    userId: string,
    createQueueEntryDto: CreateQueueEntryDto,
  ) {
    const { partySize, notes } = createQueueEntryDto;

    const existingQueueEntry = await this.prismaService.queueEntry.findFirst({
      where: { userId },
    });

    if (
      existingQueueEntry &&
      (existingQueueEntry.status === QueueStatus.WAITING ||
        existingQueueEntry.status === QueueStatus.CALLED)
    ) {
      throw new ConflictException();
    }

    let assignedTableType: TableType;
    if (partySize >= 1 && partySize <= 2) {
      assignedTableType = TableType.SMALL;
    } else if (partySize >= 3 && partySize <= 4) {
      assignedTableType = TableType.MEDIUM;
    } else if (partySize >= 5 && partySize <= 6) {
      assignedTableType = TableType.LARGE;
    } else if (partySize > 6) {
      assignedTableType = TableType.XLARGE;
    } else {
      throw new BadRequestException();
    }

    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'day').toDate();

    const lastQueueEntryToday = await this.prismaService.queueEntry.findFirst({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        queueNumber: 'desc',
      },
    });

    const newQueueNumber = (lastQueueEntryToday?.queueNumber || 0) + 1;
    const newQueue = await this.prismaService.queueEntry.create({
      data: {
        userId,
        queueNumber: newQueueNumber,
        partySize,
        tableType: assignedTableType,
        notes,
        status: QueueStatus.WAITING,
      },
    });

    return newQueue;
  }

  public async updateQueueStatus(queueId: string, updateQueueDto: any) {
    const updateQueue = await this.prismaService.queueEntry.update({
      where: {
        id: queueId,
      },
      data: updateQueueDto,
    });

    return updateQueue;
  }

  public async cancelQueue(userId: string, queueId: string) {
    const canceledQueue = await this.prismaService.queueEntry.update({
      where: { id: queueId },
      data: {
        status: QueueStatus.CANCELED,
        canceledAt: moment().toDate(),
      },
      include: {},
    });

    return canceledQueue;
  }
}
