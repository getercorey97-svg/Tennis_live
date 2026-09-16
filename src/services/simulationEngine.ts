import { PlayerBaseline, MatchEnvironment, SimulationConfig, MarketOutput, ValueBetEdge } from '../types/tennis';
import { TOUR_AVERAGES } from '../data/seedPlayers';

/**
 * The Geter Principle & Monte Carlo Tennis Engine
 * Point-by-point simulation with Markov state machine and momentum stabilization
 */

export function calculateEffectiveServeProb(
  server: PlayerBaseline,
  receiver: PlayerBaseline,
  env: MatchEnvironment,
  isAdCourt: boolean = false
): { p1st: number; p2nd: number; pOverall: number } {
  const tour = server.tour;
  const tourAvg = TOUR_AVERAGES[tour];

  // 1. Surface modifier
  let surfaceMod = 0;
  if (env.surface === 'Clay') surfaceMod = server.clayModifier - (receiver.clayModifier * 0.5);
  else if (env.surface === 'Grass') surfaceMod = server.grassModifier - (receiver.grassModifier * 0.5);
  else if (env.surface === 'Indoor Hard') surfaceMod = server.indoorModifier - (receiver.indoorModifier * 0.5);
  else surfaceMod = server.hardModifier - (receiver.hardModifier * 0.5);

  // 2. CPI (Court Pace Index) modifier: Benchmark = 35
  const cpiDelta = (env.cpi - 35) * 0.0035;

  // 3. Altitude modifier (Air density aerodynamic drag reduction)
  const altitudeDelta = (env.altitudeMeters / 1000) * 0.012;

  // 4. Fatigue penalty
  const fatigueHours = server.id === 'p1' ? env.player1FatigueHours : env.player2FatigueHours;
  const fatiguePenalty = Math.max(0, fatigueHours - 4.5) * 0.008;

  // 5. Handedness asymmetry: Left-handed server slicing wide on Ad-court
  let southpawBonus = 0;
  if (server.handedness === 'L' && receiver.handedness === 'R') {
    southpawBonus = isAdCourt ? 0.024 : 0.010;
  }

  // Baseline 1st serve win probability adjusted for receiver's return skill
  // Formula: Server_1st_Win + (Tour_Avg_Return - Receiver_Return) + modifiers
  const receiverReturnDiff = (tourAvg.returnWinPct - receiver.returnWinPct);
  
  let p1st = server.firstServeWinPct + receiverReturnDiff + surfaceMod + cpiDelta + altitudeDelta - fatiguePenalty + southpawBonus;
  let p2nd = server.secondServeWinPct + (receiverReturnDiff * 0.75) + (surfaceMod * 0.8) + (cpiDelta * 0.5) + (altitudeDelta * 0.5) - (fatiguePenalty * 1.2) + (southpawBonus * 0.5);

  // Clamping within physical tennis boundaries
  p1st = Math.max(0.50, Math.min(0.92, p1st));
  p2nd = Math.max(0.30, Math.min(0.70, p2nd));

  const pOverall = (server.firstServeInPct * p1st) + ((1 - server.firstServeInPct) * p2nd);

  return { p1st, p2nd, pOverall };
}

/**
 * Calculate point leverage score L(s) under The Geter Principle
 */
function getPointLeverage(serverScore: number, receiverScore: number): number {
  // Leverage represents the impact of this point on set outcome
  // High leverage: 30-40 (break point), 40-AD (break point), Deuce, 40-30, 30-30
  if (receiverScore >= 3 && serverScore < receiverScore) return 0.95; // Break point
  if (serverScore === 3 && receiverScore === 3) return 0.80; // Deuce
  if (serverScore === 2 && receiverScore === 2) return 0.70; // 30-30
  if (receiverScore === 2 && serverScore === 3) return 0.65; // 40-30
  if (receiverScore === 3 && serverScore === 2) return 0.85; // 30-40 break point
  if (serverScore === 0 && receiverScore === 0) return 0.20; // Peaceful start
  return 0.40;
}

/**
 * Simulate a single tennis game
 */
