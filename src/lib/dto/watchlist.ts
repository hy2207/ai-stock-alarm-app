import { z } from "zod";

/** Zod schema for validating Watchlist create payloads (ticker-based). */
export const watchlistCreateSchema = z.object({
  userId: z.string().cuid(),
  ticker: z.string().min(1).max(10),
  priority: z.number().int().min(1).max(3),
});

export type WatchlistCreateInput = z.infer<typeof watchlistCreateSchema>;

/** Zod schema matching the full Prisma Watchlist model (for output assertions). */
export const watchlistSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  ticker: z.string().nullable(),
  priority: z.number().int().min(1).max(3),
  createdAt: z.date(),
});

export type Watchlist = z.infer<typeof watchlistSchema>;
