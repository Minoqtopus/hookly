# Hookly - AI-Powered UGC Script Generator

> **Transform your content creation with AI-generated viral UGC scripts for TikTok & Instagram**

Hookly is a modern SaaS platform that empowers content creators to generate high-converting User Generated Content (UGC) scripts using advanced AI. Built for individual creators and personal brand builders who want to create authentic, viral content that drives engagement and conversions.

## 🎯 Product Vision

**Mission:** Democratize viral content creation for individual creators and personal brand builders by providing AI-powered UGC script generation that feels authentic and converts viewers into customers.

**Target Audience:** Content creators, influencers, personal brand builders, and creators promoting products on TikTok & Instagram.

## ✨ Key Features

### 🤖 AI-Powered Content Generation
- **Advanced Prompting System**: World-class viral content prompts with psychological triggers
- **Platform-Specific Optimization**: Tailored scripts for TikTok & Instagram
- **Real-time Streaming**: Typewriter effect with WebSocket streaming
- **Viral Score Calculation**: AI-driven performance predictions

### 🎨 Creator-Focused Experience
- **Product URL Analyzer**: Auto-fill forms by analyzing product websites
- **UGC Script History**: Detailed view of all generated scripts with performance metrics
- **Copy-Friendly Interface**: One-click copying for hooks, scripts, and full content
- **Responsive Design**: Works seamlessly on desktop and mobile

### 💰 Simple, Honest Pricing
- **Trial**: 5 free UGC scripts (TikTok & Instagram)
- **Creator Plan**: $15/month - 50 scripts (TikTok & Instagram)
- **Business Plan**: $39/month - 200 scripts + commercial usage rights

### 🔐 Enterprise-Grade Security
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Rate Limiting**: Global and endpoint-specific rate limiting
- **Input Validation**: Comprehensive validation with business rules
- **Error Handling**: Centralized error handling and logging

## 🏗️ Technical Architecture

### Backend (NestJS)
```
backend/
├── src/
│   ├── auth/           # JWT authentication & Google OAuth
│   ├── generation/     # AI content generation core
│   ├── pricing/        # Centralized pricing configuration
│   ├── ai/            # Gemini AI integration & prompts
│   ├── scraping/      # Product URL analysis
│   ├── domain/        # Domain-driven design models
│   └── common/        # Shared utilities & guards
```

**Key Technologies:**
- **NestJS**: Enterprise Node.js framework
- **TypeORM**: Database ORM with PostgreSQL
- **Gemini AI**: Google's advanced language model
- **WebSockets**: Real-time streaming capabilities
- **JWT**: Secure authentication system

### Frontend (Next.js)
```
frontend/
├── app/               # Next.js 13+ App Router
│   ├── (public)/     # Landing, demo, pricing pages
│   └── (protected)/  # Generate, history, dashboard
├── src/
│   ├── components/   # Reusable UI components
│   ├── domains/      # Domain-driven architecture
│   ├── shared/       # Shared services & utilities
│   └── lib/          # Utility libraries
```

**Key Technologies:**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Modern component library
- **Domain Architecture**: Clean, layered frontend design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Gemini AI API key
- Google OAuth credentials (optional)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp .env.example .env
   # Configure your database, AI API keys, and OAuth credentials
   ```

3. **Database setup:**
   ```bash
   npm run migration:run
   ```

4. **Start development server:**
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp .env.example .env.local
   # Configure API endpoints and OAuth credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 📋 Key Commands

### Backend
```bash
npm run start:dev     # Development server with hot reload
npm run build         # Build for production
npm run test          # Run test suite
npm run migration:generate  # Generate database migrations
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🎨 Design Philosophy

### UGC Creator-First Approach
- **Authentic Content**: AI generates content that feels natural for creators
- **Platform-Specific**: Optimized hooks and scripts for TikTok & Instagram
- **Performance Focus**: Viral scores and metrics help creators understand content potential
- **Copy-Friendly**: Easy-to-use interface for content creation workflows

### Technical Excellence
- **Domain-Driven Design**: Clean architecture with business logic separation
- **Single Source of Truth**: Centralized pricing configuration
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Security First**: Enterprise-grade security practices
- **Performance Optimized**: Efficient database queries and caching strategies

### Bootstrap-Friendly
- **Cost Conscious**: $500/month total budget constraints
- **Efficient Architecture**: Minimal infrastructure requirements
- **Scalable Design**: Built to handle growth without major rewrites

## 🔧 Configuration

### Pricing Configuration
The entire pricing system is managed through a single file:
```typescript
// backend/src/pricing/pricing.config.ts
export const PRICING_CONFIG = {
  trial: { generationsTotal: 5, platforms: ['tiktok', 'instagram'] },
  tiers: [
    { name: 'Creator', monthlyPrice: 1500, generationsPerMonth: 50 },
    { name: 'Business', monthlyPrice: 3900, generationsPerMonth: 200 }
  ]
}
```

### AI Prompts
World-class viral content prompts are centralized:
```typescript
// backend/src/ai/prompts/viral-content-prompts.ts
export class ViralContentPrompts {
  static generateUGCScript(params) {
    // Advanced prompting with psychological triggers
  }
}
```

## 📊 Business Model

### Revenue Streams
1. **Creator Subscriptions**: $15/month for individual creators
2. **Business Subscriptions**: $39/month for commercial use
3. **Freemium Trial**: 5 free scripts to drive conversions

### Growth Strategy
1. **Organic Content**: Creators using the platform create viral content
2. **Word of Mouth**: High-quality scripts lead to referrals
3. **Creator Partnerships**: Collaborate with successful UGC creators
4. **Platform Integration**: Potential integrations with creator tools

## 🚦 Current Status

### ✅ Completed Features
- [x] AI content generation with Gemini integration
- [x] Real-time streaming with typewriter effects
- [x] Product URL analyzer for auto-fill functionality
- [x] Complete authentication system with JWT & Google OAuth
- [x] Centralized pricing configuration system
- [x] UGC script history with detailed view
- [x] Responsive design across all pages
- [x] Rate limiting and security measures

### 🔄 In Progress
- [ ] Payment integration (Stripe)
- [ ] Email verification system
- [ ] Advanced analytics dashboard
- [ ] Batch generation features

### 🎯 Roadmap
- [ ] Mobile app development
- [ ] Creator marketplace integration
- [ ] Advanced AI models and features
- [ ] Team collaboration features

## 🤝 Contributing

This is a commercial product under active development. The codebase follows enterprise patterns and practices:

1. **Domain-Driven Design**: Business logic is encapsulated in domain models
2. **Clean Architecture**: Clear separation between layers
3. **Test-Driven Development**: Business requirements defined by tests
4. **Type Safety**: Comprehensive TypeScript usage
5. **Security First**: All endpoints protected and validated

## 📈 Performance & Scalability

### Current Capacity
- **Database**: PostgreSQL with optimized queries
- **AI Processing**: Gemini API with streaming responses
- **Frontend**: Next.js with static generation where possible
- **Caching**: Strategic caching for pricing and user data

### Optimization Features
- **O(1) Database Operations**: Efficient query patterns
- **Real-time Streaming**: WebSocket integration for instant feedback
- **Lazy Loading**: Components loaded on demand
- **CDN Ready**: Static assets optimized for distribution

## 📄 License

Commercial software - All rights reserved.

## 🎯 Vision

Hookly aims to become the #1 platform for UGC creators who want to build their personal brands and create viral content that converts. By focusing on authentic, creator-friendly AI generation, we're building the infrastructure for the next generation of content creators.

**Ready to create viral UGC scripts? Let's build the future of content creation together! 🚀**