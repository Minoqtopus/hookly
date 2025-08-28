/**
 * Authentication Services Index
 * 
 * Centralized exports for all authentication service modules.
 * This decomposition replaces the original AuthService god object
 * with specialized, focused services following single responsibility principle.
 * 
 * Staff Engineer Note: Each service maintains clear boundaries and
 * single responsibility while integrating seamlessly together.
 */

// Core authentication services (business logic)
export { CoreAuthenticationService } from './core-authentication.service';
export { OAuthAuthenticationService } from './oauth-authentication.service';
export { EmailVerificationService } from './email-verification.service';
export { PasswordManagementService } from './password-management.service';

// Supporting services (infrastructure)
export * from './supporting';