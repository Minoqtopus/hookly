import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DemoGenerationDto {
  @ApiProperty({
    description: 'Name of the product or service to generate ads for',
    example: 'EcoClean All-Purpose Cleaner',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productName: string;

  @ApiProperty({
    description: 'Market niche or industry category',
    example: 'Eco-friendly cleaning products',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  niche: string;

  @ApiProperty({
    description: 'Target audience demographic',
    example: 'Environmentally conscious homeowners aged 25-45',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  targetAudience: string;
}