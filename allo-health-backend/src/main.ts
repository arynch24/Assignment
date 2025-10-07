import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strips unknown properties
    forbidNonWhitelisted: true, // throws error for extra fields
    transform: true, // transforms payloads to DTO instances
  }));
  
  app.enableCors({
    origin: 'http://localhost:3000', // frontend URL
    credentials: true, // allow cookies
  });

  app.setGlobalPrefix('api');

  await app.listen(8000);

}
bootstrap();
