# 🛡️ Form Validator

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)
![Redis](https://img.shields.io/badge/Redis-Compatible-red.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**A robust, production-ready microservice for comprehensive form validation with intelligent caching and enterprise-grade resilience.**

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Redis Integration](#-redis-integration) • [Testing](#-testing)

</div>

---

## ✨ Features

### 🚀 **Dynamic Validation System** ⭐ NEW!
- **Automatic Field Detection** - Intelligently detects field types (email, password, phone, etc.) without configuration
- **Unlimited Field Support** - Validate any number of fields without code changes
- **Custom Validation Rules** - Apply custom patterns, lengths, and logic per field via API requests
- **Optional by Default** - All fields are optional unless explicitly marked as required
- **Backward Compatible** - Existing implementations continue to work unchanged

### 🔒 **Comprehensive Validation**
- **Email Domain Validation** - Advanced spam detection and domain reputation checking
- **Password Security** - Intelligent password strength validation with security rules
- **Username Analysis** - Suspicious pattern detection and security screening
- **Disposable Email Detection** - Blocks temporary and throwaway email services

### ⚡ **Performance & Reliability**
- **Redis Caching** - High-performance caching with ioredis for optimal speed
- **Automatic Fallback** - Seamless in-memory cache when Redis is unavailable
- **Zero Downtime** - 100% service availability regardless of cache backend
- **Sub-100ms Response Times** - Optimized for production workloads

### 🛠️ **Developer Experience**
- **TypeScript First** - Full type safety and excellent IDE support
- **Flexible Configuration** - Works with any Redis provider (Upstash, AWS, Redis Cloud)
- **Comprehensive Testing** - Full test coverage with Jest
- **Production Ready** - Enterprise-grade error handling and monitoring

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Redis instance (optional - service works without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/Emmraan/form-validator.git
cd form-validator

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your Redis URL (optional)

# Start development server
pnpm dev
```

### Basic Usage

```bash
# Test the API
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "schemaType": "signup",
    "formData": {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "password": "SecurePassword123!"
    }
  }'
```

---

## 📡 API Documentation

### Validation Endpoint

**POST** `/api/validate`

#### 🚀 Dynamic Validation (Recommended)
```json
{
  "validationType": "dynamic",
  "formData": {
    "email": "user@example.com",
    "first_name": "John",
    "phone": "1234567890",
    "age": "25"
  },
  "fieldRequirements": {
    "email": { "required": true },
    "first_name": { "required": true }
  },
  "customRules": {
    "phone": {
      "pattern": "^[0-9]{10}$",
      "message": "Phone must be 10 digits"
    }
  }
}
```

#### 🔄 Legacy Schema Format (Still Supported)
```json
{
  "schemaType": "signup",
  "formData": {
    "firstname": "string (min 2 chars)",
    "lastname": "string (min 2 chars)",
    "email": "string (valid email)",
    "password": "string (non-empty)"
  }
}
```

#### Response Format
```json
{
  "success": boolean,
  "data": {
    "email": "user@example.com",
    "first_name": "John"
  },
  "errors": [
    {
      "path": ["field_name"],
      "message": "Error description"
    }
  ],
  "fieldAnalysis": {
    "email": "email",
    "first_name": "firstName",
    "phone": "phone"
  }
}
```

> **Note**: `fieldAnalysis` is only included in dynamic validation responses to show detected field types.

#### Example Responses

**✅ Valid Submission**
```json
{
  "success": true,
  "errors": []
}
```

**❌ Invalid Submission**
```json
{
  "success": false,
  "errors": [
    {
      "path": ["email"],
      "message": "Disposable email addresses are not allowed."
    },
    {
      "path": ["password"],
      "message": "Password must not contain your first or last name."
    }
  ]
}
```

---

## 🎯 Dynamic Validation Examples

### Basic Usage - Any Fields
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "validationType": "dynamic",
    "formData": {
      "user_email": "john@company.com",
      "full_name": "John Doe",
      "phone_number": "1234567890",
      "website": "https://johndoe.dev"
    }
  }'
```

### Required Fields
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "validationType": "dynamic",
    "formData": {
      "email": "user@example.com",
      "name": "",
      "phone": "1234567890"
    },
    "fieldRequirements": {
      "email": { "required": true },
      "name": { "required": true },
      "phone": { "required": false }
    }
  }'
