import { AuthProvider } from '../../entities/user.entity';

export interface OAuthUserDto {
  email: string;
  provider: AuthProvider;
  providerId: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  access_token?: string;
}