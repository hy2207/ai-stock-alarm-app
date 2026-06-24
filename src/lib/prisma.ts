import { PrismaClient } from "@prisma/client";

// In serverless (Vercel), each cold-start would open a new connection.
// For PostgreSQL / Supabase PgBouncer, we enforce connection_limit=1 so
// individual function invocations don't exhaust the pool.
// SQLite (local dev) is unaffected — undefined falls back to DATABASE_URL.
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("postgres")) return undefined;

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "1");
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
