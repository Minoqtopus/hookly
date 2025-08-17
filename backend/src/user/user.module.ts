import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Generation } from '../entities/generation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Generation]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}