import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JWTSecurityUtil } from './common/utils/jwt-security.util';

function validateSecurityConfiguration() {
  console.log('🔐 Validating production-grade security configuration...');
  
  // Enhanced JWT secret validation with entropy checking
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    JWTSecurityUtil.validateSecretStrength(jwtSecret, 'JWT_SECRET');
    JWTSecurityUtil.validateSecretStrength(jwtRefreshSecret, 'JWT_REFRESH_SECRET');
    
    // Ensure secrets are different
    if (jwtSecret === jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different for security');
    }
  } catch (error) {
    console.error('❌ JWT Security Validation Failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('💡 Generate secure secrets using: JWTSecurityUtil.generateSecureSecret()');
    throw error;
  }
  
  // Validate webhook secret for payment security
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.length < 16) {
    console.warn('WARNING: LEMON_SQUEEZY_WEBHOOK_SECRET should be at least 16 characters for security');
  }
  
  // Validate database URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  
  // Ensure production environment has secure settings
  if (process.env.NODE_ENV === 'production') {
    if (!databaseUrl.includes('ssl=true') && !databaseUrl.includes('sslmode=require')) {
      console.warn('WARNING: Database connection should use SSL in production');
    }
  }
  
  console.log('✅ Security configuration validated successfully');
}

async function bootstrap() {
  // Validate security configuration before starting the application
  validateSecurityConfiguration();
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