function simulateGame(
  server: PlayerBaseline,
  receiver: PlayerBaseline,
  env: MatchEnvironment,
  config: SimulationConfig,
  momentum: { val: number }
): { serverWon: boolean; pointsPlayed: number } {
  let serverPoints = 0;
  let receiverPoints = 0;
  let pointsPlayed = 0;

  while (true) {
    pointsPlayed++;
    const isAdCourt = (serverPoints + receiverPoints) % 2 === 1;
    const { pOverall } = calculateEffectiveServeProb(server, receiver, env, isAdCourt);

    let effectiveP = pOverall;

    // The Geter Principle: Dynamic State Stabilization & Momentum Coupling
    if (config.applyGeterPrinciple) {
      const leverage = getPointLeverage(serverPoints, receiverPoints);
      const clutchDiff = (server.clutchRating - receiver.clutchRating);
      
      // High leverage triggers Geter shift:
      const geterShift = (clutchDiff * 0.05 * leverage) + (momentum.val * config.geterMomentumDamping);
      
      // Stabilization clamp to prevent chaotic divergence
      const stabilizedShift = Math.max(-0.12, Math.min(0.12, geterShift * config.geterClutchAmplifier));
      effectiveP += stabilizedShift;
    }

    // Stochastic point resolution
    if (Math.random() < effectiveP) {
      serverPoints++;
      momentum.val = Math.min(1.0, momentum.val + 0.15); // positive momentum for server
    } else {
      receiverPoints++;
      momentum.val = Math.max(-1.0, momentum.val - 0.15); // positive momentum for receiver
    }

    // Win conditions
    if (serverPoints >= 4 && serverPoints - receiverPoints >= 2) {
      return { serverWon: true, pointsPlayed };
    }
    if (receiverPoints >= 4 && receiverPoints - serverPoints >= 2) {
      return { serverWon: false, pointsPlayed };
    }
    if (pointsPlayed > 40) {
      // Numerical fail-safe
      return { serverWon: serverPoints > receiverPoints, pointsPlayed };
    }
  }
}

/**
 * Simulate a 7-point Tiebreak
 */
function simulateTiebreak(
  p1: PlayerBaseline,
  p2: PlayerBaseline,
  env: MatchEnvironment,
  config: SimulationConfig,
  momentum: { val: number },
  p1ServesFirst: boolean
): { p1Won: boolean; totalPoints: number } {
  let p1Points = 0;
  let p2Points = 0;
  let currentServerIsP1 = p1ServesFirst;
  let pointsPlayed = 0;

  while (true) {
    pointsPlayed++;
    const server = currentServerIsP1 ? p1 : p2;
    const receiver = currentServerIsP1 ? p2 : p1;
    const isAdCourt = (p1Points + p2Points) % 2 === 1;

    const { pOverall } = calculateEffectiveServeProb(server, receiver, env, isAdCourt);
    let effectiveP = pOverall;

    if (config.applyGeterPrinciple) {
      // Tiebreak points are inherently high leverage
      const clutchDiff = currentServerIsP1 ? (p1.clutchRating - p2.clutchRating) : (p2.clutchRating - p1.clutchRating);
      const leverage = (p1Points >= 5 && p2Points >= 5) ? 0.95 : 0.75;
      const geterShift = (clutchDiff * 0.06 * leverage) + (momentum.val * config.geterMomentumDamping * (currentServerIsP1 ? 1 : -1));
      effectiveP += Math.max(-0.14, Math.min(0.14, geterShift * config.geterClutchAmplifier));
    }

    const serverWon = Math.random() < effectiveP;
    if (currentServerIsP1) {
      if (serverWon) {
        p1Points++;
        momentum.val = Math.min(1.0, momentum.val + 0.12);
      } else {
        p2Points++;
        momentum.val = Math.max(-1.0, momentum.val - 0.12);
      }
    } else {
      if (serverWon) {
        p2Points++;
        momentum.val = Math.max(-1.0, momentum.val - 0.12);
      } else {
        p1Points++;
        momentum.val = Math.min(1.0, momentum.val + 0.12);
      }
    }

    // Check tiebreak victory (first to 7 by 2)
    if (p1Points >= 7 && p1Points - p2Points >= 2) return { p1Won: true, totalPoints: pointsPlayed };
    if (p2Points >= 7 && p2Points - p1Points >= 2) return { p1Won: false, totalPoints: pointsPlayed };

    // Service changes every 2 points after point 1
    if (pointsPlayed % 2 === 1) {
      currentServerIsP1 = !currentServerIsP1;
    }
  }
}