```

### Custom Validation Rules
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "validationType": "dynamic",
    "formData": {
      "username": "johndoe123",
      "bio": "Software developer",
      "tags": "javascript,react,nodejs"
    },
    "customRules": {
      "username": {
        "minLength": 3,
        "maxLength": 20,
        "pattern": "^[a-zA-Z0-9_]+$",
        "message": "Username must be 3-20 chars, letters/numbers/underscore only"
      },
      "bio": {
        "maxLength": 500
      },
      "tags": {
        "minItems": 1,
        "maxItems": 10
      }
    }
  }'
```

### Supported Field Types
The system automatically detects and validates these field types:

| Field Names | Type Detected | Validation Applied |
|-------------|---------------|-------------------|
| `email`, `user_email`, `contact_email` | Email | Email format + domain validation |
| `password`, `pass`, `confirm_password` | Password | Complexity requirements |
| `first_name`, `last_name`, `full_name` | Name | Character validation, length limits |
| `phone`, `mobile`, `phone_number` | Phone | Phone number format |
| `username`, `user_name`, `login` | Username | Alphanumeric + underscore |
| `age`, `years_old` | Age | Numeric, 13-120 range |
| `url`, `website`, `homepage` | URL | URL format validation |
| `address`, `street_address` | Address | Address format |
| Any other field | Generic | Basic string validation |

---

## 🔄 Migration Guide

### From Fixed Schema to Dynamic

**Before (Limited to 4 fields):**
```json
{
  "schemaType": "signup",
  "formData": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
}
```

**After (Unlimited fields):**
```json
{
  "validationType": "dynamic",
  "formData": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "1234567890",
    "company": "Tech Corp",
    "website": "https://example.com"
  },
  "fieldRequirements": {
    "first_name": { "required": true },
    "last_name": { "required": true },
    "email": { "required": true },
    "password": { "required": true }
  }
}
```

> **📖 Full Documentation**: See [DYNAMIC_VALIDATION_GUIDE.md](./DYNAMIC_VALIDATION_GUIDE.md) for complete API reference and advanced examples.

---

## 🔴 Redis Integration

### Supported Redis Providers

The service uses **ioredis** for maximum compatibility and reliability:

| Provider | URL Format | Example |
|----------|------------|---------|
| **Upstash** | `rediss://default:token@host:6379` | `rediss://default:xxx@upstash.io:6379` |
| **Redis Cloud** | `redis://user:pass@host:port` | `redis://user:pass@redis.cloud:12345` |
| **AWS ElastiCache** | `redis://cluster-endpoint:6379` | `redis://cluster.aws.com:6379` |
| **Local Redis** | `redis://localhost:6379` | `redis://localhost:6379` |

### Configuration

```bash
# .env file
REDIS_URL=rediss://username:your-token@your-host:6379
```

### Resilience Features

#### 🛡️ **Automatic Fallback**
- **No Redis?** → Uses in-memory cache automatically
- **Redis fails?** → Seamlessly switches to fallback cache
- **Network issues?** → Continues operating without interruption
- **Rate limits?** → Gracefully handles quota exhaustion

#### 📊 **Monitoring & Logging**
```
✅ Redis client connected successfully
✅ Redis connection verified with ping: PONG
📊 Redis cache status: Connected and ready

# Fallback scenarios
⚠️  Redis connection failed: Connection timeout
📊 Using in-memory cache as fallback
⚠️  Redis GET error: Rate limit exceeded
```

#### ⚡ **Performance Characteristics**
- **Cache TTL**: 24 hours for domain validation results
- **Cleanup**: Automatic expired entry removal (100+ items)
- **Response Time**: Sub-100ms average with either cache backend
- **Memory Usage**: Efficient in-memory fallback with TTL support

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Coverage
- ✅ Email domain validation with caching
- ✅ Redis fallback behavior
- ✅ Password validation rules
- ✅ Username security checks
- ✅ Error handling scenarios

---

## 🏗️ Architecture

### Service Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Form Validator API                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Validation    │  │   Redis Cache   │  │   Fallback   │ │
│  │   Endpoints     │  │   (ioredis)     │  │   Cache      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Email Domain  │  │   Password      │  │   Username   │ │
│  │   Validator     │  │   Validator     │  │   Validator  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Validation Flow

