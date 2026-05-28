export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';
export type Direction = 'BUY' | 'SELL';
export type ConfidenceScore = 'conservative' | 'balanced' | 'aggressive';

export interface User {
  name: string;
  timezone: string;
  defaultRiskProfile: RiskProfile;
  pushEnabled: boolean;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  kind: 'ticker' | 'sector';
}

export interface RecommendationCard {
  id: string;
  ticker: string;
  companyName: string;
  direction: Direction;
  entryPrice?: number;
  entryRangeMin?: number;
  entryRangeMax?: number;
  targetPrice?: number;
  targetRangeMin?: number;
  targetRangeMax?: number;
  stopPrice: number;
  holdDays: number;
  confidenceScore: ConfidenceScore;
  actionLabel: string;
  reasonLine: string;
}

export interface PerformanceRecord {
  ticker: string;
  predictedDirection: Direction;
  realizedReturn: string;
  hitFlag: 'success' | 'fail' | 'evaluating';
  evaluationWindowDays: number;
  evaluatedAt: string;
}

export interface NoCallCard {
  status: 'no_call';
  title: string;
  body: string;
  nextAction: string;
}

export interface DebugEvent {
  timestamp: string;
  eventName: string;
  data?: any;
}
