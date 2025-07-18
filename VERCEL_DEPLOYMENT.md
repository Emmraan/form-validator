# Vercel Deployment Guide

## 🚀 Quick Deploy

### 1. Prerequisites
- Vercel account
- Redis instance (optional - Upstash recommended)

### 2. Environment Variables
Set these in your Vercel dashboard:

```bash
RUNTIME=vercel
REDIS_URL=rediss://username:password@host:port  # Optional
```

### 3. Deploy Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

## 🔧 Configuration Details

### Vercel.json Configuration
- ✅ Modern function-based configuration
- ✅ Automatic build command detection
- ✅ Proper Node.js runtime version
- ✅ Environment variables pre-configured

### Build Process
1. `pnpm install` - Install dependencies
2. `pnpm run build` - Clean previous build and compile TypeScript
3. TypeScript compiles `src/` to `dist/` (excluding tests)
4. Deploy `dist/` folder as serverless function via `api/index.js`

### API Endpoints
- `GET /` - Service status
- `GET /health` - Health check with Redis status
- `POST /api/validate` - Form validation endpoint

## 🔴 Redis Setup for Vercel

### Recommended: Upstash Redis
1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the connection URL
4. Add to Vercel environment variables

### Alternative: Redis Cloud
1. Sign up at [redis.com](https://redis.com)
2. Create a database
3. Get connection details
4. Format as: `redis://username:password@host:port`

## 🧪 Testing Deployment

### Health Check
```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "redis": "connected",
  "runtime": "vercel"
}
```

### Validation Test
```bash
curl -X POST https://your-app.vercel.app/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "schemaType": "signup",
    "formData": {
      "firstname": "Test",
      "lastname": "User",
      "email": "test@example.com",
      "password": "SecurePass123!"
    }
  }'
```

## 🔍 Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript compilation locally
2. **Redis Connection**: Verify REDIS_URL format
3. **Function Timeout**: Ensure Redis connections are optimized

### Logs
View deployment logs in Vercel dashboard under "Build Logs" tab.

## 📊 Performance Optimization

### Cold Start Optimization
- ✅ Lazy Redis connection initialization
- ✅ In-memory cache fallback
- ✅ Minimal dependencies in production build

### Monitoring
- Use Vercel Analytics for performance insights
- Monitor Redis connection status via `/health` endpoint
- Set up alerts for function errors
