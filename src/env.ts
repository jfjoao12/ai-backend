import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

for (const envFile of ['.env.local', '.env']) {
  if (existsSync(envFile)) {
    loadEnvFile(envFile);
  }
}
