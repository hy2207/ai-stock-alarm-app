import type { UserCreateInput } from "../dto/user";
import type { RiskProfileCreateInput } from "../dto/riskProfile";
import type { WatchlistCreateInput } from "../dto/watchlist";

export const mockUser: UserCreateInput = {
  email: "demo@ai-stock-alarm.app",
  name: "Demo User",
  signupChannel: "email",
  timezone: "Asia/Seoul",
  consentPush: true,
};

export const MOCK_USER_ID = "clx987demo00000000000001" as const;

export const mockRiskProfile: RiskProfileCreateInput = {
  userId: MOCK_USER_ID,
  riskMode: "balanced",
};

export const mockWatchlist: WatchlistCreateInput[] = [
  {
    userId: MOCK_USER_ID,
    ticker: "AAPL",
    priority: 1,
  },
  {
    userId: MOCK_USER_ID,
    ticker: "MSFT",
    priority: 2,
  },
  {
    userId: MOCK_USER_ID,
    ticker: "TSLA",
    priority: 3,
  },
];

export const mockMinimalWatchlist: WatchlistCreateInput[] = [
  {
    userId: MOCK_USER_ID,
    ticker: "NVDA",
    priority: 1,
  },
];

export const mockUserWithKakao: UserCreateInput = {
  email: null,
  name: "Kakao User",
  signupChannel: "kakao",
  timezone: "Asia/Seoul",
  consentPush: false,
};
