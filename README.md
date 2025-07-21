# 🛡️ Form Validator v2.1.0

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)
![Redis](https://img.shields.io/badge/Redis-Compatible-red.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg)

**A robust, production-ready microservice for dynamic form validation, featuring unlimited fields, intelligent field type detection, and scalable architecture.**

🚀 **[Live Demo](https://form-validator-rho.vercel.app)**

</div>

---

## ✨ Features

- **Dynamic Validation System**: Unlimited fields, intelligent field type detection (e.g., email, password), and a custom rules engine.
- **Comprehensive Validation**: Email domain, password security, username analysis, disposable email detection.
- **Performance & Reliability**: Redis caching with automatic fallback, sub-100ms response times.
- **Developer Experience**: TypeScript-first, flexible configuration, comprehensive testing.
- **Robust Security**: Integrated rate limiting and multi-layered DDoS mitigation.

---

## 🔒 API Authentication

All API endpoints, especially `/api/validate`, require authentication. This ensures the security and integrity of your validation processes. A valid API key must be provided in the `Authorization` header as a Bearer token.

**Example:**

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "validationType": "dynamic",
    "formData": {
      "email": "test@example.com"
    }
  }'
```

For more details on API usage and authentication, refer to the [Dynamic Validation Guide](docs/DYNAMIC_VALIDATION_GUIDE.md).

---

## 🚦 Rate Limiting

To ensure fair usage and protect against abuse, the Form Validator microservice implements **IP-based rate limiting** for all `POST` endpoints.

- **Limit**: 100 requests per minute per IP address.
- **Mechanism**: Utilizes a Sliding Window Counter algorithm, backed by Redis for efficient and accurate tracking.
- **Response**: If the rate limit is exceeded, the API will respond with a `429 Too Many Requests` status code and a meaningful error message, including a `Retry-After` header indicating when the client can safely retry.

**Example of a rate-limited response:**

```json
{
  "success": false,
  "errors": [
    {
      "path": ["TOO_MANY_REQUESTS"],
      "message": "You have exceeded the request limit of 100 requests per minute. Please try again after X seconds."
    }
  ]
}
```

---

## 🛡️ DDoS Mitigation

The service employs a multi-layered approach to mitigate Distributed Denial of Service (DDoS) attacks, ensuring high availability and resilience:

1.  **Edge-level Protection (Vercel)**:
    *   Leverages Vercel's inherent infrastructure, global CDN, and distributed architecture to absorb and filter common network and transport layer (Layer 3/4) DDoS attacks.
    *   Traffic distribution helps prevent single points of failure.

2.  **Application-level Rate Limiting**:
    *   The IP-based rate limiting described above directly counters application-layer (Layer 7) DDoS attacks like HTTP floods by restricting excessive requests from individual IPs.

3.  **Connection Management**:
    *   Express server is configured with `keepAliveTimeout` and `headersTimeout` to prevent Slowloris-type attacks, ensuring that malicious connections cannot indefinitely tie up server resources.

4.  **Robust Input Validation and Sanitization**:
    *   All incoming data is rigorously validated using Zod schemas and the dynamic schema builder, preventing malformed requests from exploiting vulnerabilities or consuming excessive processing power.

5.  **Resource Optimization**:
    *   The serverless function architecture and efficient use of Redis caching minimize resource consumption, making the service more resilient to traffic spikes.

6.  **Monitoring and Alerting**:
    *   Integration with Vercel's logging and analytics, combined with custom alerts for unusual traffic patterns or error rates, enables rapid detection and response to potential attack vectors.

These measures collectively provide a strong defense against various DDoS attack types, safeguarding the service's integrity and performance.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Redis instance (optional)
- `pnpm` (recommended, install with `npm install -g pnpm` if not already installed)

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

# Verify everything works
pnpm run verify
```

---

## 📚 Documentation

For comprehensive documentation, including detailed API reference, dynamic validation guides, Redis integration, deployment instructions, and more, please refer to the `docs/` directory:

- [Dynamic Validation Guide](docs/DYNAMIC_VALIDATION_GUIDE.md)
- [Redis Setup Guide](docs/REDIS_SETUP.md)
- [Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)

---

## 🤝 Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) or the documentation in `docs/` for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for secure and reliable form validation**

[⭐ Star this repo](https://github.com/Emmraan/form-validator) • [🐛 Report Bug](https://github.com/Emmraan/form-validator/issues) • [💡 Request Feature](https://github.com/Emmraan/form-validator/issues)

</div>
