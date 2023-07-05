import { existsSync, mkdirSync, writeFileSync } from "fs";
import type { NextConfig } from "next";
import { join } from "path";
import { z } from "zod";

const renderEnvExport = (key: string, value: (string | number)[]) =>
  `export const ${key} = process.env.${key} as ${
    process.env.VERCEL !== "1" ? `${value.map((v) => `'${v}'`).join(" | ")}` : "string"
  };`.trim();

const renderEnvFile = (env: Record<string, (string | number)[]>) => {
  const envExports = Object.entries(env).map(([key, value]) => renderEnvExport(key, value));
  return envExports.join("\n\n");
};

const writeEnvFile = (path: string, data: string) => {
  try {
    writeFileSync(path, data);
  } catch (error) {
    throw new Error(`Error writing file: ${error}`);
  }
};

const validateEnv = (schema: z.AnyZodObject): Record<string, string | number> => {
  try {
    return schema.parse(process.env);
  } catch (error) {
    const err = error as z.ZodError;
    throw new Error(`Error validating environment variables: ${err.message}`);
  }
};

export const withTypedEnv = (nextConfig: NextConfig, schema: z.AnyZodObject) => {
  const validate = validateEnv(schema);
  const { client, server } = Object.entries(validate).reduce(
    ({ client, server }, [key, value]) => {
      const shape = schema.shape[key];
      const isPublic = key.startsWith("NEXT_PUBLIC_") || key === "NODE_ENV";
      const newValue = shape instanceof z.ZodEnum ? shape._def.values : [value];
      return {
        client: isPublic ? { ...client, [key]: newValue } : client,
        server: { ...server, [key]: newValue },
      };
    },
    { client: {}, server: {} }
  );
  const envDir = join(process.cwd(), "./env");
  if (!existsSync(envDir)) mkdirSync(envDir, { recursive: true });
  writeEnvFile(join(envDir, "env.client.ts"), renderEnvFile(client));
  writeEnvFile(join(envDir, "env.server.ts"), renderEnvFile(server));
  return nextConfig;
};
