import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './queue/queue.module';
import { QueueUpdatesGateway } from './queue-updates/queue-updates.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService, QueueUpdatesGateway],
})
export class AppModule {}
