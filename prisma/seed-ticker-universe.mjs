// Run: node prisma/seed-ticker-universe.mjs
// Upserts top-50 US market cap tickers into TickerUniverse.
// Re-running is safe (upsert). Adjust ranks as market changes.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOP_50 = [
  { ticker: "AAPL",  name: "Apple Inc.",              sector: "Technology",         marketCapRank: 1  },
  { ticker: "NVDA",  name: "Nvidia Corporation",       sector: "Technology",         marketCapRank: 2  },
  { ticker: "MSFT",  name: "Microsoft Corporation",    sector: "Technology",         marketCapRank: 3  },
  { ticker: "GOOGL", name: "Alphabet Inc.",             sector: "Communication",      marketCapRank: 4  },
  { ticker: "AMZN",  name: "Amazon.com Inc.",           sector: "Consumer Cyclical",  marketCapRank: 5  },
  { ticker: "META",  name: "Meta Platforms Inc.",       sector: "Communication",      marketCapRank: 6  },
  { ticker: "TSLA",  name: "Tesla Inc.",                sector: "Consumer Cyclical",  marketCapRank: 7  },
  { ticker: "AVGO",  name: "Broadcom Inc.",             sector: "Technology",         marketCapRank: 8  },
  { ticker: "BRK.B", name: "Berkshire Hathaway",        sector: "Financials",         marketCapRank: 9  },
  { ticker: "JPM",   name: "JPMorgan Chase & Co.",      sector: "Financials",         marketCapRank: 10 },
  { ticker: "LLY",   name: "Eli Lilly and Company",     sector: "Healthcare",         marketCapRank: 11 },
  { ticker: "WMT",   name: "Walmart Inc.",              sector: "Consumer Defensive", marketCapRank: 12 },
  { ticker: "V",     name: "Visa Inc.",                 sector: "Financials",         marketCapRank: 13 },
  { ticker: "ORCL",  name: "Oracle Corporation",        sector: "Technology",         marketCapRank: 14 },
  { ticker: "XOM",   name: "ExxonMobil Corporation",   sector: "Energy",             marketCapRank: 15 },
  { ticker: "MA",    name: "Mastercard Incorporated",  sector: "Financials",         marketCapRank: 16 },
  { ticker: "UNH",   name: "UnitedHealth Group",        sector: "Healthcare",         marketCapRank: 17 },
  { ticker: "NFLX",  name: "Netflix Inc.",              sector: "Communication",      marketCapRank: 18 },
  { ticker: "HD",    name: "The Home Depot Inc.",       sector: "Consumer Cyclical",  marketCapRank: 19 },
  { ticker: "COST",  name: "Costco Wholesale",          sector: "Consumer Defensive", marketCapRank: 20 },
  { ticker: "ADBE",  name: "Adobe Inc.",                sector: "Technology",         marketCapRank: 21 },
  { ticker: "JNJ",   name: "Johnson & Johnson",         sector: "Healthcare",         marketCapRank: 22 },
  { ticker: "CRM",   name: "Salesforce Inc.",           sector: "Technology",         marketCapRank: 23 },
  { ticker: "BAC",   name: "Bank of America Corp.",     sector: "Financials",         marketCapRank: 24 },
  { ticker: "AMD",   name: "Advanced Micro Devices",   sector: "Technology",         marketCapRank: 25 },
  { ticker: "KO",    name: "The Coca-Cola Company",    sector: "Consumer Defensive", marketCapRank: 26 },
  { ticker: "PEP",   name: "PepsiCo Inc.",              sector: "Consumer Defensive", marketCapRank: 27 },
  { ticker: "QCOM",  name: "Qualcomm Incorporated",    sector: "Technology",         marketCapRank: 28 },
  { ticker: "PG",    name: "Procter & Gamble Co.",     sector: "Consumer Defensive", marketCapRank: 29 },
  { ticker: "GE",    name: "GE Aerospace",              sector: "Industrials",        marketCapRank: 30 },
  { ticker: "MRK",   name: "Merck & Co. Inc.",          sector: "Healthcare",         marketCapRank: 31 },
  { ticker: "ABBV",  name: "AbbVie Inc.",               sector: "Healthcare",         marketCapRank: 32 },
  { ticker: "DIS",   name: "The Walt Disney Company",  sector: "Communication",      marketCapRank: 33 },
  { ticker: "PM",    name: "Philip Morris International", sector: "Consumer Defensive", marketCapRank: 34 },
  { ticker: "RTX",   name: "RTX Corporation",           sector: "Industrials",        marketCapRank: 35 },
  { ticker: "TMO",   name: "Thermo Fisher Scientific", sector: "Healthcare",         marketCapRank: 36 },
  { ticker: "INTU",  name: "Intuit Inc.",               sector: "Technology",         marketCapRank: 37 },
  { ticker: "AMAT",  name: "Applied Materials Inc.",    sector: "Technology",         marketCapRank: 38 },
  { ticker: "NOW",   name: "ServiceNow Inc.",           sector: "Technology",         marketCapRank: 39 },
  { ticker: "MU",    name: "Micron Technology Inc.",   sector: "Technology",         marketCapRank: 40 },
  { ticker: "BKNG",  name: "Booking Holdings Inc.",    sector: "Consumer Cyclical",  marketCapRank: 41 },
  { ticker: "PANW",  name: "Palo Alto Networks",        sector: "Technology",         marketCapRank: 42 },
  { ticker: "VZ",    name: "Verizon Communications",   sector: "Communication",      marketCapRank: 43 },
  { ticker: "NEE",   name: "NextEra Energy Inc.",       sector: "Utilities",          marketCapRank: 44 },
  { ticker: "T",     name: "AT&T Inc.",                 sector: "Communication",      marketCapRank: 45 },
  { ticker: "INTC",  name: "Intel Corporation",         sector: "Technology",         marketCapRank: 46 },
  { ticker: "UPS",   name: "United Parcel Service",    sector: "Industrials",        marketCapRank: 47 },
  { ticker: "DE",    name: "Deere & Company",           sector: "Industrials",        marketCapRank: 48 },
  { ticker: "LOW",   name: "Lowe's Companies Inc.",    sector: "Consumer Cyclical",  marketCapRank: 49 },
  { ticker: "PFE",   name: "Pfizer Inc.",               sector: "Healthcare",         marketCapRank: 50 },
];

async function main() {
  console.log(`Seeding ${TOP_50.length} tickers into TickerUniverse…`);

  for (const row of TOP_50) {
    await prisma.tickerUniverse.upsert({
      where: { ticker: row.ticker },
      create: row,
      update: { name: row.name, sector: row.sector, marketCapRank: row.marketCapRank },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
