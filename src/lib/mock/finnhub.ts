// Finnhub OHLCV uses "c" (close), "h" (high), "l" (low), "o" (open), "v" (volume), "t" (timestamp). All Unix seconds.

export const mockFinnhubCandleAAPL = {
  c: [181.5, 182.2, 182.8, 182.3, 183.9],
  h: [182.4, 183.1, 183.5, 182.9, 184.2],
  l: [179.8, 180.5, 181.2, 181.0, 182.1],
  o: [180.1, 181.3, 182.0, 181.7, 182.8],
  v: [52000000, 48000000, 55000000, 51000000, 53000000],
  t: [1716854400, 1716940800, 1717027200, 1717113600, 1717200000],
  s: "ok" as const,
};

export const mockFinnhubCandleTSLA = {
  c: [243.8, 244.5, 245.2, 244.1, 246.8],
  h: [245.2, 246.0, 247.1, 245.8, 247.3],
  l: [241.1, 242.2, 243.5, 242.8, 244.0],
  o: [242.0, 243.5, 244.8, 243.2, 245.5],
  v: [89000000, 92000000, 87000000, 95000000, 91000000],
  t: [1716854400, 1716940800, 1717027200, 1717113600, 1717200000],
  s: "ok" as const,
};

export const mockFinnhubCandleEmpty = {
  c: [], h: [], l: [], o: [], v: [], t: [],
  s: "no_data" as const,
};

export const mockFinnhubNewsAAPL = [
  {
    category: "technology",
    datetime: 1716854400,
    headline: "Apple Reports Strong Q2 Earnings, Beats Estimates",
    id: 1001,
    image: "https://example.com/apple-earnings.jpg",
    related: "AAPL",
    source: "Financial Times",
    summary: "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales.",
    url: "https://example.com/news/1001",
  },
  {
    category: "technology",
    datetime: 1716940800,
    headline: "Apple Announces New AI Features for iOS",
    id: 1002,
    image: "https://example.com/apple-ai.jpg",
    related: "AAPL",
    source: "TechCrunch",
    summary: "Apple unveiled new artificial intelligence capabilities coming to iOS later this year.",
    url: "https://example.com/news/1002",
  },
];

export const mockFinnhubNewsEmpty: unknown[] = [];
