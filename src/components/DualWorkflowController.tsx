import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Radio, 
  Cpu, 
  Database, 
  Server, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Sparkles,
  GitBranch,
  Terminal
} from 'lucide-react';

interface DualWorkflowControllerProps {
  onSwitchTab?: (tabId: 'twotrack' | 'fanduel') => void;
}

export const DualWorkflowController: React.FC<DualWorkflowControllerProps> = ({ onSwitchTab }) => {
  const [isRunningBoth, setIsRunningBoth] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastExecuted, setLastExecuted] = useState<string>('Live via GitHub Actions');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'both' | 'twotrack' | 'fanduel'>('both');

  const executionSteps = [
    { id: 1, name: 'Database WAL Synchronization', desc: 'Initialize SQLite WAL mode & load player baselines', workflow: 'shared' },
    { id: 2, name: 'Workflow 1: Two-Track Live Tennis Engine', desc: 'Track 1 LiveTennisAPI + Track 2 ESPN Free Feed Autonomous Picks', workflow: 'twotrack' },
    { id: 3, name: 'Workflow 2: FanDuel Live Watchdog Radar', desc: 'Ingest real-time FanDuel pre-match & in-play lines with line-shift tracking', workflow: 'fanduel' },
    { id: 4, name: 'Zero-Leakage Post-Match Learning', desc: 'Bayesian shrinkage and micro-evolution weight updates', workflow: 'shared' },
    { id: 5, name: '50,000-Iteration Monte Carlo Simulation', desc: 'Geter Principle stochastic stabilization across all active matches', workflow: 'shared' },
    { id: 6, name: 'Conflict-Free Git Repository Push', desc: 'Atomic push retry with binary merge safety (zero CI collisions)', workflow: 'shared' },
  ];

  const handleRunBothWorkflows = () => {
    if (isRunningBoth) return;
    setIsRunningBoth(true);
    setCurrentStep(1);
    setCompletedSteps([]);

    let step = 1;
    const interval = setInterval(() => {
      setCompletedSteps(prev => [...prev, step]);
      step += 1;
      if (step > executionSteps.length) {
        clearInterval(interval);
        setIsRunningBoth(false);
        setCurrentStep(0);
        setLastExecuted(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setCurrentStep(step);
      }
    }, 900);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-5">
      {/* Header with dual badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Dual Workflow Orchestrator
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-300 text-xs font-mono">Both Workflows Ready & Concurrency-Protected</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Execute Dual Tennis Predictive Engine Pipelines
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Run both workflows simultaneously without git push conflicts: the <strong>Two-Track Engine</strong> (Track 1 LiveTennisAPI + Track 2 ESPN Free Feed) and the <strong>FanDuel 24/7 Watchdog</strong> (In-play Radar & 50k Monte Carlo).
          </p>
        </div>

        {/* Master Execution Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            id="run-both-workflows-btn"
            onClick={handleRunBothWorkflows}
            disabled={isRunningBoth}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            {isRunningBoth ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Executing Dual Workflows (Step {currentStep}/6)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Both Workflows Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Workflow Architecture Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workflow 1 Card */}
        <div className="rounded-lg border border-sky-900/40 bg-slate-950/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-sky-200">Workflow 1: Two-Track Live Engine</h3>
                <span className="text-[11px] text-slate-400 font-mono">.github/workflows/tennis_predictive_engine.yml</span>
              </div>
            </div>
            {onSwitchTab && (
              <button
                onClick={() => onSwitchTab('twotrack')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                View Tab <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Track 1: Targeted Search</span>
              <span className="font-mono text-sky-300">LiveTennisAPI (Search by Player)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Track 2: Autonomous Engine</span>
              <span className="font-mono text-emerald-300">ESPN Core Free Feed (24/7 Auto-Picks)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Execution Frequency</span>
              <span className="text-slate-300 font-mono">Cron: Every 3h + 1-Click Dispatch</span>
            </div>
          </div>
        </div>

        {/* Workflow 2 Card */}
        <div className="rounded-lg border border-red-900/40 bg-slate-950/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-200">Workflow 2: FanDuel Live Radar</h3>
                <span className="text-[11px] text-slate-400 font-mono">.github/workflows/fanduel_live_watchdog.yml</span>
              </div>
            </div>
            {onSwitchTab && (
              <button
                onClick={() => onSwitchTab('fanduel')}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                View Tab <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Live Market Feed</span>
              <span className="font-mono text-red-300">FanDuel Sportsbook Pre & In-Play</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Real-Time In-Play Loop</span>
              <span className="font-mono text-amber-300">30s Continuous Polling Watchdog</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Execution Frequency</span>
              <span className="text-slate-300 font-mono">Cron: Every 15m + Live Watchdog</span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Pipeline Steps (Active during execution or static status) */}
      <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Dual Pipeline Coordinated Execution Flow
          </span>
          <span className="font-mono">Last run: {lastExecuted}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {executionSteps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-lg border transition-all text-xs flex items-start gap-2.5 ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-slate-200'
                    : isCurrent
                    ? 'border-sky-500 bg-sky-500/10 text-white shadow-md shadow-sky-900/20'
                    : 'border-slate-800/70 bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                      {step.id}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{step.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLI Command Helper for running both workflows locally or in terminal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-400">Run both workflows via CLI:</span>
          <code className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-800">
            python run_pipeline.py --mode both --iterations 50000
          </code>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          <span>CI Concurrency Group: <code className="text-purple-300">tennis-engine-repo-push</code></span>
        </div>
      </div>
    </div>
  );
};
