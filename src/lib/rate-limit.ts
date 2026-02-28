import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN must be set for rate limiting");
    }
    redis = new Redis({ url, token });
  }
  return redis;
}

export function getPokemonRateLimit(): Ratelimit {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(10, "1 d"),
    prefix: "pokemon:generate",
  });
}

export function getImageRegenLimit(): Ratelimit {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(15, "1 h"),
    prefix: "pokemon:image-regen",
  });
}

export function getPackOpenLimit(): Ratelimit {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(1, "1 d"),
    prefix: "pokemon:pack",
  });
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  limitFn: () => Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = limitFn();
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
