import React, { useState } from 'react';
import { REPOSITORY_FILES, RepoFile } from '../data/repositoryFiles';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Cpu, 
  BrainCircuit, 
  Radio, 
  Activity,
  Layers
} from 'lucide-react';

export const CodeRepositoryView: React.FC = () => {
  // Filter out any raw workflow files so the user only sees algorithms, models, and engine logic
  const algorithmicFiles = REPOSITORY_FILES.filter(f => !f.path.includes('.github'));
  const [selectedFilePath, setSelectedFilePath] = useState<string>('scripts/monte_carlo.py');
  const [copied, setCopied] = useState<boolean>(false);

  const currentFile = algorithmicFiles.find(f => f.path === selectedFilePath) || algorithmicFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mathematical Engine Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-800/40 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              Autonomous Mathematical Engine • Core Algorithmic Library
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Predictive Models &amp; Quantitative Engine Source
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Transparent, open algorithmic implementation: inspect the mathematical foundations powering point-by-point Monte Carlo Markov simulations, empirical Bayesian serve-return updates, and real-time sportsbook line comparisons.
            </p>
          </div>
        </div>

        {/* Engine Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Cpu className="w-3.5 h-3.5" />
              Pillar 1: 50,000 Monte Carlo
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stochastic point-by-point Markov chains simulating service holds, break points, set tiebreaks, and match outcomes with zero lookahead bias.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <Radio className="w-3.5 h-3.5" />
              Pillar 2: Real-Time Odds Consensus
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dynamically strips sportsbook vig using multi-book consensus to identify mispriced player probabilities with positive expected value (+EV).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <BrainCircuit className="w-3.5 h-3.5" />
              Pillar 3: Adaptive Bayesian Learning
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Post-match outcomes trigger posterior variance shrinkage and surface Elo calibration to continually improve forecasting accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* File Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File Tree Directory */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
              Algorithm Source Files
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {algorithmicFiles.length} files
            </span>
          </div>

          <div className="space-y-1">
            {algorithmicFiles.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-500 uppercase">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
          {/* File Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs text-emerald-400 font-bold">{currentFile.path}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{currentFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Text Body */}
          <pre className="p-4 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto leading-relaxed max-h-[620px] scrollbar-thin">
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
