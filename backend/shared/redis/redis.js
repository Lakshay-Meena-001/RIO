import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL?.trim();

if (!redisUrl) {
  throw new Error("REDIS_URL is missing.");
}

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  },
});

redis.on("error", (error) => {
  console.error("[Redis] Connection error:", error.message);
});

export default redis;
