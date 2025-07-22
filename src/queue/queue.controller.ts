import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { CreateQueueEntryDto } from './dto/create-queue-entry.dto';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  public createQueueEntry(
    @Request() req: { user: { id: string } },
    @Body() createQueueEntryDto: CreateQueueEntryDto,
  ) {
    return this.queueService.createQueueEntry(req.user.id, createQueueEntryDto);
  }
}
