import { existsSync, mkdirSync, writeFileSync } from "fs";
import type { NextConfig } from "next";
import { join } from "path";
import type { ZodRawShape } from "zod";
import { z } from "zod";

import { info, error, success } from "./utils/log";

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
  } catch (err) {
    throw error(`unable to save environment file: ${path}`);
  }
};

const validateEnv = (schema: z.AnyZodObject): Record<string, string | number> => {
  try {
    return schema.parse(process.env);
  } catch (rawErr) {
    const err = rawErr as z.ZodError;
    if (rawErr instanceof z.ZodError) {
      throw error(
        err.issues
          .map((issue) => {
            if (issue.message === "Required") {
              return `${issue.path.join(".")} required in schema but missing in environment`;
            } else {
              return `${issue.path.join(".")} ${issue.message}`;
            }
          })
          .join("\n")
      );
    } else {
      throw error(`unable to validate environment variables: ${err}`);
    }
  }
};

export const withTypedEnv = (nextConfig: NextConfig, schema: z.ZodObject<ZodRawShape>) => {
  info("validating environment against schema");
  const validate = validateEnv(schema);
  success("environment validated");
  info("generating environment files");
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
  success("environment files generated");
  return nextConfig;
};
