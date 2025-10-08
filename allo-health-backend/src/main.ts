import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strips unknown properties
    forbidNonWhitelisted: true, // throws error for extra fields
    transform: true, // transforms payloads to DTO instances
  }));
  
  app.enableCors({
    origin: configService.get('ORIGIN'), // frontend URL
    credentials: true, // allow cookies
  });

  app.setGlobalPrefix('api');

  await app.listen(8000);

}
bootstrap();
