import { Controller, Post, Get, Body, UseGuards, Request, Query, Ip } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerateDto } from './dto/generate.dto';
import { GenerateVariationsDto } from './dto/generate-variations.dto';
import { GuestGenerateDto } from './dto/guest-generate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('generate')
export class GenerationController {
  constructor(private generationService: GenerationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async generate(@Request() req: any, @Body() generateDto: GenerateDto) {
    return this.generationService.generateContent(req.user.userId, generateDto);
  }

  @Post('variations')
  @UseGuards(JwtAuthGuard)
  async generateVariations(@Request() req: any, @Body() generateVariationsDto: GenerateVariationsDto) {
    return this.generationService.generateVariations(req.user.userId, generateVariationsDto);
  }

  @Post('guest')
  async generateGuest(@Body() guestGenerateDto: GuestGenerateDto, @Ip() ip: string) {
    return this.generationService.generateGuestContent(guestGenerateDto, ip);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.generationService.getUserGenerations(req.user.userId, pageNum, limitNum);
  }
}