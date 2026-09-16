import React, { useState } from 'react';
import { REPOSITORY_FILES, RepoFile } from '../data/repositoryFiles';
import { generateRepositoryZip, downloadBlob } from '../services/zipExport';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  Terminal, 
  GitBranch, 
  ExternalLink,
  Info
} from 'lucide-react';

export const CodeRepositoryView: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('scripts/monte_carlo.py');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const currentFile = REPOSITORY_FILES.find(f => f.path === selectedFilePath) || REPOSITORY_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateRepositoryZip();
      downloadBlob(blob, 'tennis-predictive-engine-trebedit.zip');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile TrebEdit & Galaxy S26 Ultra Optimization Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-800/40 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              Tailored for Samsung Galaxy S26 Ultra & TrebEdit Editor
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Zero-Bloat Mobile Architecture & Production Scripts
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Every script in this repository is built to run on pure Python standard library (<code className="text-emerald-400">math</code>, <code className="text-emerald-400">random</code>, <code className="text-emerald-400">sqlite3</code>, <code className="text-emerald-400">urllib</code>) with zero compilation requirements.
              You can comfortably edit code in <strong>TrebEdit</strong>, run scripts in <strong>Termux</strong>, or commit directly from your smartphone while GitHub Actions executes the 50,000-iteration Monte Carlo in the cloud.
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-900/40 cursor-pointer disabled:opacity-50 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating ZIP...' : 'Download Full Repo ZIP'}
          </button>
        </div>

        {/* Mobile Setup Step-by-Step Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Terminal className="w-3.5 h-3.5" />
              Step 1: TrebEdit Setup
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Extract the ZIP to your phone storage. In TrebEdit, tap <em>Menu &gt; Open Project</em> and pick the folder.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <GitBranch className="w-3.5 h-3.5" />
              Step 2: Git Synchronization
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Push to GitHub using Termux (<code className="text-slate-300">git push origin main</code>) or GitHub Mobile web.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Smartphone className="w-3.5 h-3.5" />
              Step 3: 24/7 Automation
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              GitHub Actions automatically polls, runs 50k simulations, and commits fresh markdown reports every 3 hours.
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
              Repository File Tree
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {REPOSITORY_FILES.length} files
            </span>
          </div>

          <div className="space-y-1">
            {REPOSITORY_FILES.map((file) => {
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
