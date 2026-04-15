import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS — cho phép frontend dev server (Vite port 5173) gọi API
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // 2. Global prefix
  app.setGlobalPrefix('api');

  // 2. Shutdown hooks — để ECS SIGTERM kích hoạt onModuleDestroy
  app.enableShutdownHooks();

  // 3. Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Tự động strip các field không có trong DTO
      forbidNonWhitelisted: true,  // Throw lỗi nếu có field lạ
      transform: true,        // Auto-transform payload thành DTO instance
    }),
  );

  // 4. Swagger
  const config = new DocumentBuilder()
    .setTitle('Personal Blog API')
    .setDescription('REST API for Personal Blog')
    .setVersion('1.0')
    .addBearerAuth()         // Thêm nút Authorize cho JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);  // URL để truy cập Swagger UI

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();