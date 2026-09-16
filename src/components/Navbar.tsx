import React from 'react';
import { 
  Radio, 
  Activity, 
  Cpu, 
  Database, 
  BrainCircuit, 
  TrendingUp, 
  Layers,
  Zap,
  Search,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'twotrack' | 'fanduel' | 'learning' | 'simulator' | 'backtest' | 'database' | 'blueprint';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'twotrack', label: 'Live & Upcoming Matches', icon: Layers, badge: 'LIVE' },
    { id: 'fanduel', label: 'FanDuel Live Radar', icon: Radio, badge: '+EV' },
    { id: 'learning', label: 'Self-Learning Engine', icon: BrainCircuit, badge: 'ADAPTIVE' },
    { id: 'simulator', label: 'Monte Carlo Predictor', icon: Cpu },
    { id: 'backtest', label: 'Historical Edge & Accuracy', icon: TrendingUp },
    { id: 'database', label: 'Player Index & Baselines', icon: Database },
    { id: 'blueprint', label: 'Predictive Methodology', icon: Activity },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      {/* Top micro-bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Autonomous Predictive Engine
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="flex items-center gap-1 text-sky-300">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            Real-Time Odds Sync
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:flex items-center gap-1 text-red-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
            FanDuel Market Feeds Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[11px] font-medium border border-purple-500/30">
            <BrainCircuit className="w-3 h-3 text-purple-400" />
            Post-Match Learning Active
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-lg tracking-wider">
            🎾
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              Tennis Predictive Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-mono font-semibold">
                Live Hub
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Live &amp; Upcoming Matches (&lt;24h) • 50,000 Monte Carlo Simulations • Self-Learning Evolution
            </p>
          </div>
        </div>

        {/* Status / Quick Action Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('twotrack')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Live &amp; &lt;24h Matches</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto scrollbar-none gap-1 border-t border-slate-800/80 pt-1 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              {item.label}
              {item.badge && (
                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full border ${
                  item.badge === 'LIVE' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                    : item.badge === '+EV'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
