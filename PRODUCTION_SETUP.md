# Production Setup Guide for Hookly

## Environment Variables Setup

### 1. Frontend Environment Variables (.env.local)
Copy `.env.example` to `.env.local` and configure:

```bash
# App URLs (Production)
NEXT_PUBLIC_APP_URL=https://hookly.com
NEXT_PUBLIC_API_URL=https://api.hookly.com

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 2. Backend Environment Variables (.env)
Configure in your backend deployment:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hookly_production

# JWT Secrets (Generate strong secrets)
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here

# LemonSqueezy Configuration
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_STORE_ID=your_store_id

# Product IDs from LemonSqueezy Dashboard
LEMONSQUEEZY_CREATOR_MONTHLY_ID=123456
LEMONSQUEEZY_CREATOR_YEARLY_ID=123457
LEMONSQUEEZY_AGENCY_MONTHLY_ID=123458
LEMONSQUEEZY_AGENCY_YEARLY_ID=123459

# OpenAI API
OPENAI_API_KEY=sk-your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## LemonSqueezy Setup

### 1. Create Products in LemonSqueezy
1. **Creator Plan - Monthly**: $29/month, 150 generations
2. **Creator Plan - Yearly**: $290/year (save 17%)
3. **Agency Plan - Monthly**: $79/month, 500 generations  
4. **Agency Plan - Yearly**: $790/year (save 17%)

### 2. Configure Webhooks
Add webhook endpoint: `https://api.hookly.com/payments/webhook/lemonsqueezy`

Required events:
- `order_created`
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_expired`

### 3. Beta User Promo Codes
Create promo code in LemonSqueezy dashboard:
- Code: `BETA_AGENCY`
- Description: "Beta Tester - Free Agency Access"
- Discount: 100% off Agency plan

## Database Setup

### 1. Run Migrations
```bash
npm run typeorm:migration:run
```

### 2. Seed Beta Users (Optional)
```sql
UPDATE users 
SET is_beta_user = true, plan = 'agency' 
WHERE email IN ('beta1@example.com', 'beta2@example.com');
```

## Deployment Checklist

### Frontend (Vercel/Netlify)
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Configure analytics
- [ ] Test build and deployment
- [ ] Verify all pages load correctly

### Backend (Railway/DigitalOcean)
- [ ] Configure environment variables
- [ ] Set up database
- [ ] Run migrations
- [ ] Test API endpoints
- [ ] Configure webhook endpoints
- [ ] Test LemonSqueezy integration

### Security
- [ ] Use strong JWT secrets
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable HTTPS everywhere
- [ ] Configure secure cookie settings

### Testing
- [ ] Test complete user journey (demo → trial → paid)
- [ ] Verify beta user functionality
- [ ] Test payment flows with LemonSqueezy
- [ ] Test webhook handling
- [ ] Verify email authentication works
- [ ] Test Google OAuth integration

## Post-Launch Monitoring

### 1. Set up Error Tracking
- Sentry for error monitoring
- Analytics for user behavior
- Payment success/failure tracking

### 2. Performance Monitoring  
- Page load speeds
- API response times
- Database query performance

### 3. Business Metrics
- Trial-to-paid conversion rate
- Beta user engagement
- Generation usage patterns
- Revenue tracking

## Support & Maintenance

### Daily Checks
- Payment processing status
- API error rates
- User feedback/support tickets

### Weekly Reviews
- Performance metrics
- Revenue reports
- User engagement analytics
- Beta user feedback

### Monthly Tasks
- Security updates
- Feature usage analysis
- Plan optimization based on data
- LemonSqueezy reconciliation