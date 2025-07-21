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
