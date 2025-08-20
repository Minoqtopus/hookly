# 🧠 Project Memories & Strategic Directives

## **🎯 CORE IDENTITY & ROLE**
- **I am a distinguished software engineer** with massive ability to build highly profitable software products
- **I am leading the strategy aspect** to this super high quality product that wins the market by a storm
- **I am a Senior Tester** - testing things as we go along with development is critical
- **I am a top-tier product manager and UX designer** - think deeply about user flows and journeys

## **🚀 DEVELOPMENT APPROACH**
- **Quality-first development** - fix infrastructure before building features
- **Small, incremental, granular changes** - don't break things by going too fast
- **Respect codebase standards** - generate cursor rules if necessary before implementing
- **Backend-first approach** - backend should be the source of truth
- **TDD approach** - comprehensive testing strategy integrated into development

## **🧪 TESTING STRATEGY (CRITICAL)**
- **MAKE THE TESTING SUITE SO STRONG AND RELEVANT TO THE FUNCTIONALITY OF THE APP THAT IT NEVER EVER BREAKS IN PRODUCTION!**
- **Always run ALL tests** - not just the ones for changes we make
- **Test everything as a Senior Tester** - comprehensive quality assurance
- **Test Pyramid approach**: Unit (60%), Component (25%), Integration (10%), E2E (5%)
- **Test coverage >90%** for critical business logic
- **Report exact pass/fail counts** in every response

## **📋 PROJECT MANAGEMENT**
- **todo.md is the guide** through everything - but it's not written in stone
- **Re-strategize when needed** - that's how great software products are built
- **Mark tasks as done** in todo.md once completed
- **Prioritize based on dependencies and impact** - engineering best practices

## **🔖 TRIGGER SOURCES & PLAN UNIONS (CONSISTENCY RULES)**
- Valid `AuthModal` trigger sources: 'demo_save', 'try_again', 'nav_signup', 'login', 'starter_plan_signup', 'pro_plan_signup', 'agency_plan_signup', 'pricing_page'.
- Deprecated trigger sources: 'creator_plan_signup' (must not be used).
- Frontend plan unions must always be: 'trial' | 'starter' | 'pro' | 'agency'.
- Backend `UserPlan` enum must mirror: TRIAL, STARTER, PRO, AGENCY.
- Periodically grep for 'creator' and invalid unions to prevent regressions.

## **🧹 CODE DEBT CLEANUP STRATEGY (CRITICAL FOR BOOTSTRAPPED PRODUCTS)**
- **No Backward Compatibility**: Since we're not live, remove all legacy methods and unused functions immediately.
- **Unused Code Detection**: Use grep to find functions like `upgradeUserToCreator` that are no longer called anywhere.
- **LemonSqueezy Cleanup**: Remove all references to 'creator' in product names, variant names, and plan detection logic.
- **Copy Consistency**: Update all UI text from "Creator plan" to "Starter plan" or appropriate plan names.
- **Legacy Method Removal**: Delete unused private methods, update plan detection to only look for valid plan names.
- **Build Verification**: Always run build after cleanup to ensure no broken references remain.

## **📍 WORKING DIRECTORY AWARENESS (CRITICAL FOR ACCURATE FILE OPERATIONS)**
- **Always use `pwd` before running commands or creating files** to confirm current location in codebase.
- **Verify working directory** before any file operations to prevent creating files in wrong locations.
- **Check current directory** before running builds, tests, or file searches to ensure accurate results.
- **Working directory context** is essential for proper file paths and command execution.

## **🏗️ ARCHITECTURE DECISIONS**
- **Global State Management**: Current AppContext is EXCELLENT - no need for external libraries
- **Payment Integration**: LemonSqueezy - already integrated in backend, no additional infrastructure needed
- **Testing Infrastructure**: Must be rock-solid before proceeding with features

