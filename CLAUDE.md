# CLAUDE.md - Project Context

## Current Project: Hookly - AI-Powered Viral Content Generation Platform

### User Requirements & Constraints:
- **Testing Philosophy**: Build one feature at a time, fully functional and UI-connected for manual testing
- **Budget**: Bootstrap constraints - $500/month total budget  
- **Goal**: Build platform with 90:10 odds of market domination

### Current Implementation Status:

#### ✅ COMPLETED:
1. **Centralized Pricing System**: 
   - All pricing logic centralized in `/backend/src/pricing/pricing.config.ts`
   - **Trial**: 5 generations total (premium product positioning)

2. **Advanced Prompt Engineering System**: 
   - World-class prompts in `/backend/src/ai/prompts/viral-content-prompts.ts`
   - Psychological triggers, viral frameworks, platform-specific optimization

3. **Product URL Analyzer**: 
   - Backend service with web scraping and security controls
   - API endpoint with auto-fill functionality in generate page

#### ✅ COMPLETED:
4. **Authentication System Architecture**: 
   - **PROPER LAYERED ARCHITECTURE**: Fixed all layer violations
   - **Use-Case Layer**: Handles all business logic (email validation, generation calculations, business rules)
   - **Hook Layer**: Only handles UI state, coordination, and user interactions  
   - **Consistent Business Rules**: 5 trial generations for all users (premium positioning)
   - **BREAKING CHANGES APPLIED**: Removed legacy AuthErrorHandler and AuthStateManager
   - **Simplified Codebase**: Eliminated redundant complexity and workarounds
   - **Smaller Bundle**: Removed dead code, cleaner architecture
   - **Production Ready**: Clean separation, predictable behavior, no layer violations

### Frontend Architecture (Layered Design):

#### **UI Layer** (The Face of Your App)
- **Purpose**: Shows buttons, forms, and information to users
- **Analogy**: The front desk of a hotel - pretty and helpful, but doesn't know how to cook
- **Example**: A login form that users see and fill out
- **Files**: `app/` directory pages (`.tsx` components)

#### **Hook Layer** (The Memory Keeper)
- **Purpose**: Remembers what users are doing, shows loading states, handles success/error messages
- **Analogy**: A personal assistant who remembers your schedule and tells you what to do next
- **Example**: "User is logging in... show spinner... success! go to dashboard"
- **Files**: `src/domains/*/hooks/` (e.g., `use-auth.ts`)

#### **Use-Case Layer** (The Rule Enforcer)
- **Purpose**: Checks if data is valid, follows business rules, prepares information
- **Analogy**: A bouncer at a club - checks IDs and makes sure people follow the rules
- **Example**: "Email must have @ symbol, password must be 8+ characters"
- **Files**: `src/domains/*/use-cases/` (e.g., `login-use-case.ts`)

#### **Service Layer** (The Coordinator)
- **Purpose**: Makes sure multiple things happen in the right order
- **Analogy**: A wedding planner - coordinates the ceremony, reception, and photos
- **Example**: "First register user, then create profile, then send welcome email"
- **Files**: `src/domains/*/services/` (e.g., `auth-service.ts`)

#### **Repository Layer** (The Messenger)
- **Purpose**: Sends requests to the server and brings back responses
- **Analogy**: A mail carrier - delivers your message and brings back the reply
- **Example**: "Send login request to server, get back user info and tokens"
- **Files**: `src/domains/*/repositories/` (e.g., `auth-repository.ts`)

#### **API Client Layer** (The Delivery Truck)
- **Purpose**: Handles the technical internet stuff - headers, authentication, errors
- **Analogy**: A delivery truck with GPS and proper packaging
- **Example**: "Add 'Authorization: Bearer token123' header, send POST request"
- **Files**: `src/shared/api/api-client.ts`

#### **Shared Services Layer** (The Utilities)
- **Purpose**: Common tools used throughout the app - storing tokens, showing notifications
- **Analogy**: A toolbox that different workers can use
- **Example**: "Save login token to browser, show success message, navigate to dashboard"
- **Files**: `src/shared/services/` (e.g., `token-service.ts`, `notification-service.ts`)

### Key Architecture Decisions:
- **Layered Architecture**: Clean separation of concerns across 7 distinct layers
- **Domain-Driven Design**: Modular frontend architecture by business domains
- **Security-First**: All API endpoints protected, rate limiting implemented
- **Bootstrap-Friendly**: Cost-conscious design decisions
- **O(1) Database Operations**: Optimized query patterns
- **Single Source of Truth**: Centralized configuration management

### Development Commands:
- Backend: `npm run start:dev` (currently running on bash_12)
- Frontend: `npm run dev`
- Test: Manual testing required after each feature implementation

### Next Actions:
1. Test Product URL Analyzer end-to-end
2. Verify authentication stability
3. Move to next feature implementation
4. Update this file as progress is made

### Critical Files Modified:
#### Backend:
- `/backend/src/scraping/product-analyzer.service.ts` (New - Product URL Analyzer)
- `/backend/src/generation/generation.controller.ts` (Modified - Added analyzer endpoint)
- `/backend/src/pricing/pricing.config.ts` (New - Centralized pricing)
- `/backend/src/ai/prompts/viral-content-prompts.ts` (New - Advanced prompts)

#### Frontend - Authentication Overhaul:
- `/frontend/src/shared/api/api-client.ts` (Major Overhaul - Automatic token refresh)
- `/frontend/src/shared/services/token-service.ts` (Enhanced - Token validation)
- `/frontend/src/shared/services/auth-error-handler.ts` (New - Centralized error handling)
- `/frontend/src/shared/services/auth-state-manager.ts` (New - Global auth state)
- `/frontend/app/(protected)/generate/page.tsx` (Fixed - Uses TokenService properly)
- `/frontend/src/shared/services/index.ts` (Updated - Exports all auth services)