import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

for (const envFile of ['.env.local', '.env']) {
  if (existsSync(envFile)) {
    loadEnvFile(envFile);
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
