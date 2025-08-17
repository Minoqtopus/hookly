import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GuestGenerateDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  niche: string;

  @IsString()
  @IsNotEmpty()
  targetAudience: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}