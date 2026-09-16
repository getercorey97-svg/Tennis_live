import React, { useState } from 'react';
import { BLUEPRINT_PILLARS, BlueprintPillar } from '../data/blueprintData';
import { Check, Copy, BookOpen, Layers, Zap } from 'lucide-react';

export const BlueprintView: React.FC = () => {
  const [selectedPillarId, setSelectedPillarId] = useState<string>('pillar-3');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedPillar = BLUEPRINT_PILLARS.find(p => p.id === selectedPillarId) || BLUEPRINT_PILLARS[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              Automated Statistical Model Blueprint • ATP & WTA
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Technical & Mathematical Research Deep-Dive
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Exhaustive engineering specification designed for a low-margin-of-error predictive engine.
              Features point-by-point Markov dynamics, <strong>The Geter Principle</strong> state stabilization,
              WAL-mode concurrency, zero data leakage, and GitHub Actions 24/7 orchestration manageable from TrebEdit.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SIMULATION</span>
              <span className="text-emerald-400 font-bold text-sm">50,000 Pts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DATABASE</span>
              <span className="text-sky-400 font-bold text-sm">SQLite WAL</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px]">RUNTIME</span>
              <span className="text-amber-400 font-bold text-sm">Zero C-Ext</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pillar Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BLUEPRINT_PILLARS.map((p) => {
          const isSelected = p.id === selectedPillarId;
          return (
            <button
              key={p.id}
              id={`pillar-card-${p.number}`}
              onClick={() => setSelectedPillarId(p.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    Pillar 0{p.number}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 line-clamp-1">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {p.shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Detailed View */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                PILLAR 0{selectedPillar.number}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400 font-mono">{selectedPillar.badge}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mt-1">
              {selectedPillar.title}
            </h3>
          </div>
        </div>

        {/* Key Formulas Section */}
        {selectedPillar.keyFormulas && selectedPillar.keyFormulas.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Mathematical Formulas & Physical Derivations
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {selectedPillar.keyFormulas.map((kf, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">{kf.name}</span>
                    <button
                      onClick={() => handleCopy(kf.formula, `formula-${idx}`)}
                      className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `formula-${idx}` ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]"><Check className="w-3 h-3" /> Copied</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px]"><Copy className="w-3 h-3" /> Copy</span>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
                    <code>{kf.formula}</code>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {kf.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            Engineering Specifications & Edge Considerations
          </h4>
          <ul className="space-y-2">
            {selectedPillar.technicalDetails.map((td, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{td}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SQLite Queries if present */}
        {selectedPillar.sqliteQueries && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Exact SQLite DDL & Transaction Queries
            </h4>
            <div className="space-y-3">
              {selectedPillar.sqliteQueries.map((q, idx) => (
                <div key={idx} className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{q.purpose}</span>
                    <button
                      onClick={() => handleCopy(q.query, `sql-${idx}`)}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `sql-${idx}` ? (
                        <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                      ) : (
                        <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy SQL</span>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto">
                    <code>{q.query}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippets if present */}
        {selectedPillar.codeSnippets && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Implementation Scripts
            </h4>
            {selectedPillar.codeSnippets.map((cs, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400">{cs.filename}</span>
                  <button
                    onClick={() => handleCopy(cs.code, `code-${idx}`)}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === `code-${idx}` ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Code</span>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-72">
                  <code>{cs.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
