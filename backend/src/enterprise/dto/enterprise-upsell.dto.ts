import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { IntegrationComplexity } from '../../entities/custom-integration-request.entity';
import { BillingCycle, UpsellType } from '../../entities/enterprise-upsell.entity';

export class PurchaseAdditionalUsersDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}

export class RequestCustomIntegrationDto {
  @IsString()
  integrationType: string;

  @IsString()
  requirements: string;

  @IsEnum(IntegrationComplexity)
  complexity: IntegrationComplexity;

  @IsOptional()
  @IsString()
  businessJustification?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class EnableWhiteLabelDto {
  @IsOptional()
  customBranding?: boolean;

  @IsOptional()
  customDomain?: boolean;

  @IsString()
  setupRequirements: string;
}

export class UpgradeToDedicatedSupportDto {
  @IsEnum(['basic', 'premium', 'enterprise'])
  supportLevel: 'basic' | 'premium' | 'enterprise';
}

export class CancelEnterpriseUpsellDto {
  @IsEnum(UpsellType)
  upsellType: UpsellType;
}

export class EnterpriseUpsellResponseDto {
  @IsUUID()
  id: string;

  @IsEnum(UpsellType)
  upsellType: UpsellType;

  @IsString()
  status: string;

  @IsNumber()
  monthlyPrice: number;

  @IsNumber()
  setupFee: number;

  @IsString()
  description: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  features?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  configuration?: Record<string, any>;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}
