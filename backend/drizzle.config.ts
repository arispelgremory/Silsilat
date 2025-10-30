import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

console.log('🚀 DATABASE_URL', process.env.DATABASE_URL);

export default defineConfig({
  schema: [
    './src/db/db.schema.ts',
    './src/features/**/*.model.ts'
  ],
  out: './postgres/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});