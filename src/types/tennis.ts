export interface PlayerBaseline {
  id: string;
  name: string;
  tour: 'ATP' | 'WTA';
  rank: number;
  country: string;
  handedness: 'R' | 'L';
  firstServeInPct: number;    // e.g. 0.64
  firstServeWinPct: number;   // e.g. 0.77
  secondServeWinPct: number;  // e.g. 0.53
  returnWinPct: number;       // e.g. 0.38
  breakPointSavePct: number;  // e.g. 0.65
  breakPointConvertPct: number;// e.g. 0.42
  clayModifier: number;       // e.g. -0.02
  grassModifier: number;      // e.g. +0.03
  hardModifier: number;       // e.g. 0.00
  indoorModifier: number;     // e.g. +0.02
  weloRating: number;         // e.g. 2150
  matchesSampled: number;     // for Bayesian shrinkage
  clutchRating: number;       // The Geter Principle baseline factor (0.8 - 1.2)
}

export type CourtSurface = 'Hard' | 'Clay' | 'Grass' | 'Indoor Hard';

export interface MatchEnvironment {
  surface: CourtSurface;
  cpi: number;             // Court Pace Index (20 to 50)
  altitudeMeters: number;  // Elevation (e.g. 667m Madrid, 2600m Bogota)
  bestOfSets: 3 | 5;
  player1FatigueHours: number; // On-court hours in last 72h
  player2FatigueHours: number;
  player1TravelKm: number;
  player2TravelKm: number;
}

export interface SimulationConfig {
  iterations: number;
  applyGeterPrinciple: boolean;
  geterMomentumDamping: number; // gamma factor
  geterClutchAmplifier: number; // kappa factor
  varianceExpansionOnLeverage: boolean;
}

export interface MarketOutput {
  p1WinProb: number;
  p2WinProb: number;
  p1FairDecimalOdds: number;
  p2FairDecimalOdds: number;
  p1Set1Prob: number;
  p2Set1Prob: number;
  setBetting: {
    '2-0'?: number;
    '2-1'?: number;
    '0-2'?: number;
    '1-2'?: number;
    '3-0'?: number;
    '3-1'?: number;
    '3-2'?: number;
    '0-3'?: number;
    '1-3'?: number;
    '2-3'?: number;
  };
  totalGamesDistribution: { games: number; count: number; prob: number }[];
  medianGames: number;
  meanGames: number;
  overUnderLines: {
    line: number;
    overProb: number;
    underProb: number;
    overDecimalOdds: number;
    underDecimalOdds: number;
  }[];
  tiebreakProbability: number;
  decidingSetProbability: number;
  durationAvgMinutes: number;
}

export interface ValueBetEdge {
  market: string;
  selection: string;
  modelProb: number;
  sportsbookOdds: number;
  impliedProb: number;
  deviggedProb: number;
  edgePct: number;
  expectedValue: number;
  fullKellyPct: number;
  quarterKellyPct: number;
  recommendedUnits: number;
}
