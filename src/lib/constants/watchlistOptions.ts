export type WatchlistOptionKind = "ticker" | "sector";

export interface WatchlistOption {
  ticker: string;
  name: string;
  kind: WatchlistOptionKind;
}

/** Curated watchlist choices for onboarding and settings. */
export const watchlistOptions: WatchlistOption[] = [
  { ticker: "AAPL", name: "Apple", kind: "ticker" },
  { ticker: "TSLA", name: "Tesla", kind: "ticker" },
  { ticker: "NVDA", name: "Nvidia", kind: "ticker" },
  { ticker: "MSFT", name: "Microsoft", kind: "ticker" },
  { ticker: "AMZN", name: "Amazon", kind: "ticker" },
  { ticker: "META", name: "Meta", kind: "ticker" },
];

/** Tickers only — used by the recommendation generation pipeline. */
export const tickerWatchlistOptions = watchlistOptions.filter(
  (item) => item.kind === "ticker",
);
