import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import validateRoute from "./routes/validate.route";
import redisCache from "./services/redisCache";

dotenv.config();

// Initialize Redis cache after environment variables are loaded
const initializeRedis = async () => {
  try {
    await redisCache.initialize();
  } catch (error) {
    console.warn('Redis initialization failed:', (error as Error).message);
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Service is running!",
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
