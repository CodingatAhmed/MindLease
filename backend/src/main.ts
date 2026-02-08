import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import {AllExceptionsFilter} from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS
  // This is essential for your Frontend (e.g., localhost:3001) to talk to your Backend
  app.enableCors({
    origin: true, // In production, replace with your actual domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Set Global Prefix (http://localhost:3000/api/...)
  app.setGlobalPrefix('api');

  // 3. Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Add this inside bootstrap()
app.useGlobalFilters(new AllExceptionsFilter());

  // 4. URI Versioning (http://localhost:3000/api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
});