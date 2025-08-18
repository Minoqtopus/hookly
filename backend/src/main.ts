import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Hookly API')
    .setDescription('Comprehensive API documentation for Hookly - AI-powered ad generation platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and registration')
    .addTag('Generation', 'AI ad generation and management')
    .addTag('Users', 'User profile management')
    .addTag('Teams', 'Team collaboration features')
    .addTag('Templates', 'Ad template management')
    .addTag('Analytics', 'Usage analytics and tracking')
    .addTag('Payments', 'Subscription and billing')
    .addTag('Health', 'System health and monitoring')
    .addTag('Backup', 'Database backup management')
    .addTag('Monitoring', 'Error monitoring and logging')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();