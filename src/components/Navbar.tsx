import React from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  BrainCircuit, 
  TrendingUp, 
  Code2, 
  Download, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { generateRepositoryZip, downloadBlob } from '../services/zipExport';

export type ActiveTab = 'blueprint' | 'simulator' | 'database' | 'learning' | 'backtest' | 'code';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zipBlob = await generateRepositoryZip();
      downloadBlob(zipBlob, 'tennis-predictive-engine-trebedit.zip');
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'blueprint', label: 'Technical Blueprint (9 Pillars)', icon: Activity },
    { id: 'simulator', label: 'Monte Carlo Engine (50k)', icon: Cpu },
    { id: 'database', label: 'SQLite & WAL Concurrency', icon: Database },
    { id: 'learning', label: 'Micro-Evolution & Shrinkage', icon: BrainCircuit },
    { id: 'backtest', label: 'Backtesting & EV Edge', icon: TrendingUp },
    { id: 'code', label: 'TrebEdit & Scripts Hub', icon: Code2 },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      {/* Top micro-bar */}
      <div className="bg-slate-950/60 border-b border-slate-800/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SQLite WAL Mode Active (5000ms Timeout)
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            The Geter Principle: Multi-Regime Stabilization
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            24/7 GitHub Actions CI/CD (Cron: 0 */3 * * *)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
            <Smartphone className="w-3 h-3 text-amber-400" />
            TrebEdit / Galaxy S26 Ultra Ready
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-lg tracking-wider">
            🎾
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              Tennis Predictive Engine
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-mono">
                ATP & WTA v3.8
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              50,000-Iteration Point-by-Point Monte Carlo • The Geter Principle • SQLite WAL Mode
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            id="download-repo-zip-btn"
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Packaging Repository...' : 'Export TrebEdit Project (.ZIP)'}
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
            </button>
          );
        })}
      </div>
    </header>
  );
};
