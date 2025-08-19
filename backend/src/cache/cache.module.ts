import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { StrategicCacheService } from './strategic-cache.service';

@Module({
  providers: [RedisService, StrategicCacheService],
  exports: [RedisService, StrategicCacheService],
})
export class CacheModule {}