```mermaid
graph TD
    A[API Request] --> B[Schema Validation]
    B --> C[Password Check]
    C --> D[Username Analysis]
    D --> E[Email Domain Check]
    E --> F{Redis Available?}
    F -->|Yes| G[Check Redis Cache]
    F -->|No| H[Check Memory Cache]
    G --> I{Cache Hit?}
    H --> I
    I -->|Yes| J[Return Cached Result]
    I -->|No| K[Fetch Domain Info]
    K --> L[Cache Result]
    L --> M[Return Validation Response]
    J --> M
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `PORT` | Server port | No | `3001` | `3000` |
| `RUNTIME` | Runtime environment | No | `development` | `production` |
| `REDIS_URL` | Redis connection URL | No | - | `redis://localhost:6379` |
#### Note if you deploy it on Vercel, you need to set the `RUNTIME` variable to `vercel`.

### Example .env File

```bash
# Server Configuration
PORT=3000
RUNTIME=development

# Redis Configuration (Optional)
REDIS_URL=rediss://default:your-token@your-redis-host:6379

# For Upstash Redis
REDIS_URL=rediss://default:XXXXXXXXXXXXXXXXXXXXXXXXX@outgoing-goose-26463.upstash.io:6379

# For Redis Cloud
REDIS_URL=redis://username:password@redis-cloud-host:12345

# For AWS ElastiCache
REDIS_URL=redis://your-cluster.cache.amazonaws.com:6379
```

---

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Build the Docker image
docker build -t form-validator .

# make sure .env file with REDIS_URL is in the root directory

# Run the Docker container
docker run -p 3000:3000 form-validator
```

### Vercel Deployment

The service is optimized for serverless deployment on Vercel:

```bash
# Deploy to Vercel
vercel --prod

# Environment variables in Vercel dashboard:
# REDIS_URL=your-redis-connection-string
```

### Traditional Server Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Or use PM2 for process management
pm2 start dist/index.js --name form-validator
```

---

## 📊 Monitoring & Observability

### Health Check

```bash
# Basic health check
curl http://localhost:3000/

# Response
{
  "message": "Service is running!"
}

# For detailed health check including Redis status
curl http://localhost:3000/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "redis": "connected",
  "runtime": "development"
}
```

### Redis Status Monitoring

The service provides detailed logging for Redis operations:

```bash
# Successful connection
✅ Redis client connected successfully
✅ Redis connection verified with ping: PONG
📊 Redis cache status: Connected and ready

# Fallback scenarios
⚠️  No REDIS_URL provided, using in-memory cache only
⚠️  Redis connection failed: Connection timeout
📊 Using in-memory cache as fallback
⚠️  Redis GET error: Rate limit exceeded
```

### Performance Metrics

Monitor these key metrics in production:

- **Response Time**: Target <100ms average
- **Cache Hit Rate**: Monitor Redis vs fallback usage
- **Error Rate**: Track validation failures vs system errors
- **Memory Usage**: Monitor fallback cache size

---

## 🛠️ Development


### Available Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm lint             # Run ESLint (if configured)
pnpm type-check       # TypeScript type checking
```

### Adding New Validators

```typescript
// src/validators/customValidator.ts
export default function validateCustomField(value: string): string | null {
  // Your validation logic
  if (/* validation fails */) {
    return "Custom validation error message";
  }
  return null; // Valid
}

// src/routes/validate.route.ts
import validateCustomField from "../validators/customValidator";

// Add to validation logic
const customError = validateCustomField(formData.customField);
if (customError) errors.push({ path: ["customField"], message: customError });
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/form-validator.git
cd form-validator

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ioredis** - Robust Redis client for Node.js
- **Zod** - TypeScript-first schema validation
- **Express** - Fast, unopinionated web framework
- **Jest** - Comprehensive testing framework

---

<div align="center">

**Built with ❤️ for secure and reliable form validation**

[⭐ Star this repo](https://github.com/Emmraan/form-validator) • [🐛 Report Bug](https://github.com/Emmraan/form-validator/issues) • [💡 Request Feature](https://github.com/Emmraan/form-validator/issues)

</div>
