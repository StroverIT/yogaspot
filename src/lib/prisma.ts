import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

function isDelegateReady(client: PrismaClient): boolean {
  return typeof (client as unknown as { yogaClass?: { findMany: unknown } }).yogaClass?.findMany === 'function';
}

let productionClient: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    if (!productionClient || !isDelegateReady(productionClient)) {
      if (productionClient) void productionClient.$disconnect().catch(() => {});
      productionClient = createPrismaClient();
    }
    return productionClient;
  }

  let client = globalForPrisma.prisma;
  if (client && !isDelegateReady(client)) {
    void client.$disconnect().catch(() => {});
    client = undefined;
    globalForPrisma.prisma = undefined;
  }
  if (!client) {
    client = createPrismaClient();
    globalForPrisma.prisma = client;
  }
  return client;
}

/**
 * Lazily resolves the Prisma client so dev survives `prisma generate` without restarting
 * (avoids a stale `globalThis.prisma` missing new delegates like `yogaClass`).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    // Must use `client` as Reflect receiver — Prisma delegates rely on correct `this`;
    // passing the Proxy breaks accessors and yields `undefined` (e.g. `yogaClass`).
    const value = Reflect.get(client, prop, client) as unknown;
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
}) as PrismaClient;
