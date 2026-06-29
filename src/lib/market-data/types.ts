/** Normalized OHLCV data point — used internally regardless of data source. */
export interface OhlcvPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Normalized market data result for a single ticker. */
export interface MarketDataResult {
  ticker: string;
  regularMarketPrice: number;
  regularMarketTime?: number; // Unix timestamp (seconds) of the last market price
  previousClose: number;
  ohlcv: OhlcvPoint[];
}

/** Normalized news article. */
export interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
}

/** Error result shape returned by market data functions. */
export interface MarketDataError {
  ok: false;
  error: { code: string; message: string };
}

/** Successful result shape. */
export interface MarketDataSuccess<T> {
  ok: true;
  data: T;
}

export type MarketDataResultOrError<T> =
  | MarketDataSuccess<T>
  | MarketDataError;
