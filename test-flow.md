# Complete Auth & Generation Flow Test

## Test Environment Setup

### Backend Dependencies Check
- ✅ NestJS framework with all required modules
- ✅ TypeORM for PostgreSQL integration
- ✅ JWT authentication with Passport
- ✅ Google OAuth strategy
- ✅ OpenAI integration
- ✅ Bcrypt for password hashing

### Frontend Dependencies Check
- ✅ Next.js with TypeScript
- ✅ React with hooks
- ✅ Lucide React for icons
- ✅ Tailwind CSS for styling
- ✅ Axios for HTTP requests

## Critical User Journeys to Test

### 1. Guest User Flow (Zero-Friction Trial)
**Journey**: Landing page → Try demo → Generate ad → Save attempt → Auth prompt → Sign up

**Expected Behavior**:
- [ ] Guest can generate ads without signup
- [ ] Generated content shows with watermark
- [ ] Save/favoriting triggers auth modal
- [ ] Auth modal preserves demo data
- [ ] Post-auth redirects back with saved data

**Test Steps**:
1. Visit homepage (`/`)
2. Click "Try Free Demo"
3. Verify demo form auto-populates
4. Click "Generate My Ad"
5. Verify API call to `/generation/generate-guest`
6. Check generated content displays
7. Click "Save & Continue"
8. Verify AuthModal opens with demo data
9. Complete Google OAuth flow
10. Verify redirect to `/generate?restored=true`
11. Verify demo data is restored

### 2. New User Registration & First Generation
**Journey**: Landing page → Sign up → Dashboard → Generate → Upgrade prompt

**Expected Behavior**:
- [ ] Google OAuth creates new user account
- [ ] User lands on dashboard with welcome state
- [ ] First generation works correctly
- [ ] Usage limits are enforced (3/day for free)
- [ ] Upgrade prompts appear at appropriate times

**Test Steps**:
1. Click "Sign Up Free" on homepage
2. Complete Google OAuth flow
3. Verify redirect to dashboard
4. Check user stats show 0 generations
5. Navigate to `/generate`
6. Generate first ad
7. Verify usage counter increments
8. Generate 2 more ads (reach daily limit)
9. Attempt 4th generation
10. Verify upgrade modal appears

### 3. Returning User Authentication
**Journey**: Login → Dashboard → Continue work

**Expected Behavior**:
- [ ] JWT tokens persist between sessions
- [ ] Auto-refresh on expired tokens
- [ ] Graceful handling of invalid tokens
- [ ] User data loads correctly

**Test Steps**:
1. Clear localStorage
2. Visit `/dashboard` (should redirect to login)
3. Complete Google OAuth
4. Verify dashboard loads with user data
5. Close browser, reopen (test token persistence)
6. Verify auto-login works
7. Test with expired token scenario

### 4. Pro Upgrade Flow
**Journey**: Free user → Hit limit → Upgrade → Payment → Pro features

**Expected Behavior**:
- [ ] Upgrade triggers work from multiple sources
- [ ] Payment processing integrates correctly
- [ ] User plan updates immediately
- [ ] Pro features unlock automatically

**Test Steps**:
1. As free user, hit daily generation limit
2. Click upgrade from limit modal
3. Verify redirect to `/upgrade?source=limit_reached`
4. Select yearly plan
5. Click "Start Free Trial"
6. Verify redirect to LemonSqueezy checkout
7. Complete payment flow
8. Verify webhook updates user plan
9. Check dashboard shows Pro status
10. Test unlimited generations

### 5. Pro User Experience
**Journey**: Pro dashboard → Unlimited generation → Advanced features

**Expected Behavior**:
- [ ] No generation limits
- [ ] Advanced analytics visible
- [ ] Batch generation available
- [ ] No watermarks on content

**Test Steps**:
1. Login as Pro user
2. Verify dashboard shows Pro features
3. Generate 10+ ads in succession
4. Verify no limits applied
5. Check for advanced analytics
6. Test batch generation (if implemented)
7. Verify no watermarks on exports

### 6. Subscription Management
**Journey**: Pro user → Settings → Cancel subscription

**Expected Behavior**:
- [ ] Current subscription details visible
- [ ] Cancellation flow works correctly
- [ ] Pro access continues until period end
- [ ] Automatic downgrade to free