/**
 * Simulate a single tennis Set
 */
function simulateSet(
  p1: PlayerBaseline,
  p2: PlayerBaseline,
  env: MatchEnvironment,
  config: SimulationConfig,
  momentum: { val: number },
  p1ServesFirst: boolean
): { p1Won: boolean; p1Games: number; p2Games: number; hadTiebreak: boolean } {
  let p1Games = 0;
  let p2Games = 0;
  let currentServerIsP1 = p1ServesFirst;

  while (true) {
    if (currentServerIsP1) {
      const res = simulateGame(p1, p2, env, config, momentum);
      if (res.serverWon) p1Games++;
      else p2Games++;
    } else {
      const res = simulateGame(p2, p1, env, config, momentum);
      if (res.serverWon) p2Games++;
      else p1Games++;
    }

    currentServerIsP1 = !currentServerIsP1;

    // Standard set win condition
    if (p1Games >= 6 && p1Games - p2Games >= 2) {
      return { p1Won: true, p1Games, p2Games, hadTiebreak: false };
    }
    if (p2Games >= 6 && p2Games - p1Games >= 2) {
      return { p1Won: false, p1Games, p2Games, hadTiebreak: false };
    }

    // 6-6 Tiebreak
    if (p1Games === 6 && p2Games === 6) {
      const tbRes = simulateTiebreak(p1, p2, env, config, momentum, currentServerIsP1);
      if (tbRes.p1Won) {
        return { p1Won: true, p1Games: 7, p2Games: 6, hadTiebreak: true };
      } else {
        return { p1Won: false, p1Games: 6, p2Games: 7, hadTiebreak: true };
      }
    }
  }
}

/**
 * Run complete match simulation for 50,000 iterations (or specified count)
 */
