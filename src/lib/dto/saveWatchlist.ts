import { z } from "zod";

/** A single watchlist item in the saveWatchlist input (ticker-based). */
export const watchlistItemSchema = z.object({
  ticker: z.string().min(1).max(10),
});

export type WatchlistItem = z.infer<typeof watchlistItemSchema>;

/** Zod schema for `saveWatchlist()` Server Action input.
 *
 *  Accepts an array of 1-3 watchlist items.  Priority is assigned by
 *  array position (1-indexed).  The userId is injected server-side from the
 *  session, not from the client payload. */
export const saveWatchlistInputSchema = z.object({
  items: z.array(watchlistItemSchema).min(1).max(3),
});

export type SaveWatchlistInput = z.infer<typeof saveWatchlistInputSchema>;