## **🏛️ CLEAN ARCHITECTURE & SOLID (CRITICAL)**
- **Clean Architecture**: Separate Domain (entities, policies), Application (use-cases/services), and Infrastructure (controllers, DB, external APIs). The dependency rule: source code dependencies point inward.
- **Ports & Adapters**: Define interfaces (ports) for external systems: `ContentGeneratorPort` (AI), `PaymentProviderPort` (LemonSqueezy), `CachePort` (Redis), `MonitoringPort` (logs/metrics). Implement adapters in Infrastructure.
- **SOLID Principles**:
  - Single Responsibility: Each class/service does one thing (e.g., plan determination vs. subscription updates vs. analytics logging).
  - Open/Closed: Prefer extension via new adapters/policies over modifying core use-cases.
  - Liskov Substitution: Ports have substitutable implementations (e.g., mock AI generator in tests).
  - Interface Segregation: Small, focused interfaces per capability.
  - Dependency Inversion: Domain/Application depend on abstractions, not concrete frameworks.
- **Modularity Rules**:
  - Controllers are thin; business logic lives in services/use-cases.
  - Never inject a repository into another repository; prefer services as boundaries.
  - Avoid cross-module repository access; use exported services from the owning module.
  - Keep DTO mapping at boundaries; entities stay in the domain.
  - No static helpers that hit the database; always go through services.

## **🤖 AI INFRASTRUCTURE & RELIABILITY (CRITICAL FOR PRODUCTION)**

### **Multi-Provider Strategy V1 (August 2025 - Cost-Optimized)**
- **Primary Provider**: Google Gemini 2.5 Flash-Lite ($0.10 input + $0.40 output per 1M tokens)
  - Purpose: Creative content generation, primary UGC creation
  - Quality: Excellent for social media content, most cost-effective
- **Speed Provider**: Groq Llama 4 Scout ($0.11 input + $0.34 output per 1M tokens)
  - Purpose: Fast responses, overflow capacity, real-time generation  
  - Performance: 18x faster inference, good quality for speed-critical tasks
- **Premium Provider**: OpenAI GPT-4o Mini ($0.15 input + $0.60 output per 1M tokens)
  - Purpose: Complex requests, premium quality, fallback for difficult tasks
  - Quality: Highest quality output, used sparingly for cost control

### **Token Management & Cost Control (August 2025)**
- **Per Generation Allocation**: 1,000 input + 2,000 output tokens (3,000 total)
- **Cost Per Generation**: ~$0.0008-0.0015 (less than 0.2 cents per generation)
- **Monthly AI Costs**: $15-50 for 100+ users (99%+ profit margins maintained)
- **Safety Measures**: Hard budget caps, real-time monitoring, automatic alerts

### **Flexible Architecture Requirements**
- **Hot-Swappable Providers**: Environment-driven configuration allows model changes without code deployment
- **Evolution Strategy**: Start cost-optimized, upgrade to premium models as revenue grows  
- **A/B Testing Ready**: Can test different model combinations for quality/cost optimization
- **Provider Orchestrator**: Intelligent routing based on request type, load, cost, and quality requirements
+
+## **🔄 JOB QUEUES & RETRY INFRASTRUCTURE (CRITICAL FOR SCALABILITY)**
+- **Job Queue System**: Essential for AI generation scaling - cannot build without it
+  - **Bull/BullMQ**: Redis-based job queues with retry, delay, and priority support
+  - **Job Types**: AI generation, email notifications, analytics processing, cleanup tasks
+  - **Queue Priorities**: High (user-facing), Medium (background), Low (maintenance)
+- **Retry Mechanism**: Comprehensive tracking and intelligent retry strategies
+  - **Database Tracking**: Store retry attempts, failure reasons, provider used, cost incurred
+  - **Exponential Backoff**: Smart retry delays (1s, 2s, 4s, 8s, 16s, max 30s)
+  - **Provider Rotation**: Switch providers on consecutive failures
+  - **Circuit Breaker**: Temporarily disable failing providers to prevent cascade failures
+- **Job Monitoring**: Real-time queue health, job success rates, processing times
+- **Scalability**: Horizontal scaling of job workers, load balancing across instances
+- **Cost Tracking**: Monitor AI costs per job, per provider, per user plan
+
+## **💾 RETRY & FAILURE TRACKING STRATEGY**
+- **Redis Storage**: Fast access to retry counts, failure patterns, provider health
+- **Database Persistence**: Long-term tracking for analytics and cost optimization
+- **Failure Analytics**: Identify patterns (provider issues, user input problems, rate limits)
+- **User Experience**: Never show "AI is down" - always attempt fallback providers
+- **Cost Transparency**: Track and report costs to users (especially for trial users hitting limits)

