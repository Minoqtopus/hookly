# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Run
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled application 
- `npm run start:dev` - Run with ts-node for development
- `npm run start:watch` - Run with watch mode for development

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:payments` - Run payment-specific tests
- `npm run test:generation` - Run generation-specific tests  
- `npm run test:teams` - Run team-specific tests

### Database
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## Architecture Overview

This is a NestJS backend for Hookly, an AI-powered ad generation platform. The application follows a modular architecture with clear separation of concerns.

### Core Modules
- **AuthModule**: JWT/Google OAuth authentication, guards, strategies
- **GenerationModule**: AI ad generation using OpenAI API
- **UserModule**: User management and settings
- **TeamsModule**: Team collaboration and sharing
- **PaymentsModule**: Subscription management and billing
- **TemplatesModule**: Ad template management
- **AnalyticsModule**: Usage tracking and onboarding analytics

### Database Architecture
- **TypeORM** with PostgreSQL for data persistence
- **Entities**: User, Generation, Team, Template, Analytics, etc.
- **Migrations**: Located in `src/migrations/` - always use migrations for schema changes
- **Data Source**: Configured in `src/data-source.ts`

### Key Features
- **Rate Limiting**: Global throttling (100 req/min) with custom decorators
- **Error Handling**: Global exception filter with structured logging
- **API Documentation**: Swagger at `/api/docs`
- **Security**: JWT authentication, input validation, CORS
- **Monitoring**: Error logging with file-based storage

## Development Guidelines

### Security Constraints
- Never hardcode sensitive data - use environment variables
- All user input must be validated using class-validator DTOs
- SQL injection prevention through TypeORM/parameterized queries
- Rate limiting enforced globally and per-endpoint
- JWT tokens with proper expiration and refresh logic

### Database Best Practices
- Always create migrations for schema changes (`npm run migration:generate`)
- Entity relationships defined in `src/entities/`
- Use TypeORM query builder for complex queries
- Database configuration in `src/data-source.ts`

### Testing
- Jest configuration in `jest.config.js`
- Test setup in `test/setup.ts`
- Coverage reports generated in `coverage/` directory
- Test individual modules with specific npm scripts

### API Structure
- Controllers handle HTTP requests/responses
- Services contain business logic
- DTOs validate request/response data
- Guards handle authentication/authorization
- Interceptors for logging and rate limiting

### Environment Requirements
- DATABASE_URL for PostgreSQL connection
- FRONTEND_URL for CORS configuration
- JWT secrets and OAuth credentials
- OpenAI API configuration for generation

## Signup Control System

This application implements exclusive signup limiting to control growth:
- Database stores `total_signups_allowed` and `total_signups_completed`
- Real-time validation prevents exceeding signup limits
- Critical for cost control and sustainable scaling
- Creates exclusivity/FOMO for user acquisition

## Port Configuration
- Default port: 3001 (configurable via PORT environment variable)
- API documentation available at `/api/docs`
- CORS configured for frontend communication