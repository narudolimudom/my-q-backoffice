import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QueueUpdatesModule } from 'src/queue-updates/queue-updates.module';

@Module({
  imports: [PrismaModule, QueueUpdatesModule],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService]
})
export class QueueModule {}
