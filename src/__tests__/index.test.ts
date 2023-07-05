import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

import { withTypedEnv } from "../index";

describe("next-typed-env", () => {
  process.env = Object.assign(process.env, {
    NEXT_PUBLIC_API_URL: "https://api.example.com",
    SECRET_KEY: "mysecretkey",
    NODE_ENV: "development",
  });

  const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string(),
    SECRET_KEY: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]),
  });

  const dummyNextConfig = {};

  withTypedEnv(dummyNextConfig, envSchema);

  const envDir = join(process.cwd(), "./env");
  const clientEnvFilePath = join(envDir, "env.client.ts");
  const serverEnvFilePath = join(envDir, "env.server.ts");

  it("should create env.client.ts file", () => {
    const fileExists = existsSync(clientEnvFilePath);
    expect(fileExists).toBe(true);
  });

  it("should create env.server.ts file", () => {
    const fileExists = existsSync(serverEnvFilePath);
    expect(fileExists).toBe(true);
  });

  it("should have properly formatted exports in env.client.ts", () => {
    const content = readFileSync(clientEnvFilePath, "utf8");
    expect(content).toContain(
      "export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL as 'https://api.example.com';"
    );
  });

  it("should have properly formatted exports in env.server.ts", () => {
    const content = readFileSync(serverEnvFilePath, "utf8");
    expect(content).toContain("export const SECRET_KEY = process.env.SECRET_KEY as 'mysecretkey';");
  });

  it("should generate typed enum for NODE_ENV in env.client.ts", () => {
    const content = readFileSync(clientEnvFilePath, "utf8");
    expect(content).toContain("export const NODE_ENV = process.env.NODE_ENV as 'development' | 'production' | 'test';");
  });

  it("should throw error for invalid environment variables", () => {
    const invalidEnvSchema = z.object({
      VALID_ENV: z.string(),
    });

    process.env = Object.assign(process.env, {
      INVALID_ENV: "123",
    });

    expect(() => withTypedEnv(dummyNextConfig, invalidEnvSchema)).toThrow();
  });
});
