import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL?.trim();

if (!redisUrl) {
  throw new Error("REDIS_URL is missing. Configure it in the environment.");
}

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

export default redis;
