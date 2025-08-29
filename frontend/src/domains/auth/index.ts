/**
 * Auth Domain - Public API
 * 
 * Staff Engineer Design: Clean domain exports
 * Business Logic: Centralized auth functionality
 * No Mock Data: Real backend integration
 */

// Export contracts (types)
export * from './contracts/auth';

// Export repository
export { AuthRepository } from './repositories/auth-repository';

// Export service
export { AuthService } from './services/auth-service';

// Export use cases
export { ChangePasswordUseCase } from './use-cases/change-password-use-case';
export { ForgotPasswordUseCase } from './use-cases/forgot-password-use-case';
export { GoogleOAuthUseCase } from './use-cases/google-oauth-use-case';
export { LoginUseCase } from './use-cases/login-use-case';
export { LogoutUseCase } from './use-cases/logout-use-case';
export { RefreshTokenUseCase } from './use-cases/refresh-token-use-case';
export { RegisterUseCase } from './use-cases/register-use-case';
export { ResetPasswordUseCase } from './use-cases/reset-password-use-case';
export { SendVerificationEmailUseCase } from './use-cases/send-verification-email-use-case';
export { VerifyEmailUseCase } from './use-cases/verify-email-use-case';

// Export hooks
export { useAuth } from './hooks/use-auth';
