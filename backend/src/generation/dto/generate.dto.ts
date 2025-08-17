import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  niche: string;

  @IsString()
  @IsNotEmpty()
  targetAudience: string;
}