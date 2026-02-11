import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development")
  },
  runtimeEnv: {
    DATABASE_URL: process.env["DATABASE_URL"],
    OPENAI_API_KEY: process.env["OPENAI_API_KEY"],
    NEXTAUTH_SECRET: process.env["NEXTAUTH_SECRET"],
    NODE_ENV: process.env["NODE_ENV"]
  }
});

export type Env = typeof env;
