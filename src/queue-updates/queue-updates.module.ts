// src/queue-updates/queue-updates.module.ts
import { Module } from '@nestjs/common';
import { QueueUpdatesGateway } from './queue-updates.gateway';
// import { QueueUpdatesService } from './queue-updates.service';

@Module({
  providers: [QueueUpdatesGateway],
  exports: [QueueUpdatesGateway],
})
export class QueueUpdatesModule {}