const Redis = require("ioredis");

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";

let client = null;
const memoryFallback = new Map(); // key -> { code, expireAt }
const CODE_PREFIX = "verify_code:";
const CODE_EXPIRE = 600; // 10分钟

const USE_MEMORY = Symbol("use_memory");

function getClient() {
  if (client === USE_MEMORY) return null;
  if (!client) {
    try {
      const redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 0,
        retryStrategy() {
          return null;
        },
      });
      redis.on("error", () => {
        if (client !== USE_MEMORY) {
          client = USE_MEMORY;
          console.warn("[Redis] 未启动，验证码使用内存存储（开发可忽略）");
        }
      });
      redis.on("connect", () => {
        client = redis;
      });
      client = redis;
    } catch (e) {
      console.warn("[Redis] 连接失败，验证码使用内存存储:", e.message);
      client = USE_MEMORY;
    }
  }
  return client && client !== USE_MEMORY ? client : null;
}

function key(email) {
  return CODE_PREFIX + email.toLowerCase().trim();
}

async function setVerificationCode(email, code, expireSeconds = CODE_EXPIRE) {
  const k = key(email);
  const redis = getClient();
  const fallback = () => {
    memoryFallback.set(k, {
      code,
      expireAt: Date.now() + expireSeconds * 1000,
    });
  };
  if (!redis) {
    fallback();
    return;
  }
  try {
    await redis.setex(k, expireSeconds, code);
  } catch (e) {
    console.warn("[Redis] setex 失败，使用内存:", e.message);
    fallback();
  }
}

async function getVerificationCode(email) {
  const k = key(email);
  const redis = getClient();
  const fromMemory = () => {
    const entry = memoryFallback.get(k);
    if (!entry || Date.now() > entry.expireAt) {
      memoryFallback.delete(k);
      return null;
    }
    return entry.code;
  };
  if (!redis) return fromMemory();
  try {
    return await redis.get(k);
  } catch (e) {
    console.warn("[Redis] get 失败，使用内存:", e.message);
    return fromMemory();
  }
}

async function deleteVerificationCode(email) {
  const k = key(email);
  const redis = getClient();
  if (!redis) {
    memoryFallback.delete(k);
    return;
  }
  try {
    await redis.del(k);
  } catch (e) {
    console.warn("[Redis] del 失败，使用内存:", e.message);
    memoryFallback.delete(k);
  }
}

module.exports = {
  getClient,
  setVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
  CODE_EXPIRE,
};
