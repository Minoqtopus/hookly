import { IsEnum } from 'class-validator';
import { UserPlan } from '../../entities/user.entity';

export class UpdatePlanDto {
  @IsEnum(UserPlan)
  plan: UserPlan;
}