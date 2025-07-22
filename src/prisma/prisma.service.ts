import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    this.$connect()
      .then(() => console.log('Connected to DB'))
      .catch((err) => {
        console.log(err);
      });
  }

  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      app
        .close()
        .then(() => console.log('App closed gracefully'))
        .catch((err) => console.error('Error during shutdown:', err));
    });
  }
}
