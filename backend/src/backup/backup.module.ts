import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([User])],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}