**Test Steps**:
1. Navigate to `/settings`
2. Click "Subscription" tab
3. Verify current plan details
4. Click "Cancel Subscription"
5. Navigate to cancellation flow
6. Complete cancellation with feedback
7. Verify subscription marked for cancellation
8. Test continued Pro access

### 7. Error Handling & Edge Cases

**Critical Error Scenarios**:
- [ ] Network timeouts during generation
- [ ] Invalid API responses
- [ ] Authentication failures
- [ ] Payment processing errors
- [ ] Rate limiting exceeded

**Test Steps**:
1. Test with network disconnection
2. Mock API errors (500, 429, etc.)
3. Test with malformed requests
4. Verify error messages are user-friendly
5. Check error recovery mechanisms

## API Endpoint Tests

### Authentication Endpoints
- [ ] `POST /auth/google` - Google OAuth initiation
- [ ] `GET /auth/google/callback` - OAuth callback handling
- [ ] `POST /auth/refresh` - Token refresh
- [ ] `GET /auth/me` - Current user info

### Generation Endpoints
- [ ] `POST /generation/generate` - Authenticated generation
- [ ] `POST /generation/generate-guest` - Guest generation
- [ ] `GET /user/generations` - User's generation history

### User Management Endpoints
- [ ] `GET /user/stats` - Usage statistics
- [ ] `POST /user/upgrade` - Subscription upgrade
- [ ] `POST /user/cancel-subscription` - Cancel subscription

### Payment Webhooks
- [ ] `POST /payments/webhook` - LemonSqueezy webhook handling

## Performance & UX Tests

### Page Load Performance
- [ ] Homepage loads under 2 seconds
- [ ] Dashboard loads under 3 seconds
- [ ] Generation completes under 30 seconds
- [ ] Images and assets optimized

### Mobile Experience
- [ ] All pages responsive on mobile
- [ ] Touch interactions work correctly
- [ ] Mobile navigation functional
- [ ] Forms usable on small screens

### SEO & Accessibility
- [ ] Meta tags configured correctly
- [ ] Alt text on images
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

## Security Tests

### Authentication Security
- [ ] JWT tokens expire correctly
- [ ] Refresh tokens rotate properly
- [ ] OAuth flow secure
- [ ] CSRF protection enabled

### Data Protection
- [ ] User data encrypted
- [ ] API endpoints require authentication
- [ ] Rate limiting prevents abuse
- [ ] Input validation on all forms

## Environment Configuration Tests

### Required Environment Variables

**Backend (.env)**:
```
DATABASE_URL=postgresql://username:password@localhost:5432/aiugc
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
LEMONSQUEEZY_WEBHOOK_SECRET=your-lemonsqueezy-secret
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Database Setup
- [ ] PostgreSQL database created
- [ ] Tables created via TypeORM migrations
- [ ] Test data seeded correctly
- [ ] Connections working

## Success Criteria

For this test to pass, ALL of the following must work:

1. ✅ **Guest Demo Flow**: Users can try the product without signup
2. ✅ **Authentication**: Google OAuth works end-to-end
3. ✅ **Generation**: Both guest and authenticated generation work
4. ✅ **Upgrade Flow**: Users can successfully upgrade to Pro
5. ✅ **Pro Features**: Unlimited generation and Pro features work
6. ✅ **Subscription Management**: Users can manage their subscriptions
7. ✅ **Error Handling**: Graceful error handling throughout
8. ✅ **Mobile UX**: App works perfectly on mobile devices
9. ✅ **Performance**: All pages load quickly and smoothly
10. ✅ **Security**: All security measures properly implemented

## Test Results

### Test Date: [TO BE FILLED]
### Environment: Development
### Tester: [TO BE FILLED]

**Overall Status**: 🟡 PENDING

**Critical Issues Found**: [TO BE FILLED]

**Performance Issues**: [TO BE FILLED]

**Security Concerns**: [TO BE FILLED]

**UX Problems**: [TO BE FILLED]

**Recommendations**: [TO BE FILLED]

---

## Next Steps After Testing

1. **Fix Critical Issues**: Address any blocking bugs
2. **Optimize Performance**: Improve slow loading areas
3. **Enhance UX**: Smooth out any friction points
4. **Security Review**: Address any security vulnerabilities
5. **Deploy to Staging**: Set up staging environment
6. **Load Testing**: Test with concurrent users
7. **Production Deployment**: Deploy with monitoring