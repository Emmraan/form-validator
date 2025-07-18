import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import validateRoute from "./routes/validate.route";
import redisCache from "./services/redisCache";

// Only use dotenv in non-Vercel environments
if (process.env.RUNTIME !== "vercel") {
  const dotenv = require("dotenv");
  dotenv.config();
}

// Debug environment variables in Vercel
if (process.env.RUNTIME === "vercel") {
  console.log('Vercel Environment Debug:');
  console.log('RUNTIME:', process.env.RUNTIME);
  console.log('REDIS_URL exists:', !!process.env.REDIS_URL);
  console.log('REDIS_URL length:', process.env.REDIS_URL?.length || 0);
  console.log('REDIS_URL starts with:', process.env.REDIS_URL?.substring(0, 10) || 'undefined');
}

// Initialize Redis cache after environment variables are loaded
const initializeRedis = async () => {
  try {
    console.log('Starting Redis initialization...');
    await redisCache.initialize();
    console.log('Redis initialization completed');
  } catch (error) {
    console.error('❌ Redis initialization failed:', (error as Error).message);
    console.error('Redis initialization error stack:', (error as Error).stack);
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Redis immediately in Vercel environment
if (process.env.RUNTIME === "vercel") {
  console.log('Vercel environment detected, initializing Redis immediately...');
  initializeRedis().catch(err => {
    console.error('Failed to initialize Redis in Vercel:', err);
  });
}

app.use(cors());
app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Service is running!",
  });
});

app.get("/health", async (_req, res) => {
  const redisStatus = redisCache.isRedisConnected() ? 'connected' : 'fallback';
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    redis: redisStatus,
    runtime: process.env.RUNTIME || 'development'
  });
});

app.use("/api", validateRoute);

export default app;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    await redisCache.disconnect();
    console.log('Redis connection closed.');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }

  process.exit(0);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (process.env.RUNTIME !== "vercel") {
  const server = app.listen(PORT, async () => {
    console.log(`🚀 Validation API running on http://localhost:${PORT}`);

    // Initialize Redis and show status
    await initializeRedis();
    console.log(`📊 Redis cache status: ${redisCache.isRedisConnected() ? 'Connected and ready' : 'Using fallback in-memory cache'}`);
  });

  // Handle server shutdown
  const shutdown = async () => {
    console.log('\nShutting down server...');
    server.close(async () => {
      await gracefulShutdown('Server shutdown');
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
