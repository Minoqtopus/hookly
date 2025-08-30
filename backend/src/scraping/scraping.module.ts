import { Module } from '@nestjs/common';
import { ProductAnalyzerService } from './product-analyzer.service';

@Module({
  providers: [ProductAnalyzerService],
  exports: [ProductAnalyzerService],
})
export class ScrapingModule {}