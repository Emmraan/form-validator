import Redis from 'ioredis';

class RedisCache {
  private client: Redis | null = null;
  private isConnected = false;
  private fallbackCache: Record<string, { value: any; expiry: number }> = {};
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize immediately - wait for explicit initialization
  }

  // Public method to initialize the Redis connection
  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeClient();
    return this.initializationPromise;
  }

  // Helper method to ensure initialization before operations
  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      await this.initialize();
    } else {
      await this.initializationPromise;
    }
  }

  private async initializeClient() {
    if (!process.env.REDIS_URL) {
      console.log('No REDIS_URL provided, using in-memory cache only');
      this.client = null;
      this.isConnected = false;
      return;
    }

    try {
      this.client = new Redis(process.env.REDIS_URL, {
        connectTimeout: 10000,
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableReadyCheck: false,
      });

      // Set up event listeners
      this.client.on('error', (err) => {
        console.warn('Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis client connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis client reconnecting...');
      });

      // Connect and test
      await this.client.connect();
      const pingResult = await this.client.ping();
      console.log('✅ Redis connection verified with ping:', pingResult);
      this.isConnected = true;

    } catch (error) {
      const errorMessage = (error as Error).message;
      console.warn('Redis connection failed:', errorMessage);
      console.log('Using in-memory cache as fallback');
      this.client = null;
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    await this.ensureInitialized();

    try {
      if (this.client && this.isConnected) {
        return await this.client.get(key);
      }
    } catch (error) {
      console.warn('Redis GET error:', (error as Error).message);
    }

    const cached = this.fallbackCache[key];
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }
    
    if (cached && cached.expiry <= Date.now()) {
      delete this.fallbackCache[key];
    }
    
    return null;
  }

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    await this.ensureInitialized();

    try {
      if (this.client && this.isConnected) {
        await this.client.setex(key, ttlSeconds, value);
        return;
      }
    } catch (error) {
      console.warn('Redis SET error:', (error as Error).message);
    }

    this.fallbackCache[key] = {
      value,
      expiry: Date.now() + (ttlSeconds * 1000),
    };

    this.cleanupFallbackCache();
  }

  async exists(key: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      if (this.client && this.isConnected) {
        const result = await this.client.exists(key);
        return result === 1;
      }
    } catch (error) {
      console.warn('Redis EXISTS error:', (error as Error).message);
    }

    const cached = this.fallbackCache[key];
    if (cached && cached.expiry > Date.now()) {
      return true;
    }
    
    if (cached && cached.expiry <= Date.now()) {
      delete this.fallbackCache[key];
    }
    
    return false;
  }

  private cleanupFallbackCache() {
    const now = Date.now();
    const keys = Object.keys(this.fallbackCache);
    
    if (keys.length > 100) {
      keys.forEach(key => {
        if (this.fallbackCache[key].expiry <= now) {
          delete this.fallbackCache[key];
        }
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        if (this.isConnected) {
          this.client.disconnect();
        }
        this.client = null;
        this.isConnected = false;
      } catch (error) {
        console.warn('Error disconnecting Redis client:', (error as Error).message);
      }
    }
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }
}

const redisCache = new RedisCache();

export default redisCache;
