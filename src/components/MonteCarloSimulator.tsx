import React, { useState, useTransition } from 'react';
import { SEED_PLAYERS } from '../data/seedPlayers';
import { PlayerBaseline, MatchEnvironment, CourtSurface, MarketOutput, ValueBetEdge } from '../types/tennis';
import { runMonteCarloSimulation, evaluateValueBet } from '../services/simulationEngine';
import { Play, Sparkles, Sliders, Shield, Zap, TrendingUp, Info } from 'lucide-react';

export const MonteCarloSimulator: React.FC = () => {
  const [player1Id, setPlayer1Id] = useState<string>('atp_alcaraz');
  const [player2Id, setPlayer2Id] = useState<string>('atp_sinner');
  const [surface, setSurface] = useState<CourtSurface>('Hard');
  const [cpi, setCpi] = useState<number>(38); // Medium-fast hard court
  const [altitudeMeters, setAltitudeMeters] = useState<number>(100);
  const [bestOfSets, setBestOfSets] = useState<3 | 5>(3);
  const [p1Fatigue, setP1Fatigue] = useState<number>(2.0);
  const [p2Fatigue, setP2Fatigue] = useState<number>(2.5);
  const [iterations, setIterations] = useState<number>(50000);
  const [applyGeterPrinciple, setApplyGeterPrinciple] = useState<boolean>(true);

  // Sportsbook comparison inputs
  const [sportsbookOddsP1, setSportsbookOddsP1] = useState<number>(1.85);
  const [sportsbookOddsP2, setSportsbookOddsP2] = useState<number>(2.05);

  const [simResults, setSimResults] = useState<MarketOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const p1 = SEED_PLAYERS.find(p => p.id === player1Id) || SEED_PLAYERS[0];
  const p2 = SEED_PLAYERS.find(p => p.id === player2Id) || SEED_PLAYERS[1];

  const handleRunSimulation = () => {
    startTransition(() => {
      const env: MatchEnvironment = {
        surface,
        cpi,
        altitudeMeters,
        bestOfSets,
        player1FatigueHours: p1Fatigue,
        player2FatigueHours: p2Fatigue,
        player1TravelKm: 500,
        player2TravelKm: 500,
      };

      const config = {
        iterations,
        applyGeterPrinciple,
        geterMomentumDamping: 0.035,
        geterClutchAmplifier: 1.0,
        varianceExpansionOnLeverage: true,
      };

      const output = runMonteCarloSimulation(p1, p2, env, config);
      setSimResults(output);
    });
  };

  // Initial auto-run once
  React.useEffect(() => {
    handleRunSimulation();
  }, []);

  const valueBetP1: ValueBetEdge | null = simResults
    ? evaluateValueBet('Moneyline', p1.name, simResults.p1WinProb, sportsbookOddsP1)
    : null;

  const valueBetP2: ValueBetEdge | null = simResults
    ? evaluateValueBet('Moneyline', p2.name, simResults.p2WinProb, sportsbookOddsP2)
    : null;

  return (
    <div className="space-y-6">
      {/* Simulation Controls Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              Exact 50,000 Iteration Convergence
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Monte Carlo Matchup Simulator & Market Pricer
            </h2>
          </div>

          <button
            id="run-sim-btn"
            onClick={handleRunSimulation}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Play className={`w-4 h-4 fill-current ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Simulating 50k Matches...' : 'Run 50,000 Simulations'}
          </button>
        </div>

        {/* Player Matchup Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player 1 Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Player 1 (Server A)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {p1.handedness === 'L' ? 'Left-Handed (Southpaw)' : 'Right-Handed'}
              </span>
            </div>

            <select
              id="select-player-1"
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-emerald-500"
            >
              {SEED_PLAYERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tour} #{p.rank} • WElo {p.weloRating})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">1st Srv Win</span>
                <span className="font-mono text-emerald-400 font-semibold">{(p1.firstServeWinPct * 100).toFixed(0)}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">2nd Srv Win</span>
                <span className="font-mono text-emerald-400 font-semibold">{(p1.secondServeWinPct * 100).toFixed(0)}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Return Win</span>
                <span className="font-mono text-sky-400 font-semibold">{(p1.returnWinPct * 100).toFixed(0)}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Clutch (Ω)</span>
                <span className="font-mono text-amber-400 font-semibold">{p1.clutchRating.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Trailing 72h Court Fatigue:</span>
              <span className="font-mono text-amber-400 font-bold">{p1Fatigue.toFixed(1)} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="9"
              step="0.5"
              value={p1Fatigue}
              onChange={(e) => setP1Fatigue(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Player 2 Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-sky-400 uppercase font-semibold">Player 2 (Server B)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {p2.handedness === 'L' ? 'Left-Handed (Southpaw)' : 'Right-Handed'}
              </span>
            </div>

            <select
              id="select-player-2"
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-sky-500"
            >
              {SEED_PLAYERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tour} #{p.rank} • WElo {p.weloRating})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">1st Srv Win</span>
                <span className="font-mono text-emerald-400 font-semibold">{(p2.firstServeWinPct * 100).toFixed(0)}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">2nd Srv Win</span>
                <span className="font-mono text-emerald-400 font-semibold">{(p2.secondServeWinPct * 100).toFixed(0)}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Return Win</span>
                <span className="font-mono text-sky-400 font-semibold">{(p2.returnWinPct * 100).toFixed(0)}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Clutch (Ω)</span>
                <span className="font-mono text-amber-400 font-semibold">{p2.clutchRating.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Trailing 72h Court Fatigue:</span>
              <span className="font-mono text-amber-400 font-bold">{p2Fatigue.toFixed(1)} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="9"
              step="0.5"
              value={p2Fatigue}
              onChange={(e) => setP2Fatigue(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Environmental & Physics Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          {/* Surface */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-emerald-400" />
              Court Surface
            </label>
            <select
              value={surface}
              onChange={(e) => setSurface(e.target.value as CourtSurface)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium"
            >
              <option value="Hard">Hard (Baseline)</option>
              <option value="Clay">Clay (Slow / Heavy Spin)</option>
              <option value="Grass">Grass (Fast / Low Bounce)</option>
              <option value="Indoor Hard">Indoor Hard (Zero Wind)</option>
            </select>
          </div>

          {/* CPI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Court Pace Index (CPI):</span>
              <span className="font-mono text-emerald-400 font-bold">{cpi}</span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              value={cpi}
              onChange={(e) => setCpi(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              {cpi < 30 ? 'Slow Clay' : cpi <= 37 ? 'Medium Pace' : 'Fast Hard / Grass'}
            </span>
          </div>

          {/* Altitude */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Altitude Elevation:</span>
              <span className="font-mono text-sky-400 font-bold">{altitudeMeters}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="2700"
              step="50"
              value={altitudeMeters}
              onChange={(e) => setAltitudeMeters(parseInt(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              {altitudeMeters < 300 ? 'Sea Level' : altitudeMeters < 1000 ? 'Madrid (667m)' : 'Bogota (2600m)'}
            </span>
          </div>

          {/* Match Format & Iterations */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Format & Iterations</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBestOfSets(3)}
                className={`flex-1 py-1 rounded text-xs font-semibold cursor-pointer ${
                  bestOfSets === 3 ? 'bg-emerald-600 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}
              >
                Best of 3
              </button>
              <button
                onClick={() => setBestOfSets(5)}
                className={`flex-1 py-1 rounded text-xs font-semibold cursor-pointer ${
                  bestOfSets === 5 ? 'bg-emerald-600 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}
              >
                Best of 5
              </button>
            </div>
          </div>
        </div>

        {/* The Geter Principle Toggle */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                The Geter Principle: Dynamic State Stabilization
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-mono">Active</span>
              </div>
              <p className="text-xs text-slate-400">
                Applies psychological leverage weighting $L(s)$, momentum tensor $M_t$, and chaotic-to-peaceful dampening.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={applyGeterPrinciple}
              onChange={(e) => setApplyGeterPrinciple(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Output Results Dashboard */}
      {simResults && (
        <div className="space-y-6">
          {/* Main Moneyline & Set 1 Probabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 1 Moneyline Result */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg relative overflow-hidden space-y-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">{p1.name}</span>
                <span className="text-xs font-mono bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/40">
                  Fair Odds: {simResults.p1FairDecimalOdds.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-slate-100 font-mono">
                  {(simResults.p1WinProb * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-medium">Match Win Probability</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${simResults.p1WinProb * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>First Set Win Probability:</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {(simResults.p1Set1Prob * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Player 2 Moneyline Result */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/30 shadow-lg relative overflow-hidden space-y-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">{p2.name}</span>
                <span className="text-xs font-mono bg-sky-950/60 text-sky-300 px-2 py-0.5 rounded border border-sky-800/40">
                  Fair Odds: {simResults.p2FairDecimalOdds.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-slate-100 font-mono">
                  {(simResults.p2WinProb * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-medium">Match Win Probability</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${simResults.p2WinProb * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>First Set Win Probability:</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {(simResults.p2Set1Prob * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Set Betting Breakdown & Over/Under Total Games */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Set Betting Grid */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Exact Set Score Betting Distribution (50,000 Iterations)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(simResults.setBetting).map(([score, prob]) => (
                  <div key={score} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                    <span className="text-xs font-mono text-slate-400 font-bold">{score} Sets</span>
                    <span className="text-lg font-bold text-slate-100 font-mono">
                      {((prob as number) * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Odds: {((prob as number) > 0 ? (1 / (prob as number)).toFixed(2) : '99.0')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span className="text-slate-400">Tiebreak Likelihood:</span>
                  <span className="font-mono text-slate-200 font-bold">{(simResults.tiebreakProbability * 100).toFixed(1)}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span className="text-slate-400">Deciding Set:</span>
                  <span className="font-mono text-slate-200 font-bold">{(simResults.decidingSetProbability * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Over/Under Total Games Lines */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Over / Under Total Games (CDF)
                </h3>
                <span className="text-xs font-mono text-emerald-400">
                  Mean: {simResults.meanGames} | Median: {simResults.medianGames}
                </span>
              </div>
              <div className="space-y-2">
                {simResults.overUnderLines.map((ou) => (
                  <div key={ou.line} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-200 w-16">
                      Line {ou.line}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-semibold">Over {(ou.overProb * 100).toFixed(1)}%</span>
                        <span className="text-[10px] text-slate-500 block">Odds {ou.overDecimalOdds}</span>
                      </div>
                      <span className="text-slate-600">|</span>
                      <div className="text-left">
                        <span className="text-sky-400 font-mono font-semibold">Under {(ou.underProb * 100).toFixed(1)}%</span>
                        <span className="text-[10px] text-slate-500 block">Odds {ou.underDecimalOdds}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expected Value (+EV) & Kelly Staking Calculator */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Sportsbook Line Shopping & Kelly Criterion Staking Edge
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Formula: Quarter Kelly f* = 0.25 × (bp - q) / b
              </span>
            </div>

            {/* Input Sportsbook Odds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Pinnacle / Bookmaker Odds for {p1.name}:</span>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="50"
                  value={sportsbookOddsP1}
                  onChange={(e) => setSportsbookOddsP1(parseFloat(e.target.value) || 1.01)}
                  className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm text-right focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Pinnacle / Bookmaker Odds for {p2.name}:</span>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="50"
                  value={sportsbookOddsP2}
                  onChange={(e) => setSportsbookOddsP2(parseFloat(e.target.value) || 1.01)}
                  className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm text-right focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Value Edge Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {valueBetP1 && (
                <div className={`p-4 rounded-xl border ${valueBetP1.edgePct > 0 ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{p1.name} Value Analysis</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${valueBetP1.edgePct > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {valueBetP1.edgePct > 0 ? `+${valueBetP1.edgePct}% Edge (+EV)` : 'No Value (-EV)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-slate-900">
                      <span className="text-slate-500 block text-[10px]">Expected Value</span>
                      <span className={`font-mono font-bold ${valueBetP1.expectedValue > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {valueBetP1.expectedValue > 0 ? `+${valueBetP1.expectedValue}%` : `${valueBetP1.expectedValue}%`}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900">
                      <span className="text-slate-500 block text-[10px]">Quarter Kelly</span>
                      <span className="font-mono font-bold text-slate-200">{valueBetP1.quarterKellyPct}%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900">
                      <span className="text-slate-500 block text-[10px]">Recommended</span>
                      <span className="font-mono font-bold text-amber-400">{valueBetP1.recommendedUnits} Units</span>
                    </div>
                  </div>
                </div>
              )}

              {valueBetP2 && (
                <div className={`p-4 rounded-xl border ${valueBetP2.edgePct > 0 ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{p2.name} Value Analysis</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${valueBetP2.edgePct > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {valueBetP2.edgePct > 0 ? `+${valueBetP2.edgePct}% Edge (+EV)` : 'No Value (-EV)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-slate-900">
                      <span className="text-slate-500 block text-[10px]">Expected Value</span>
                      <span className={`font-mono font-bold ${valueBetP2.expectedValue > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {valueBetP2.expectedValue > 0 ? `+${valueBetP2.expectedValue}%` : `${valueBetP2.expectedValue}%`}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900">
                      <span className="text-slate-500 block text-[10px]">Quarter Kelly</span>
                      <span className="font-mono font-bold text-slate-200">{valueBetP2.quarterKellyPct}%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900">
                      <span className="text-slate-500 block text-[10px]">Recommended</span>
                      <span className="font-mono font-bold text-amber-400">{valueBetP2.recommendedUnits} Units</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
