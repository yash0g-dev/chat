import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from the environment variables.");
}

// 1. Create a standard Postgres connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Wrap the pool in Prisma's new Postgres adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter into the Prisma Client constructor
const prisma = new PrismaClient({ adapter });

export default prisma;
