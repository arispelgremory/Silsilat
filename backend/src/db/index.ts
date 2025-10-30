import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

type PoolConfig = {
  user: string | undefined;
  password: string | undefined;
  host: string | undefined;
  port: number | undefined;
  database: string | undefined;
}

const poolConfig: PoolConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : undefined,
  database: process.env.POSTGRES_DB,
};

const pool = new Pool(poolConfig);

// Create a drizzle instance
export const db = drizzle(pool);
