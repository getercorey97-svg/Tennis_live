import React, { useState } from 'react';
import { BrainCircuit, Sliders, TrendingUp, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { TOUR_AVERAGES } from '../data/seedPlayers';

export const LearningEngineView: React.FC = () => {
  // EWMA Micro-Evolution state
  const [initialBaseline, setInitialBaseline] = useState<number>(0.72); // 72% 1st serve win
  const [actualOutcome, setActualOutcome] = useState<number>(0.82); // 82% in today's match
  const [alphaLearningRate, setAlphaLearningRate] = useState<number>(0.05); // 0.05 default

  // Bayesian Shrinkage state
  const [sampleSizeN, setSampleSizeN] = useState<number>(3); // 3 matches sampled
  const [rawEmpiricalStat, setRawEmpiricalStat] = useState<number>(0.79); // 79% observed
  const [tourPriorStat] = useState<number>(TOUR_AVERAGES.ATP.firstServeWinPct); // 0.725
  const [shrinkageThresholdN0, setShrinkageThresholdN0] = useState<number>(10.0);

  // EWMA calculations
  const rawError = actualOutcome - initialBaseline;
  const clippedError = Math.max(-0.04, Math.min(0.04, rawError)); // Gradient clipping
  const ewmaUpdatedBaseline = initialBaseline + (alphaLearningRate * clippedError);

  // Bayesian shrinkage calculation: w = min(1.0, N / N0)
  const shrinkageWeightW = Math.min(1.0, sampleSizeN / shrinkageThresholdN0);
  const shrunkBaseline = (shrinkageWeightW * rawEmpiricalStat) + ((1.0 - shrinkageWeightW) * tourPriorStat);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
              Pillar 04 • Continuous Micro-Evolution
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              EWMA Micro-Evolution & Empirical Bayes Shrinkage
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Static yearly averages fail in tennis because form fluctuates across tournaments, conditions, and confidence swings.
          Our engine executes a strict post-match learning loop that updates ratings proportionally to forecast error using <strong>Exponentially Weighted Moving Averages (EWMA)</strong>,
          while applying <strong>Empirical Bayes Shrinkage</strong> to regularize players with sparse sample sizes.
        </p>
      </div>

      {/* Interactive Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: EWMA Micro-Evolution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              EWMA Error Residual Update
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              Formula: θ(t+1) = θ(t) + α × Error
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Model Baseline Prior ($\theta_t$):</span>
                <span className="font-mono text-emerald-400 font-bold">{(initialBaseline * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.55"
                max="0.85"
                step="0.01"
                value={initialBaseline}
                onChange={(e) => setInitialBaseline(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Actual Match Performance:</span>
                <span className="font-mono text-sky-400 font-bold">{(actualOutcome * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={actualOutcome}
                onChange={(e) => setActualOutcome(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Learning Rate Alpha ($\alpha$):</span>
                <span className="font-mono text-amber-400 font-bold">{alphaLearningRate.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.12"
                step="0.005"
                value={alphaLearningRate}
                onChange={(e) => setAlphaLearningRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Error and Update Output */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Forecast Residual Error:</span>
                <span className={rawError >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {rawError >= 0 ? `+${(rawError * 100).toFixed(2)}%` : `${(rawError * 100).toFixed(2)}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clipped Gradient Step:</span>
                <span className="text-slate-300">{(clippedError * 100).toFixed(2)}% (Max ±4.0%)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-200 font-bold">Evolved Baseline θ(t+1):</span>
                <span className="text-emerald-400 font-bold text-sm">{(ewmaUpdatedBaseline * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Empirical Bayes Shrinkage */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Empirical Bayes Small-Sample Shrinkage
            </h3>
            <span className="text-xs font-mono text-purple-400">
              Formula: w = min(1.0, N / N0)
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Sample Size (Matches Sampled $N$):</span>
                <span className="font-mono text-purple-400 font-bold">{sampleSizeN} matches</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={sampleSizeN}
                onChange={(e) => setSampleSizeN(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                {sampleSizeN < 5 ? 'High Regularization: Challenger/Qualifier debut' : sampleSizeN < 10 ? 'Partial Shrinkage' : 'Full Confidence (w = 1.0)'}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Raw Observed Stat (x̄_i):</span>
                <span className="font-mono text-emerald-400 font-bold">{(rawEmpiricalStat * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.55"
                max="0.88"
                step="0.01"
                value={rawEmpiricalStat}
                onChange={(e) => setRawEmpiricalStat(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
              <span className="text-slate-400">ATP Tour Baseline Prior (μ_tour):</span>
              <span className="font-mono text-slate-200 font-bold">{(tourPriorStat * 100).toFixed(1)}%</span>
            </div>

            {/* Shrinkage Result */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Shrinkage Weight (w_i):</span>
                <span className="text-purple-400 font-bold">{shrinkageWeightW.toFixed(2)} ({((1 - shrinkageWeightW) * 100).toFixed(0)}% pulled to tour)</span>
              </div>

              {/* Visual Weight split */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                <div style={{ width: `${shrinkageWeightW * 100}%` }} className="bg-purple-500 h-full"></div>
                <div style={{ width: `${(1 - shrinkageWeightW) * 100}%` }} className="bg-slate-700 h-full"></div>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-200 font-bold">Regularized Baseline (θ_shrunk):</span>
                <span className="text-purple-400 font-bold text-sm">{(shrunkBaseline * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
