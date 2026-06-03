import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

if (!process.env.DATABASE_URL) {
  loadEnv({ path: ".env.local", override: false });
  loadEnv({ path: ".env", override: false });
}

function getConnectionString() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  return raw.trim().replace(/^['"]|['"]$/g, "");
}

function createPrismaClient() {
  const adapter = new PrismaPg(getConnectionString());
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