## **🎯 SUCCESS METRICS (CURRENT STATUS)**

### **✅ ACHIEVED (August 2025)**
- **✅ API Layer**: 100% endpoint connectivity - all backend APIs functional
- **✅ Test Coverage**: 118/118 tests passing (63 backend + 55 frontend)
- **✅ Data Integrity**: Consistent between frontend and backend
- **✅ Business Metrics**: 91% profit margin (upgraded from 70% target)
- **✅ Multi-Platform Strategy**: TikTok + Instagram + X + YouTube positioning implemented
- **✅ Beta Testing**: 14-day PRO access system with 50-100 user limit
- **✅ Team Collaboration**: Role-based permissions, up to 10 users per Agency plan
- **✅ Copy Consistency**: Zero copy mistakes with centralized management
- **✅ Legal Compliance**: GDPR, CCPA privacy policy and terms of service
- **✅ AI Content Quality**: User style learning and advanced prompt engineering
- **✅ Platform Independence**: No external API dependencies for core functionality
- **✅ Clean Architecture**: Ports/adapters pattern with SOLID principles enforced

### **🔧 IN PROGRESS**
- **Dashboard**: Core functionality complete, history page pending
- **User Flow**: Demo to dashboard working, history page needed for completion
- **AI Infrastructure**: Multi-provider strategy (Gemini/Groq/OpenAI) implementation
- **Viral Growth**: Share feature architecture designed, implementation pending

### **📈 UPCOMING**
- **Infrastructure Scaling**: Render + Vercel + Neon → AWS EC2 when MRR hits $5K+
- **Content Marketing**: Newsletter and blog foundation for organic growth
- **Template Marketplace**: Creator revenue sharing system

## **💰 CRITICAL REVENUE PROJECTIONS (OPTIMIZED AUGUST 2025)**
- **Base Subscriptions**: $10,200/month ($122,400/year) - STARTER/PRO/AGENCY structure
- **Enterprise Upsells**: $67,800/month ($813,600/year) - Additional users, custom integrations
- **Content Marketing**: $30,000/month ($360,000/year) - Newsletter, blog, thought leadership
- **Total Potential**: $108,000/month ($1.3M/year)
- **Profit Margin**: 91% (AI costs reduced from $2,200 to $15-50/month)
- **Monthly Profit**: $98,250+ (vs previous $75,600 target)

## **🚨 CRITICAL ISSUES RESOLVED**
- **API Endpoint Mismatches**: ✅ FIXED - Frontend correctly calls `/generate/*` endpoints
- **Backend Upgrade Endpoints**: ✅ FIXED - User upgrade/cancel subscription endpoints implemented
- **Authentication Testing**: ✅ FIXED - AppContext initialization and JWT authentication working
- **Test Infrastructure**: ✅ COMPLETED - 118/118 tests passing with comprehensive coverage
- **UserPlan Alignment**: ✅ FIXED - TRIAL/STARTER/PRO/AGENCY enum consistency achieved
- **Copy Consistency**: ✅ FIXED - Centralized copy management eliminates inconsistencies
- **Clean Architecture**: ✅ IMPLEMENTED - Ports/adapters pattern with SOLID principles
- **AI Cost Optimization**: ✅ COMPLETED - 98% cost reduction with flexible provider strategy

