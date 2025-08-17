import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { GenerationModule } from './generation/generation.module';
import { UserModule } from './user/user.module';
import { PaymentsModule } from './payments/payments.module';
import { User } from './entities/user.entity';
import { Generation } from './entities/generation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Generation],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    GenerationModule,
    UserModule,
    PaymentsModule,
  ],
})
export class AppModule {}