export function runMonteCarloSimulation(
  p1: PlayerBaseline,
  p2: PlayerBaseline,
  env: MatchEnvironment,
  config: SimulationConfig
): MarketOutput {
  const setsToWin = env.bestOfSets === 5 ? 3 : 2;
  const iterations = config.iterations;

  let p1MatchWins = 0;
  let p2MatchWins = 0;
  let p1Set1Wins = 0;
  let tiebreakCount = 0;
  let decidingSetCount = 0;

  const setScores: Record<string, number> = {};
  const gameCounts: Record<number, number> = {};
  let totalGamesAccumulated = 0;

  // Track each Monte Carlo path
  for (let i = 0; i < iterations; i++) {
    let p1Sets = 0;
    let p2Sets = 0;
    let matchTotalGames = 0;
    let p1ServesSet = i % 2 === 0; // Alternating coin-toss serve opening
    const momentum = { val: 0 };
    let matchHadTiebreak = false;

    let setIndex = 0;
    while (p1Sets < setsToWin && p2Sets < setsToWin) {
      setIndex++;
      const setResult = simulateSet(p1, p2, env, config, momentum, p1ServesSet);
      matchTotalGames += (setResult.p1Games + setResult.p2Games);
      if (setResult.hadTiebreak) matchHadTiebreak = true;

      if (setIndex === 1 && setResult.p1Won) {
        p1Set1Wins++;
      }

      if (setResult.p1Won) p1Sets++;
      else p2Sets++;

      // Next set server is opposite of last game server
      p1ServesSet = !p1ServesSet;
    }

    if (matchHadTiebreak) tiebreakCount++;
    if (p1Sets + p2Sets === env.bestOfSets) decidingSetCount++;

    const scoreKey = `${p1Sets}-${p2Sets}`;
    setScores[scoreKey] = (setScores[scoreKey] || 0) + 1;
    gameCounts[matchTotalGames] = (gameCounts[matchTotalGames] || 0) + 1;
    totalGamesAccumulated += matchTotalGames;

    if (p1Sets > p2Sets) p1MatchWins++;
    else p2MatchWins++;
  }

  const p1WinProb = p1MatchWins / iterations;
  const p2WinProb = p2MatchWins / iterations;
  const p1Set1Prob = p1Set1Wins / iterations;
  const p2Set1Prob = 1 - p1Set1Prob;

  // Set betting distribution
  const setBetting: MarketOutput['setBetting'] = {};
  for (const [key, count] of Object.entries(setScores)) {
    (setBetting as Record<string, number>)[key] = count / iterations;
  }

  // Games distribution & Over/Under calculations
  const totalGamesDistribution = Object.entries(gameCounts)
    .map(([games, count]) => ({
      games: Number(games),
      count,
      prob: count / iterations,
    }))
    .sort((a, b) => a.games - b.games);

  const meanGames = totalGamesAccumulated / iterations;
  
  // Median calculation
  let runningCount = 0;
  let medianGames = meanGames;
  for (const item of totalGamesDistribution) {
    runningCount += item.count;
    if (runningCount >= iterations / 2) {
      medianGames = item.games;
      break;
    }
  }

  // Common tennis over/under lines based on bestOfSets
  const candidateLines = env.bestOfSets === 3 
    ? [19.5, 20.5, 21.5, 22.5, 23.5, 24.5]
    : [34.5, 36.5, 38.5, 40.5, 42.5];

  const overUnderLines = candidateLines.map(line => {
    let underCount = 0;
    for (const item of totalGamesDistribution) {
      if (item.games < line) underCount += item.count;
    }
    const underProb = underCount / iterations;
    const overProb = 1 - underProb;
    return {
      line,
      overProb,
      underProb,
      overDecimalOdds: overProb > 0 ? Number((1 / overProb).toFixed(2)) : 99,
      underDecimalOdds: underProb > 0 ? Number((1 / underProb).toFixed(2)) : 99,
    };
  });

  return {
    p1WinProb,
    p2WinProb,
    p1FairDecimalOdds: p1WinProb > 0 ? Number((1 / p1WinProb).toFixed(3)) : 999,
    p2FairDecimalOdds: p2WinProb > 0 ? Number((1 / p2WinProb).toFixed(3)) : 999,
    p1Set1Prob,
    p2Set1Prob,
    setBetting,
    totalGamesDistribution,
    medianGames,
    meanGames: Number(meanGames.toFixed(2)),
    overUnderLines,
    tiebreakProbability: tiebreakCount / iterations,
    decidingSetProbability: decidingSetCount / iterations,
    durationAvgMinutes: Math.round(meanGames * 4.2),
  };
}

/**
 * Remove vigorish (margin) from sportsbook odds using the Multiplicative / Proportional method
 */
export function devigOdds(odds1: number, odds2: number): { p1Devigged: number; p2Devigged: number; margin: number } {
  const imp1 = 1 / odds1;
  const imp2 = 1 / odds2;
  const sum = imp1 + imp2;
  const margin = sum - 1.0;
  return {
    p1Devigged: imp1 / sum,
    p2Devigged: imp2 / sum,
    margin,
  };
}

/**
 * Calculate Kelly Criterion stake & Expected Value (+EV)
 */
export function evaluateValueBet(
  market: string,
  selection: string,
  modelProb: number,
  sportsbookOdds: number
): ValueBetEdge {
  const impliedProb = 1 / sportsbookOdds;
  const b = sportsbookOdds - 1; // decimal odds - 1
  const p = modelProb;
  const q = 1 - p;

  // Kelly formula: f* = (bp - q) / b
  const fullKelly = b > 0 ? (b * p - q) / b : 0;
  const quarterKelly = Math.max(0, fullKelly * 0.25);
  const edgePct = (modelProb - impliedProb) * 100;
  const expectedValue = (modelProb * sportsbookOdds - 1) * 100;

  return {
    market,
    selection,
    modelProb,
    sportsbookOdds,
    impliedProb,
    deviggedProb: impliedProb, // simplified
    edgePct: Number(edgePct.toFixed(2)),
    expectedValue: Number(expectedValue.toFixed(2)),
    fullKellyPct: Number((Math.max(0, fullKelly) * 100).toFixed(2)),
    quarterKellyPct: Number((quarterKelly * 100).toFixed(2)),
    recommendedUnits: Number((quarterKelly * 5).toFixed(2)), // 1 unit = 1% bankroll
  };
}