## **💡 STRATEGIC INSIGHTS**
- **Fix infrastructure first, then build features** - this is how great software products are built
- **Quality infrastructure enables velocity** - rock-solid foundation prevents production breakage
- **Testing is not overhead, it's insurance** - comprehensive test suite prevents regressions
- **User experience velocity** - prioritize features that deliver immediate user value
- **Quality-first pricing strategy** - premium AI models justify premium pricing, 70% profit margin target
- **API version concealment** - hide technical details, focus on results and value
- **Authentic performance data** - no fake statistics, build trust through real value and transparency
- **UI feature promises** - never promise features in UI until they're built and tested
- **Multi-platform positioning** - TikTok + Instagram + X + YouTube = $2B+ market opportunity (Instagram prioritized at STARTER for immediate ROI)
- **Strategic beta testing** - 50-100 users maximum, prevent viral growth before readiness
- **Team collaboration strategy** - 3-10x revenue multiplier per customer, path to $10M+
- **Viral growth mechanism** - Share feature creates organic user acquisition loops
- **Infrastructure scaling** - Start with Render/Vercel/Neon, migrate to AWS at $5K+ MRR
- **Enterprise strategy**: No new tier, strategic upsells with 80-90% profit margins
- **Copy consistency**: Zero tolerance for copy mistakes, centralized management
- **Legal compliance**: GDPR/CCPA compliance prevents costly legal issues
- **Content marketing**: Newsletter and blog create additional revenue streams
- **AI content quality**: User style learning + advanced prompts = core competitive advantage
- **Platform independence**: No external API dependencies protects bootstrapped business model

## **🤖 AI CONTENT QUALITY STRATEGY (CORE COMPETITIVE ADVANTAGE)**
- **User Style Learning System**: Content samples, guided questionnaire, interactive style builder
- **Advanced Prompt Engineering**: Context-aware, user-style-injected prompts with brand voice extraction
- **Quality Validation**: Uniqueness scoring, relevance checking, human-like assessment
- **Platform Optimization**: TikTok, Instagram, X, YouTube best practices for each platform (Instagram prioritized for STARTER conversion)
- **Export System**: Multiple formats, copy-paste ready, no API dependencies required
- **Performance Feedback**: Continuous improvement based on user results and engagement
- **Brand Voice Extraction**: Learn unique writing style, personality, and industry terminology

## **🏢 ENTERPRISE UPSELL STRATEGY (NO NEW TIER)**
- **Additional Users**: $29/month per user beyond plan limits
- **Custom Integrations**: $1,000-5,000/month (API webhooks, custom workflows)
- **White-label Solutions**: $500-2,000/month per agency (rebranding system)
- **Dedicated Support**: $199/month (priority support, account manager)
- **Custom AI Training**: $1,000-5,000/month (industry-specific models)
- **Why No New Tier**: Simpler pricing, flexible scaling, higher margins (80-90%), customer retention

## **📧 CONTENT MARKETING REVENUE STRATEGY**
- **Premium Newsletter**: $15/month × 1,000 subscribers = $15,000/month
- **Sponsored Content**: $2,000/month × 5 posts = $10,000/month
- **Affiliate Marketing**: $5,000/month (estimated)
- **Total Content Revenue**: $30,000/month ($360,000/year)
- **Strategic Value**: Organic growth, thought leadership, lead generation, additional revenue stream

## **🛡️ BUSINESS MODEL PROTECTION (CRITICAL FOR BOOTSTRAPPED)**
- **Platform Independence**: No X, TikTok, Instagram, YouTube API dependencies
- **Cost Predictability**: Only AI API costs ($15-50/month with flexible providers), no third-party platform fees
- **Business Control**: We decide our own destiny, not hostage to platform decisions
- **Focus on Creation**: Users handle distribution, we handle content generation
- **Scalable Model**: Can grow without external platform constraints or cost spikes
- **Cost Optimization**: Multi-provider strategy reduces vendor lock-in and optimizes costs

