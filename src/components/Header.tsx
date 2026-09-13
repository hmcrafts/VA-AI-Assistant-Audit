import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, RefreshCw, Printer, Search, Sparkles, DollarSign, Globe, Share2, CheckCircle2, Info, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeView: 'cards' | 'table' | 'analytics' | 'billing' | 'auditor' | 'chatbot';
  onViewChange: (view: 'cards' | 'table' | 'analytics' | 'billing' | 'auditor' | 'chatbot') => void;
  onOpenAiAdvisor: () => void;
  onOpenExport: () => void;
  isRefreshing?: boolean;
  onRefreshAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  onOpenAiAdvisor,
  onOpenExport,
  isRefreshing,
  onRefreshAll,
}) => {
  const [showStatusBanner, setShowStatusBanner] = useState(true);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs no-print">
      {/* Government Audit Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="inline-block w-4 h-2.5 bg-red-600 relative overflow-hidden rounded-xs border border-white/40">
              <span className="absolute top-0 left-0 w-2 h-1.5 bg-blue-900"></span>
            </span>
            <span>U.S. Department of Veterans Affairs • AI Services Audit & Telemetry Fleet</span>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
              <Globe className="w-3 h-3 text-emerald-400" />
              Public Access Enabled
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry Active
            </span>
            <span>•</span>
            <span>Section 508 Standards</span>
          </div>
        </div>
      </div>

      {/* Public Access Status Banner */}
      {showStatusBanner && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-950 text-xs px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold mr-1.5">Public Accessibility Status:</span>
                <span>
                  <strong>VA Services Monitor</strong> has public access and search crawler discovery enabled (<code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-900 text-[11px] border border-emerald-300">robots: index, follow</code>, <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-900 text-[11px] border border-emerald-300">robots.txt: Allow: /</code>). To make this application accessible to the public without requiring Google AI Studio login credentials, click the <strong>Share</strong> button in the top right menu of AI Studio.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowStatusBanner(false)}
              className="text-emerald-800 hover:text-emerald-950 p-1 rounded hover:bg-emerald-100/80 transition-colors shrink-0"
              title="Dismiss notice"
              aria-label="Dismiss status notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shadow-sm tracking-tighter shrink-0 border border-blue-800">
              VA
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  VA Services Monitor
                </h1>
                <span className="text-slate-300 font-light text-lg hidden sm:inline">|</span>
                <span className="text-sm sm:text-base font-semibold text-slate-600 hidden md:inline">
                  AI Assistant Web Audits & Analytics
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-600" />
                  Public Access Enabled
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                Target Ecosystem:{' '}
                <a
                  href="https://veterans-and-va-staff-ai-assistant-library-250030834831.us-west1.run.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 font-medium hover:underline inline-flex items-center gap-1"
                >
                  VA AI Assistant Library Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {' '}& 9 Specialized Cloud Run Applications
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => onViewChange('chatbot')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg border transition-colors focus:ring-2 focus:ring-indigo-600 focus:outline-none ${
                activeView === 'chatbot'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              title="Open Gemini Chatbot"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gemini Chatbot</span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-2xs"
              title="Open Printable Audit Report & PDF Generator"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={onRefreshAll}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs disabled:opacity-75"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Auditing...' : 'Run Audit'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium overflow-x-auto">
            <button
              onClick={() => onViewChange('cards')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeView === 'cards'
                  ? 'bg-white text-blue-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Domain Reviews (10)
            </button>
            <button
              onClick={() => onViewChange('table')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeView === 'table'
                  ? 'bg-white text-blue-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comparative Matrix
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeView === 'analytics'
                  ? 'bg-white text-blue-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google Analytics Hub
            </button>
            <button
              onClick={() => onViewChange('billing')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 flex items-center gap-1.5 ${
                activeView === 'billing'
                  ? 'bg-white text-blue-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-blue-700" />
              <span>Cloud Billing & Costs (Est.)</span>
            </button>
            <button
              onClick={() => onViewChange('auditor')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeView === 'auditor'
                  ? 'bg-white text-blue-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live URL Inspector
            </button>
            <button
              onClick={() => onViewChange('chatbot')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 flex items-center gap-1.5 ${
                activeView === 'chatbot'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-indigo-700 hover:text-indigo-900 font-semibold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Chatbot</span>
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by domain, audience, feature, or GA tag..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
