import React, { useState } from 'react';
import { WebsiteAuditData } from '../types';
import {
  Globe,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  EyeOff,
  Lock,
} from 'lucide-react';

interface LiveAuditorProps {
  websites: WebsiteAuditData[];
  onSelectSite: (site: WebsiteAuditData) => void;
}

export const LiveAuditor: React.FC<LiveAuditorProps> = ({ websites, onSelectSite }) => {
  const [targetUrl, setTargetUrl] = useState('https://veterans-and-va-staff-ai-assistant-library-250030834831.us-west1.run.app/');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  const runAudit = async (urlToTest: string) => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const response = await fetch('/api/audit-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      setAuditError(err.message || 'Audit failed. Check that the URL is accessible.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUrl.trim()) {
      runAudit(targetUrl.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Trigger Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-blue-700" />
              Live Server-Side Crawler
            </span>
            <span className="text-xs text-slate-500">Gemini 3.8 Flash Powered</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Real-Time VA Domain Accessibility & GA4 Inspector
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Audit any VA Cloud Run endpoint or external URL in real time. The server fetches the DOM, parses Section 508 markers, extracts Google Analytics tags, and triggers Gemini AI evaluation.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://va-...us-west1.run.app"
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isAuditing}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-75 shrink-0 shadow-xs focus:ring-2 focus:ring-blue-600"
          >
            <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Crawling & Auditing...' : 'Run Live Audit'}</span>
          </button>
        </form>

        {/* Quick select pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium mr-1">Quick Select:</span>
          <button
            onClick={() => {
              const selfUrl = window.location.origin;
              setTargetUrl(selfUrl);
              runAudit(selfUrl);
            }}
            className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            title="Inspect VA Services Monitor public configuration"
          >
            <Globe className="w-3 h-3 text-emerald-800" />
            <span>VA Services Monitor (Self Inspect)</span>
          </button>
          {websites.slice(0, 5).map((w) => (
            <button
              key={w.id}
              onClick={() => {
                setTargetUrl(w.url);
                runAudit(w.url);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors truncate max-w-[200px]"
            >
              {w.title}
            </button>
          ))}
        </div>
      </div>

      {auditError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{auditError}</span>
        </div>
      )}

      {/* Results Display */}
      {auditResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Page Title
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{auditResult.title}</h3>
                <a
                  href={auditResult.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-blue-700 hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  {auditResult.targetUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  HTTP {auditResult.statusCode} OK
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono">
                  {auditResult.responseTimeMs} ms
                </span>
              </div>
            </div>

            {/* Prototype Alert if non-indexed */}
            {auditResult.automatedChecks?.isNonIndexedPrototype && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>
                    <strong>Private / Non-Indexed Prototype Detected:</strong> Public search indexing is blocked (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900 border border-amber-200">{auditResult.automatedChecks.robotsDirective}</code>). Treated as an unindexed prototype until Section 508 and telemetry verification completes.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono text-[11px] font-bold shrink-0">
                  NOINDEX
                </span>
              </div>
            )}

            {/* DOM Checklist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block">HTML Lang Tag</span>
                <div className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                  {auditResult.automatedChecks?.hasLang ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono">{auditResult.automatedChecks.detectedLang}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Missing</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block">Responsive Viewport</span>
                <div className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                  {auditResult.automatedChecks?.hasMetaViewport ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Present</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Missing</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block">ARIA / Role Elements</span>
                <div className="font-bold text-slate-900 mt-1">
                  {auditResult.automatedChecks?.ariaCount || 0} ARIA / {auditResult.automatedChecks?.roleCount || 0} Roles
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block">Google Analytics</span>
                <div className="font-bold text-blue-700 mt-1 font-mono truncate">
                  {auditResult.automatedChecks?.googleAnalyticsTags?.length > 0
                    ? auditResult.automatedChecks.googleAnalyticsTags.join(', ')
                    : 'None detected'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block">Search Indexing</span>
                <div className="font-bold mt-1 flex items-center gap-1 text-[11px] truncate">
                  {auditResult.automatedChecks?.isNonIndexedPrototype ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="text-amber-800 font-mono">Blocked (noindex)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-800">Indexable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gemini AI Detailed Section 508 Review */}
          {auditResult.aiEvaluation && (
            <div className="bg-white border border-indigo-200 rounded-xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-indigo-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Gemini 3.8 Flash Section 508 & WCAG Evaluation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated compliance rating and federal digital accessibility report.
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-indigo-950">
                    {auditResult.aiEvaluation.accessibilityScore}/100
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100">
                {auditResult.aiEvaluation.executiveSummary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Key Identified Strengths
                  </h4>
                  <ul className="space-y-1.5 text-emerald-900">
                    {auditResult.aiEvaluation.keyStrengths?.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                  <h4 className="font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Recommended Remediation Actions
                  </h4>
                  <ul className="space-y-1.5 text-amber-900">
                    {auditResult.aiEvaluation.remediationPoints?.map((rem: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Traffic Assessment */}
              {auditResult.aiEvaluation.trafficAssessment && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800">Modeled Traffic Estimate:</span>
                    <span className="text-slate-600 ml-2">
                      ~{auditResult.aiEvaluation.trafficAssessment.estimatedMonthlyUsers?.toLocaleString()} monthly users via {auditResult.aiEvaluation.trafficAssessment.dominantChannel}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold self-start sm:self-auto">
                    Confidence: {auditResult.aiEvaluation.trafficAssessment.confidenceLevel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