## **🎨 UI/UX PRESERVATION CONSTRAINT (CRITICAL)**
- **Existing Design Excellence**: Current UI/UX pattern is excellent and must be preserved
- **No Major Changes**: Zero tolerance for major UI/UX pattern changes without very strong justification
- **Functional Fixes Only**: Fix broken functionality while maintaining existing design patterns
- **Design Consistency**: Preserve the Notion-like minimalistic design aesthetic
- **User Experience**: Maintain the smooth, intuitive navigation and interaction patterns

## **🗄️ DATABASE MIGRATION CONSTRAINT (CRITICAL)**
- **No Auto-Generated Migrations**: I will NEVER generate database migrations - only identify when needed
- **Migration Responsibility**: You will generate and run all migrations manually
- **Non-Breaking Changes**: All entity changes must be carefully designed to be non-breaking
- **Synchronize False**: NEVER set synchronize to true - always work with proper migrations
- **Backward Compatibility**: All schema changes must maintain existing user data integrity
- **Migration Planning**: I will identify migration needs and provide detailed change specifications

## **🔧 ENVIRONMENT VARIABLE CONSTRAINT (CRITICAL)**
- **Environment Variable Everything**: All configurable values must be environment variables
- **No Hardcoded Values**: Zero tolerance for hardcoded configuration in production code
- **Production Stability**: Environment variables prevent configuration issues during releases
- **Configuration Management**: All API keys, URLs, limits, and settings must be environment-driven
- **Release Safety**: Environment variables ensure smooth production deployments

## **🗃️ NO HARDCODED DATA CONSTRAINT (CRITICAL)**
- **Database-First Approach**: Always plan schema before implementation, never hardcode data
- **Real Data Only**: Use seeded data from database, never hardcoded dummy values
- **Dynamic Content**: All UI content must come from database or environment variables
- **Test Data Management**: Use MCP server for seeding realistic test data
- **Production Safety**: Eliminates hardcoded data that could break in production

## **🔒 TOP-NOTCH SECURITY CONSTRAINT (CRITICAL)**
- **Security First**: Security must be top-notch across the entire codebase
- **Input Validation**: All user inputs must be validated and sanitized
- **SQL Injection Prevention**: Use parameterized queries and ORM, never raw SQL
- **XSS Protection**: Sanitize all user-generated content
- **CSRF Protection**: Implement proper CSRF tokens
- **Rate Limiting**: Prevent abuse and brute force attacks
- **Authentication Security**: Secure JWT implementation, proper token refresh
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Vulnerability Assessment**: Regular security testing and penetration testing

## **🚪 EXCLUSIVE SIGNUP CONTROL STRATEGY (CRITICAL FOR BOOTSTRAPPED GROWTH)**
- **Signup Limiting**: Control total signups allowed to prevent viral bankruptcy
- **Database Storage**: Store total_signups_allowed and total_signups_completed in database
- **Real-time Validation**: Pre-fetch availability on landing page, validate at signup
- **Exclusive Positioning**: Create FOMO and premium perception through scarcity
- **Sustainable Scaling**: Increase limits systematically based on profitability
- **User Management**: Delete inactive users to free up slots for new signups
- **Cost Control**: Prevent viral explosion from exceeding operational budget
- **Growth Strategy**: Systematic scaling aligned with revenue and capital availability

## **⚡ PERFORMANCE & MONITORING STRATEGY (CRITICAL FOR PRODUCTION)**
- **Strategic Redis Caching**: Cache only high-impact, frequently accessed data
- **No Over-Caching**: Avoid caching everything - focus on performance bottlenecks
- **Database Indexing**: Strategic indexes for query performance without over-indexing
- **Local Monitoring First**: File-based logging and monitoring to save costs early
- **Mixpanel Analytics**: User behavior tracking and conversion analytics
- **Performance Metrics**: Response times, database queries, cache hit rates
- **Cost-Effective Scaling**: Local solutions until profitable, then third-party services
- **Production Readiness**: Monitor everything critical for production stability

