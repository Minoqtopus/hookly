import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // CRITICAL FIX: Fetch current user data from database instead of using stale JWT payload
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: [
        'id', 
        'email', 
        'is_email_verified', 
        'plan', 
        'trial_generations_used',
        'monthly_generation_count',
        'trial_ends_at',
        'monthly_reset_date'
      ]
    });

    if (!user) {
      throw new UnauthorizedException('User not found or account disabled');
    }

    // Return fresh user data for consistent session state
    return {
      userId: user.id,
      sub: user.id, // For backward compatibility
      email: user.email,
      is_email_verified: user.is_email_verified,
      plan: user.plan,
      trial_generations_used: user.trial_generations_used,
      monthly_generation_count: user.monthly_generation_count,
      trial_ends_at: user.trial_ends_at,
      monthly_reset_date: user.monthly_reset_date
    };
  }
}