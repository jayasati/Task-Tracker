import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

// Use connection string directly (no Pool!)
const connectionString = process.env.DATABASE_URL!;

// Create adapter with required options argument
const adapter = new PrismaNeonHttp(
  connectionString,
  {} // Required 2nd argument (empty options)
);

const prismaClientSingleton = () =>
  new PrismaClient({
    adapter,
  });

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