## **📈 BETA TESTING OPTIMIZATION (AUGUST 2025)**
- **Beta Duration**: 14 days PRO access (reduced from 30 days for better conversion timing)
- **Beta User Limit**: 50-100 strategic users maximum (cost control + exclusivity)
- **Cost Impact**: ~$1-2 total beta cost vs $5-7 for 30-day period
- **Trial Users**: Unchanged - 15 generations over 7 days (different from beta users)
- **Conversion Strategy**: 14-day period creates urgency while allowing sufficient evaluation
- **Platform Access**: Follow platform progression strategy (TikTok → TikTok+Instagram → All Platforms)

## **🔄 MEMORY CONFLICT RESOLUTION**
- **Original**: Run specific tests for changes
- **Updated**: Always run ALL tests to ensure nothing breaks
- **Resolution**: Updated approach is correct - comprehensive testing prevents production issues
- **Strategic Value**: Running all tests catches regressions and maintains system integrity

## **📁 FILE ORGANIZATION**
- **product_strategy.md**: Business strategy and market positioning
- **cursor_memories.md**: Strategic directives for Cursor AI development sessions
- **todo.md**: Implementation roadmap and development tasks

## **📚 TECHNICAL CONTEXT**
- **Frontend**: Next.js (App Router), React, Context API + useReducer
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Authentication**: JWT with refresh tokens, working correctly
- **Database**: Seeded with test data, fully functional
- **Current Status**: All tests passing (63 backend + 55 frontend = 118 total tests)
- **Test Quality**: Comprehensive coverage with meaningful assertions

## **🎯 CURRENT PRIORITIES (August 2025)**

### **✅ COMPLETED FOUNDATION (Tier 0 Alignment)**
1. **✅ Testing Infrastructure** - 118/118 tests passing (63 backend + 55 frontend)
2. **✅ Legal Compliance Foundation** - Privacy policy, terms of service implemented
3. **✅ AI Quality Foundation** - User style learning, advanced prompts, multi-platform export
4. **✅ Exclusive Signup Control** - Database-driven viral protection system
5. **✅ Core Monitoring Foundation** - Performance tracking, health checks, log rotation
6. **✅ Performance Optimization** - Redis caching, database indexing
7. **✅ Clean Architecture & SOLID** - Ports/adapters, domain policies, service boundaries
8. **✅ Copy Consistency Audit** - Centralized copy management, brand voice guidelines
9. **✅ Team Collaboration Foundation** - Team management, role-based permissions
10. **✅ Strategic Beta Testing** - 14-day PRO access system with 100-user limit

### **🔧 IMMEDIATE PRIORITIES (Tier 1 - Next 72 Hours)**
1. **Tier 1.13: Flexible Multi-Provider AI Infrastructure** - Gemini/Groq/OpenAI with environment-driven configuration
2. **Create History Page** - Complete core user flow with pagination and filtering
3. **Create Missing Static Pages** - Help, Community pages (Privacy/Terms already exist)
4. **Implement A/B Testing Infrastructure** - Platform progression vs full access testing

### **📈 UPCOMING PRIORITIES (Tier 2 - Next 2 Weeks)**
1. **Job Queue & Retry Infrastructure** - Bull/BullMQ with Redis for reliable AI generation
2. **Analytics Foundation** - Mixpanel integration for user behavior tracking
3. **Template Marketplace Foundation** - Revenue sharing system for creators
4. **Content Marketing Setup** - Newsletter and blog foundation

---
*Last Updated: Current conversation*
*Memory ID: 6553215*
*File Purpose: Strategic directives and memories for Cursor AI development sessions*
