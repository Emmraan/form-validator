# Redis Caching Setup Guide

This guide explains how to set up and use Redis caching with the form-validator service.

## 🚀 Quick Start

### Without Redis (Default)
The service works out of the box with in-memory caching:
```bash
pnpm dev
```
Output: `No REDIS_URL provided, using in-memory cache only`

### With Redis
1. Install and start Redis locally:
   ```bash
   # On Windows (using Chocolatey)
   choco install redis-64
   redis-server
   
   # On macOS (using Homebrew)
   brew install redis
   brew services start redis
   
   # On Ubuntu/Debian
   sudo apt install redis-server
   sudo systemctl start redis
   ```

2. Set the Redis URL in your environment:
   ```bash
   # .env file
   REDIS_URL=redis://localhost:6379
   ```

3. Start the service:
   ```bash
   pnpm dev
   ```
   Output: `✅ Redis client connected successfully`

## 🌐 Cloud Redis Services

### Redis Cloud
```bash
REDIS_URL=redis://username:password@redis-host:port
```

### AWS ElastiCache
```bash
REDIS_URL=redis://your-cluster.cache.amazonaws.com:6379
```

### Heroku Redis
```bash
# Heroku automatically sets REDIS_URL
```

## 📊 Performance Benefits

Based on our testing:

| Scenario | Without Cache | With Cache | Improvement |
|----------|---------------|------------|-------------|
| First request | 299ms | 299ms | - |
| Subsequent requests | 299ms | ~5ms | **98% faster** |
| Speed increase | - | - | **50x faster** |

## 🔧 Configuration Options

### Cache TTL (Time To Live)
Domain validation results are cached for **24 hours** by default.

### Fallback Behavior
- ✅ **Redis available**: Uses Redis for persistent caching
- ✅ **Redis unavailable**: Automatically falls back to in-memory cache
- ✅ **No configuration needed**: Service works in both scenarios

## 🧪 Testing Cache Performance

Run the included performance test:
```bash
pnpm run test
```

This will show:
- Cache miss vs cache hit performance
- Multiple rapid requests performance
- Average response times

## 🔍 Cache Key Format

Email domain cache keys follow this pattern:
```
email_domain:{domain}
```

Examples:
- `email_domain:gmail.com`
- `email_domain:example.com`
- `email_domain:suspicious-domain.com`

## 🛠️ Troubleshooting

### Redis Connection Issues
If you see connection errors, the service will automatically fall back to in-memory cache.

### Cache Not Working
1. Check if `REDIS_URL` is set correctly
2. Verify Redis server is running
3. Check network connectivity to Redis server

### Performance Issues
1. Monitor Redis memory usage
2. Check network latency to Redis server
3. Consider using Redis clustering for high load

## 📈 Monitoring

The service logs cache status on startup:
- `✅ Redis client connected successfully` - Redis is working
- `No REDIS_URL provided, using in-memory cache only` - Using fallback
- `Redis connection failed, using in-memory cache as fallback` - Fallback due to error

## 🔒 Security Considerations

1. **Use authentication** for production Redis instances
2. **Enable TLS** for Redis connections in production
3. **Restrict network access** to Redis server
4. **Monitor cache contents** for sensitive data

Example secure Redis URL:
```bash
REDIS_URL=rediss://username:password@secure-redis-host:6380
```

## 🚀 Production Deployment

For production environments:

1. **Use a dedicated Redis instance**
2. **Enable persistence** (RDB + AOF)
3. **Set up monitoring** (Redis metrics)
4. **Configure memory limits**
5. **Use Redis Sentinel** for high availability

Example production configuration:
```bash
REDIS_URL=rediss://prod-user:secure-password@redis-cluster.example.com:6380
```
