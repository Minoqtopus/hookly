# 🚀 Hookly Deployment Checklist

## Pre-Deployment Tests ✅

### Backend API Tests
- [ ] Payment service webhook handling (all 4 tiers)
- [ ] Generation rate limits by plan (Free: 3/day, Starter: 50/month, Pro: unlimited, Agency: unlimited)
- [ ] Watermark application (Free/Starter only)
- [ ] Team management (Agency only)
- [ ] Promo code system
- [ ] Manual upgrade endpoints
- [ ] Error handling and validation

### Frontend Flow Tests  
- [ ] Guest demo timer (3 minutes, sessionStorage persistence)
- [ ] Auth flow with data restoration
- [ ] Local saves (3-save limit for guests)
- [ ] Upgrade modal triggers (2nd generation, 3rd copy)
- [ ] Template selection and data restoration
- [ ] Export functionality (all formats)
- [ ] Variations generator (Pro+ only)
- [ ] Team sharing (Agency only)

### Security & Performance
- [ ] Environment variables secured
- [ ] API rate limiting configured
- [ ] CORS policies set
- [ ] JWT token expiration tested
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] Build optimization completed

## Environment Variables ⚙️

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Payments
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# App
NODE_ENV=production
PORT=3001
```

### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Authentication  
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# App
NODE_ENV=production
```

## Revenue Optimization Features ✅

### 4-Tier Pricing Strategy
- [ ] **Free Plan**: 3 generations/day, watermarks, local saves only
- [ ] **Starter Plan ($15/month)**: 50 generations/month, light watermarks, cloud saves
- [ ] **Pro Plan ($39/month)**: Unlimited generations, no watermarks, batch variations, analytics
- [ ] **Agency Plan ($99/month)**: All Pro features + team collaboration, shared workspaces

### Conversion Triggers
- [ ] Demo timer creates urgency (3 minutes)
- [ ] Upgrade prompts after 2nd generation
- [ ] Copy action triggers (3rd copy shows upgrade)
- [ ] Local save limits (3 saves → auth required)
- [ ] Feature gates with clear upgrade paths

### High-Value, Low-Cost Features
- [ ] Template library (pre-generated, no API cost)
- [ ] Performance dashboard (fake but believable analytics)
- [ ] Export tools (PDF, social formats - no API cost)
- [ ] Team collaboration (Agency tier, no additional API cost)
- [ ] Variations generator (1 API call → 3 variations)

## Performance Targets 🎯

### API Response Times
- [ ] Generation endpoint: < 10 seconds
- [ ] Auth endpoints: < 500ms
- [ ] Team operations: < 1 second
- [ ] Payment webhooks: < 2 seconds

### Frontend Performance
- [ ] First Contentful Paint: < 2 seconds
- [ ] Largest Contentful Paint: < 3 seconds
- [ ] Time to Interactive: < 4 seconds
- [ ] Cumulative Layout Shift: < 0.1

### Cost Efficiency
- [ ] API costs: ≤ $50 initially (target: $0.50 per generation)
- [ ] 66% cost reduction via variations optimization
- [ ] Zero-cost features provide 70%+ of user value

## Database Setup 🗄️

### Required Tables
- [ ] `users` - User accounts and plan information
- [ ] `generations` - Ad generations and history
- [ ] `teams` - Team management (Agency feature)
- [ ] `team_members` - Team membership and roles
- [ ] `shared_generations` - Team shared content

### Indexes for Performance
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);

-- Generation queries
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at);

-- Team operations
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_shared_generations_team_id ON shared_generations(team_id);
```

## Monitoring & Analytics 📊

### Key Metrics to Track
- [ ] User signups per day
- [ ] Demo completions vs. signups
- [ ] Plan upgrade rates
- [ ] Daily/monthly active users
- [ ] Generation usage by plan
- [ ] API costs vs. revenue
- [ ] Feature adoption rates

### Error Monitoring
- [ ] API error rates
- [ ] Payment webhook failures
- [ ] Generation timeouts
- [ ] Authentication issues
- [ ] Database connection errors

## LemonSqueezy Integration 💰

### Webhook Events
- [ ] `subscription_created` - Upgrade user plan
- [ ] `subscription_updated` - Handle plan changes
- [ ] `subscription_cancelled` - Downgrade to free
- [ ] `order_created` - Handle one-time purchases

### Product Setup
- [ ] Create products for each tier
- [ ] Set custom data with plan identifiers
- [ ] Configure webhook URLs
- [ ] Test webhook signature verification

## Deployment Steps 🚀

### 1. Database Deployment
```bash
# Create production database
createdb hookly_production

# Run migrations
npm run migration:run

# Verify tables created
psql hookly_production -c "\dt"
```

### 2. Backend Deployment
```bash
# Build application
npm run build

# Start production server
npm start

# Verify health check
curl https://your-backend-url.com/health
```

### 3. Frontend Deployment
```bash
# Build application
npm run build

# Deploy to hosting service (Vercel/Netlify)
npm run deploy

# Verify deployment
curl https://your-frontend-url.com
```

### 4. Post-Deployment Verification
- [ ] Test complete user flow: Demo → Auth → Generation → Upgrade
- [ ] Verify webhook endpoints receive test events
- [ ] Check error monitoring is active
- [ ] Confirm analytics tracking works
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificates

## Success Metrics 📈

### Week 1 Targets
- [ ] 100+ demo starts
- [ ] 20+ user signups
- [ ] 5+ paid upgrades
- [ ] < 5% error rate
- [ ] API costs < $20

### Month 1 Targets  
- [ ] 1000+ demo starts
- [ ] 200+ user signups
- [ ] 50+ paid upgrades
- [ ] $500+ MRR
- [ ] API costs < $100

### Long-term Goals
- [ ] $100k+ MRR
- [ ] 10,000+ active users
- [ ] < $50 API costs (through optimization)
- [ ] 15%+ conversion rate demo → paid

## Emergency Procedures 🚨

### High API Costs
1. Enable rate limiting
2. Reduce free tier limits
3. Add generation queuing
4. Optimize prompts

### Database Issues
1. Enable read replicas
2. Add connection pooling
3. Optimize slow queries
4. Scale database resources

### High Error Rates
1. Check service status
2. Review error logs
3. Rollback if needed
4. Scale resources

---

**🎯 Goal: Build a profitable, scalable UGC ad generator that reaches $100k+ MRR while maintaining low operational costs and high user satisfaction.**