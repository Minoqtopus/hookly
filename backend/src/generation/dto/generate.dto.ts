import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDto {
  @ApiProperty({
    description: 'Name of the product or service to generate ads for',
    example: 'EcoFriendly Water Bottle',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: 'Market niche or industry category',
    example: 'Sustainable products',
  })
  @IsString()
  @IsNotEmpty()
  niche: string;

  @ApiProperty({
    description: 'Target audience description',
    example: 'Environmentally conscious millennials who exercise regularly',
  })
  @IsString()
  @IsNotEmpty()
  targetAudience: string;
}