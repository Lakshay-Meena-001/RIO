import redis from "../../shared/redis/redis.js";

const DEFAULT_TTL = 60 * 10;

export const getCache = async (key) => {
  if (!key) {
    return null;
  }

  try {
    const value = await redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Redis cache read failed:", {
      key,
      message: error.message,
    });

    return null;
  }
};

export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  if (!key || value === undefined) {
    return false;
  }

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);

    return true;
  } catch (error) {
    console.error("Redis cache write failed:", {
      key,
      message: error.message,
    });

    return false;
  }
};

export const deleteCache = async (key) => {
  if (!key) {
    return false;
  }

  try {
    await redis.del(key);

    return true;
  } catch (error) {
    console.error("Redis cache delete failed:", {
      key,
      message: error.message,
    });

    return false;
  }
};
