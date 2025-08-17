import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class GenerateVariationsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  niche: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  targetAudience: string;
}