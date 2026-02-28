import { z } from "zod";

const envSchema = z.object({
  // AI
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  REPLICATE_API_TOKEN: z.string().min(1, "REPLICATE_API_TOKEN is required"),

  // Auth
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),
  GITHUB_ID: z.string().min(1, "GITHUB_ID is required"),
  GITHUB_SECRET: z.string().min(1, "GITHUB_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required"),

  // Cache + Rate Limiting
  KV_REST_API_URL: z.string().url("KV_REST_API_URL must be a valid URL"),
  KV_REST_API_TOKEN: z.string().min(1, "KV_REST_API_TOKEN is required"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_AUTH_TOKEN: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`❌ Invalid environment variables:\n${missing}\n\nCheck your .env.local file.`);
  }
  return result.data;
}

export function getEnv(): Env {
  if (!parsedEnv) {
    parsedEnv = validateEnv();
  }
  return parsedEnv;
}

export const env = new Proxy({} as Env, {
  get(_, key: string) {
    return getEnv()[key as keyof Env];
  },
});
