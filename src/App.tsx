import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { FanDuelLiveRadarView } from './components/FanDuelLiveRadarView';
import { TwoTrackEngineView } from './components/TwoTrackEngineView';
import { BlueprintView } from './components/BlueprintView';
import { MonteCarloSimulator } from './components/MonteCarloSimulator';
import { SqliteArchitectureView } from './components/SqliteArchitectureView';
import { LearningEngineView } from './components/LearningEngineView';
import { BacktestView } from './components/BacktestView';
import { CodeRepositoryView } from './components/CodeRepositoryView';
import { Radio, ShieldCheck, Cpu, Server, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('twotrack');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Sticky Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'twotrack' && <TwoTrackEngineView onSwitchTab={setActiveTab} />}
        {activeTab === 'fanduel' && <FanDuelLiveRadarView onSwitchTab={setActiveTab} />}
        {activeTab === 'blueprint' && <BlueprintView />}
        {activeTab === 'simulator' && <MonteCarloSimulator />}
        {activeTab === 'database' && <SqliteArchitectureView />}
        {activeTab === 'learning' && <LearningEngineView />}
        {activeTab === 'backtest' && <BacktestView />}
        {activeTab === 'code' && <CodeRepositoryView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 px-4 sm:px-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Tennis Predictive Engine • 24/7 FanDuel Watchdog</span>
            <span className="text-slate-500">•</span>
            <span>ATP & WTA Tournaments</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-sky-400" />
              GitHub Actions Cloud
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-red-400" />
              FanDuel Real-Time Feeds
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              50k Monte Carlo
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-400" />
              SQLite WAL Mode
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
