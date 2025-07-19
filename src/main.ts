import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // FIX
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    Credential: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // remove not allow property from dto
    forbidNonWhitelisted: true,
    transform: true
  }))

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
