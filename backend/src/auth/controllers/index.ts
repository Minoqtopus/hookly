/**
 * Authentication Controllers Index
 * 
 * Centralized exports for all authentication controller modules.
 * This decomposition replaces the original AuthController god object
 * with specialized, focused controllers following single responsibility principle.
 * 
 * Staff Engineer Note: Each controller maintains the exact same API contracts,
 * security patterns, and business logic as the original monolithic controller
 * while improving maintainability and testability.
 */

export { CoreAuthenticationController } from './core-authentication.controller';
export { OAuthController } from './oauth.controller';
export { EmailVerificationController } from './email-verification.controller';
export { PasswordManagementController } from './password-management.controller';