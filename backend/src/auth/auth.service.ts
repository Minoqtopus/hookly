import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { AuthProvider, User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { OAuthUserDto } from './dto/oauth-user.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      auth_provider: AuthProvider.EMAIL,
      referral_code: this.generateReferralCode(),
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_provider: user.auth_provider,
        avatar_url: user.avatar_url
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user registered with OAuth but trying to login with password
    if (user.auth_provider !== AuthProvider.EMAIL) {
      throw new UnauthorizedException(`Please sign in with ${user.auth_provider}`);
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_provider: user.auth_provider,
        avatar_url: user.avatar_url
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateOAuthUser(oauthUser: OAuthUserDto) {
    const { email, google_id, avatar_url } = oauthUser;

    // Try to find existing user by email first
    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // User exists - update OAuth info if needed
      let needsUpdate = false;

      if (google_id && !user.google_id) {
        user.google_id = google_id;
        user.auth_provider = AuthProvider.GOOGLE;
        needsUpdate = true;
      }

      if (avatar_url && !user.avatar_url) {
        user.avatar_url = avatar_url;
        needsUpdate = true;
      }

      if (!user.is_verified) {
        user.is_verified = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await this.userRepository.save(user);
      }
    } else {
      // Create new user
      const authProvider = google_id ? AuthProvider.GOOGLE : AuthProvider.EMAIL;

      user = this.userRepository.create({
        email,
        google_id,
        avatar_url,
        auth_provider: authProvider,
        is_verified: true,
        referral_code: this.generateReferralCode(),
      });

      await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { 
        id: user.id, 
        email: user.email, 
        plan: user.plan,
        auth_provider: user.auth_provider,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified
      },
      ...tokens,
    };
  }

  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}