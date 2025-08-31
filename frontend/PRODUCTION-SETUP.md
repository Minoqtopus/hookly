# 🚀 Production Setup Guide

## Environment Variables Required

### Frontend (.env.production or deployment environment)
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_NODE_ENV=production
```

### Backend (Production environment)
```bash
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://your-frontend-domain.com
PORT=3001
```

## 🔧 Generation Page Connectivity Issues

### Common Production Issues:

1. **WebSocket Connection Failures**
   - Ensure your hosting provider supports WebSocket connections
   - Check if WebSocket ports are open (usually same as HTTP)
   - Verify CORS settings allow WebSocket origins

2. **API URL Configuration**
   - Must be HTTPS in production (not HTTP)
   - Should not include trailing slash
   - WebSocket automatically converts HTTPS → WSS

3. **Authentication Token Issues**
   - Check token expiration settings
   - Verify refresh token mechanism works
   - Ensure tokens are stored securely (httpOnly cookies recommended)

4. **Network/Firewall Issues**
   - WebSocket connections might be blocked by corporate firewalls
   - Some hosting providers block WebSocket by default
   - Check if polling fallback is working

### 🚨 Debugging Steps:

1. **Check Browser Console:**
   ```javascript
   // Look for these error messages:
   - "WebSocket connection error"
   - "Connection failed"
   - "Authentication required"
   ```

2. **Test API Endpoints Directly:**
   ```bash
   curl -X GET https://your-api-domain.com/health
   curl -X POST https://your-api-domain.com/generation/analyze-product \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"productUrl": "https://example.com"}'
   ```

3. **Verify WebSocket Connection:**
   - Open browser dev tools → Network tab
   - Look for WebSocket connections (WS protocol)
   - Check if connection upgrades from HTTP to WebSocket

### 🔧 Quick Fixes:

1. **Set correct environment variables**
2. **Enable WebSocket support on your hosting provider**
3. **Update CORS settings to allow WebSocket origins**
4. **Increase timeout settings for slower connections**

## 📞 Emergency Fallback

If WebSocket fails completely, the app includes a 30-second fallback mechanism that will show the generated content without real-time streaming.