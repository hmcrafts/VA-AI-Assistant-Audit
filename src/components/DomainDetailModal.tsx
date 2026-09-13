import React, { useState } from 'react';
import { WebsiteAuditData } from '../types';
import { SITES_BILLING_DATA } from '../data/billingData';
import {
  X,
  ExternalLink,
  ShieldCheck,
  BarChart2,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Users,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
  Sparkles,
  Zap,
  Copy,
  Check,
  AlertCircle,
  FileCode,
  Terminal,
  DollarSign,
  Server,
  Table as TableIcon,
  Sliders,
  Printer,
} from 'lucide-react';
import { PrintableAuditReport } from './PrintableAuditReport';

interface DomainDetailModalProps {
  site: WebsiteAuditData | null;
  onClose: () => void;
  onConsultChatbot?: (site: WebsiteAuditData) => void;
}

export const DomainDetailModal: React.FC<DomainDetailModalProps> = ({
  site,
  onClose,
  onConsultChatbot,
}) => {
  const [activeTab, setActiveTab] = useState<'accessibility' | 'features' | 'analytics' | 'billing' | 'live' | 'briefing'>('accessibility');
  const [isAuditingLive, setIsAuditingLive] = useState(false);
  const [liveAuditResult, setLiveAuditResult] = useState<any>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [showBillingTable, setShowBillingTable] = useState(true);

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  if (!site) return null;

  const siteBilling = SITES_BILLING_DATA.find((s) => s.siteId === site.id);

  const handleRunLiveAudit = async () => {
    setIsAuditingLive(true);
    setLiveError(null);
    try {
      const res = await fetch('/api/audit-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: site.url, websiteId: site.id }),
      });
      if (!res.ok) {
        throw new Error(`Audit failed with status ${res.status}`);
      }
      const data = await res.json();
      setLiveAuditResult(data);
    } catch (err: any) {
      setLiveError(err.message || 'Failed to complete live audit');
    } finally {
      setIsAuditingLive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 modal-backdrop-print-reset animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden modal-print-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 modal-no-print">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                {site.audience}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-200 text-slate-800">
                {site.type}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Score {site.accessibility.overallScore}/100 • {site.accessibility.wcagLevel}
              </span>
            </div>

            <h2 id="modal-headline" className="text-xl sm:text-2xl font-bold text-slate-900">
              {site.title}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">{site.subtitle}</p>

            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="truncate">{site.url}</span>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-900 font-sans font-semibold inline-flex items-center gap-1 hover:underline ml-1"
              >
                Launch App <ExternalLink className="w-3 h-3" />
              </a>

              {onConsultChatbot && (
                <button
                  onClick={() => {
                    onConsultChatbot(site);
                    onClose();
                  }}
                  className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-sans font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Ask Gemini</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab('briefing');
                  setTimeout(() => {
                    window.print();
                  }, 150);
                }}
                className="ml-1 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-sans font-bold rounded bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
                title="Print or export single-site audit dossier to PDF"
              >
                <Printer className="w-3 h-3 text-blue-700" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 sm:px-6 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`py-3 px-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'accessibility'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Accessibility & Section 508
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Core Features & Architecture
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Google Analytics & Traffic
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'billing'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Cloud Billing & Costs (Est.)
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`py-3 px-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            Live Cloud Run Inspector
          </button>

          <button
            onClick={() => setActiveTab('briefing')}
            className={`py-3 px-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'briefing'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-blue-700" />
            <span>Printable PDF Dossier</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ACCESSIBILITY */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              {/* Scorecard Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Overall Compliance Score
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">
                    {site.accessibility.overallScore}
                    <span className="text-sm font-normal text-slate-500"> / 100</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold mt-1 inline-block">
                    Grade {site.accessibility.grade} • {site.accessibility.wcagLevel}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Section 508 Verification
                  </span>
                  <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Compliant</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Federal Rehabilitation Act Sec. 508
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Contrast Standard
                  </span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {site.accessibility.contrastRatio.ratio}
                  </div>
                  <span className="text-xs text-slate-600 mt-1 block truncate">
                    {site.accessibility.contrastRatio.level}
                  </span>
                </div>
              </div>

              {/* Specific Criteria Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Evaluation Against WCAG 2.1 Success Criteria
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
                  {site.accessibility.metrics.map((metric, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{metric.name}</span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {metric.wcagCriterion}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{metric.details}</p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {metric.status}
                        </span>
                        <span className="font-bold text-slate-700">{metric.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths and Remediation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Key Accessibility Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {site.accessibility.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Actionable Remediation Guidance
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {site.accessibility.remediationItems.map((rem, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* Architecture Badges */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Technical Architecture & Frameworks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Frontend Stack:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{site.architectureDetails.framework}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Containerized Hosting:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{site.architectureDetails.runtime}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Generative AI Engine:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{site.architectureDetails.aiEngine}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Specialized Libraries:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {site.architectureDetails.specializedLibs.map((lib, idx) => (
                        <span key={idx} className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 text-[11px]">
                          {lib}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Core Features */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Core Functional Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {site.coreFeatures.map((feat, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{feat.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-9">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Data Provenance Notice */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Data Provenance Disclosure:</span> Traffic metrics ({site.analytics.estimatedMonthlyUsers.toLocaleString()} monthly active users, sessions, and channel ratios) are modeled federal benchmark estimates. Client stream tags (GA4) are verified directly from production container source code where deployed.
                </div>
              </div>

              {/* Top Analytics KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200" title="Projected benchmark based on GSA DAP federal self-service baseline">
                  <span className="text-xs text-slate-500 font-medium block">Est. Users (Model)</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {site.analytics.estimatedMonthlyUsers.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200" title="Projected benchmark based on GSA DAP federal self-service baseline">
                  <span className="text-xs text-slate-500 font-medium block">Est. Sessions (Model)</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {site.analytics.estimatedMonthlySessions.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Avg. Session Duration</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {site.analytics.avgEngagementTime}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Bounce Rate</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {site.analytics.bounceRate}
                  </div>
                </div>
              </div>

              {/* GA4 Measurement Status Banner */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-blue-950 text-sm">Google Analytics 4 Tracking Stream</span>
                  </div>
                  <p className="text-blue-900/80 mt-0.5">
                    {site.analytics.trackingStatus} • Primary Region: {site.analytics.primaryAudienceRegion}
                  </p>
                </div>

                <div className="shrink-0">
                  {site.analytics.measurementId ? (
                    <span className="font-mono font-bold text-sm bg-white text-blue-900 px-3 py-1.5 rounded-lg border border-blue-300 shadow-2xs block text-center">
                      {site.analytics.measurementId}
                    </span>
                  ) : (
                    <span className="text-slate-600 bg-white/80 px-2.5 py-1 rounded border border-blue-200 italic">
                      Pending Tag Assignment
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Traffic Sources */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Primary Traffic Inbound Channels
                </h3>
                <div className="space-y-3">
                  {site.analytics.topSources.map((src, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-900">{src.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-500">
                            ~{src.estimatedVisits.toLocaleString()} visits/mo
                          </span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {src.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${src.percentage}%`, backgroundColor: src.color }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500">{src.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6-Month Visitor Trend & Device Mix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    6-Month Visitor Growth Trend
                  </h4>
                  <div className="flex items-end justify-between h-32 pt-4 px-2">
                    {site.analytics.monthlyTrends.map((trend, idx) => {
                      const maxVisitors = Math.max(...site.analytics.monthlyTrends.map((t) => t.visitors));
                      const heightPercent = Math.round((trend.visitors / maxVisitors) * 100);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {(trend.visitors / 1000).toFixed(0)}k
                          </span>
                          <div
                            className="w-full max-w-[28px] bg-blue-700 rounded-t-sm hover:bg-blue-800 transition-all"
                            style={{ height: `${heightPercent}%` }}
                            title={`${trend.month}: ${trend.visitors.toLocaleString()} users`}
                          ></div>
                          <span className="text-xs font-semibold text-slate-700">{trend.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Device Breakdown
                  </h4>
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Monitor className="w-3.5 h-3.5 text-blue-700" /> Desktop Workstations
                        </span>
                        <span className="font-bold text-slate-900">{site.analytics.deviceBreakdown.desktop}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-700 h-full rounded-full"
                          style={{ width: `${site.analytics.deviceBreakdown.desktop}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Smartphone className="w-3.5 h-3.5 text-indigo-700" /> Mobile Phones
                        </span>
                        <span className="font-bold text-slate-900">{site.analytics.deviceBreakdown.mobile}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-700 h-full rounded-full"
                          style={{ width: `${site.analytics.deviceBreakdown.mobile}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Tablet className="w-3.5 h-3.5 text-emerald-700" /> Tablets & Warehouse Devices
                        </span>
                        <span className="font-bold text-slate-900">{site.analytics.deviceBreakdown.tablet}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-700 h-full rounded-full"
                          style={{ width: `${site.analytics.deviceBreakdown.tablet}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Site-Specific Recommended Actions Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Recommended Action: Connect Actual Data for this Website
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${site.analytics.measurementId ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                    {site.analytics.measurementId ? 'Stream Instrumented' : 'Tag Missing'}
                  </span>
                </div>

                {site.analytics.measurementId ? (
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <p>
                      This application already contains active stream tag <strong>{site.analytics.measurementId}</strong>. To replace modeled metrics with verified actuals in this dashboard:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                      <li>Grant <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">Viewer</code> access on this GA4 property to your GCP service account.</li>
                      <li>Query the Google Analytics Data API (v1beta) using the property identifier.</li>
                      <li>Optional: Link GA4 Property to BigQuery for un-sampled streaming event audit logs.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <p>
                        This pilot micro-app currently lacks a client-side telemetry stream. Add this snippet to its root <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">index.html</code>:
                      </p>
                      <button
                        onClick={() =>
                          handleCopySnippet(
                            `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });\n</script>`,
                            'modal-gtag'
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 shrink-0"
                      >
                        {copiedSnippet === 'modal-gtag' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSnippet === 'modal-gtag' ? 'Copied' : 'Copy Tag'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
{`<!-- Google tag (gtag.js) for ${site.title} -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', { 'anonymize_ip': true });
</script>`}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CLOUD BILLING & COST ANALYTICS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {siteBilling ? (
                <>
                  {/* High-Visibility Disclaimer: Estimated Costs Only */}
                  <div
                    role="note"
                    aria-label="Estimated Cost Data Disclaimer"
                    className="p-4 rounded-xl bg-amber-50 border-l-4 border-amber-600 flex items-start gap-3 text-amber-950 shadow-2xs"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          Estimated Costs Only
                        </span>
                        <span className="text-xs font-bold text-amber-950">
                          Modeled Telemetry — Not Actual Realized Cost Data
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        All hosting and AI token expenditure figures for <strong>{site.title}</strong> are <strong>estimated costs only</strong>. Calculations are derived from observed Cloud Run vCPU and memory runtime telemetry, Gemini API prompt/completion token volumes, and standard public GCP rate cards. They do not represent actual realized invoices or accounting receipts.
                      </p>
                    </div>
                  </div>

                  {/* Target Application Notice if VA Budget Insight AI */}
                  {site.id === 'va-budget-insight-ai' && (
                    <div className="p-4 rounded-xl bg-blue-50/90 border-2 border-blue-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider">
                          Section 508 & WCAG 2.1 Compliance Mandate
                        </span>
                        <span className="text-xs font-bold text-blue-900">
                          Interactive Fiscal Budget Charts Non-Visual Data Consumption
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        As mandated by <strong>WCAG 2.1 SC 1.1.1 (Non-text Content)</strong>, all graphical charts in <em>VA Budget Insight AI</em> (including historical hosting costs, Congressional budget appropriations, and token utilization) provide equivalent, screen-reader-accessible HTML <code>&lt;table&gt;</code> elements. All graphical visual bars and slider controls maintain a minimum 3:1 contrast ratio against background elements (<strong>WCAG SC 1.4.11</strong>), and interactive data points activate on keyboard focus (<strong>WCAG SC 2.4.7</strong>). <em>All fiscal numbers reflect modeled estimated costs only.</em>
                      </p>
                    </div>
                  )}

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Est. Monthly Total
                      </span>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        ${siteBilling.totalMonthlyCost.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        FY26 Cap: ${siteBilling.fy2026BudgetCap.toFixed(2)} (est.)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Est. Cloud Run Compute
                      </span>
                      <div className="text-2xl font-black text-blue-900 font-mono">
                        ${siteBilling.monthlyHostingCost.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {siteBilling.cloudRunMetrics.cpuHours.toLocaleString()} vCPU-hrs (est.)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Est. Gemini Tokens
                      </span>
                      <div className="text-2xl font-black text-teal-900 font-mono">
                        ${siteBilling.monthlyApiCost.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {(siteBilling.tokenUsage.totalTokens / 1e6).toFixed(1)}M tokens (est.)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Est. Budget Burn
                      </span>
                      <div className="text-2xl font-black text-emerald-800 font-mono">
                        {siteBilling.burnRatePercentage}%
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden border border-slate-300">
                        <div
                          className="bg-blue-700 h-1.5 rounded-full"
                          style={{ width: `${siteBilling.burnRatePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Accessible Table of Services (WCAG 2.1 SC 1.1.1) */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs space-y-2">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <TableIcon className="w-3.5 h-3.5 text-blue-700" />
                        <span>Google Cloud Service Itemized Breakdown (SC 1.1.1 Table — Estimated Costs Only)</span>
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        Estimated Costs Only
                      </span>
                    </div>

                    <div className="overflow-x-auto p-1">
                      <table className="w-full text-left text-xs text-slate-800 border-collapse">
                        <caption className="sr-only">
                          Itemized estimated Google Cloud Platform service billing line items for {site.title}. Modeled estimates only; not actual invoices.
                        </caption>
                        <thead className="bg-slate-50 font-bold text-slate-900 border-b border-slate-200">
                          <tr>
                            <th scope="col" className="p-2.5 border-r border-slate-200">GCP Service Name</th>
                            <th scope="col" className="p-2.5 border-r border-slate-200">Description & SKU Scope</th>
                            <th scope="col" className="p-2.5 border-r border-slate-200 text-right">Est. Monthly Cost</th>
                            <th scope="col" className="p-2.5 text-right">% of Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {siteBilling.serviceBreakdown.map((svc) => (
                            <tr key={svc.serviceName} className="hover:bg-slate-50">
                              <th scope="row" className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                                {svc.serviceName}
                              </th>
                              <td className="p-2.5 text-slate-600 border-r border-slate-200">
                                {svc.unitDetails}
                              </td>
                              <td className="p-2.5 text-right font-mono font-semibold border-r border-slate-200">
                                ${svc.monthlyCost.toFixed(2)}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-700">
                                {svc.percentage}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 bg-amber-50/70 border-t border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
                      <span>* <strong>Estimated costs only.</strong> Calculated using container telemetry & public GCP rates. Not actual billing invoices.</span>
                      <span className="font-mono font-bold text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded">Not Actual Data</span>
                    </div>
                  </div>

                  {/* Token & Cloud Run Workload Telemetry Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-teal-700" />
                        <span>Gemini Foundation Model Telemetry</span>
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span>Primary Foundation Model:</span>
                          <span className="font-mono font-bold text-teal-900">{siteBilling.tokenUsage.model}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span>Prompt Input Tokens:</span>
                          <span className="font-mono">{(siteBilling.tokenUsage.inputTokens / 1e6).toFixed(2)}M ($0.15/M)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span>Completion Output Tokens:</span>
                          <span className="font-mono">{(siteBilling.tokenUsage.outputTokens / 1e6).toFixed(2)}M ($0.60/M)</span>
                        </div>
                        <div className="flex justify-between py-1 font-bold text-slate-900">
                          <span>Total Monthly Token Volume:</span>
                          <span className="font-mono">{(siteBilling.tokenUsage.totalTokens / 1e6).toFixed(2)}M</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-blue-700" />
                        <span>Cloud Run Container Runtime (us-west1)</span>
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span>vCPU & GiB Compute Allocation:</span>
                          <span className="font-mono font-bold">2 vCPU / 4 GiB</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span>Monthly vCPU-Hours:</span>
                          <span className="font-mono">{siteBilling.cloudRunMetrics.cpuHours.toLocaleString()} hrs</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span>Monthly Memory GiB-Hours:</span>
                          <span className="font-mono">{siteBilling.cloudRunMetrics.memoryGbHours.toLocaleString()} GiB-hrs</span>
                        </div>
                        <div className="flex justify-between py-1 font-bold text-slate-900">
                          <span>Container Scale-to-Zero Overnight:</span>
                          <span className="text-emerald-700">Enabled (03:00 - 09:00 UTC)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No dedicated billing profile found for this application.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LIVE RE-AUDIT */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Endpoint Inspection</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Connects directly to {site.url} from the server to measure HTTP response code, response latency, DOM accessibility markers, and Gemini AI assessment.
                  </p>
                </div>

                <button
                  onClick={handleRunLiveAudit}
                  disabled={isAuditingLive}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors shrink-0 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditingLive ? 'animate-spin' : ''}`} />
                  <span>{isAuditingLive ? 'Auditing Live...' : 'Trigger Live Audit'}</span>
                </button>
              </div>

              {liveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {liveError}
                </div>
              )}

              {liveAuditResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Status Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 font-medium block">HTTP Status</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {liveAuditResult.statusCode} OK
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 font-medium block">Response Latency</span>
                      <span className="text-lg font-bold text-slate-900">
                        {liveAuditResult.responseTimeMs} ms
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 font-medium block">HTML Lang Tag</span>
                      <span className="text-lg font-bold text-slate-900 font-mono">
                        {liveAuditResult.automatedChecks?.detectedLang}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 font-medium block">GA4 Measurement ID</span>
                      <span className="text-sm font-bold text-blue-700 font-mono">
                        {liveAuditResult.automatedChecks?.googleAnalyticsTags?.length > 0
                          ? liveAuditResult.automatedChecks.googleAnalyticsTags.join(', ')
                          : 'Inherited'}
                      </span>
                    </div>
                  </div>

                  {/* Gemini AI Live Assessment */}
                  {liveAuditResult.aiEvaluation && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-950 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-700" />
                        <span>Gemini 3.8 Flash Section 508 Live Audit Assessment</span>
                      </div>
                      <p className="text-indigo-900 leading-relaxed mb-3">
                        {liveAuditResult.aiEvaluation.executiveSummary}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-200/60">
                        <div>
                          <span className="font-bold text-indigo-900 block mb-1">Key Strengths Observed:</span>
                          <ul className="space-y-1 text-indigo-800">
                            {liveAuditResult.aiEvaluation.keyStrengths?.map((str: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <span>✓</span> <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold text-indigo-900 block mb-1">Recommended Hardening:</span>
                          <ul className="space-y-1 text-indigo-800">
                            {liveAuditResult.aiEvaluation.remediationPoints?.map((rem: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <span>•</span> <span>{rem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Printable PDF Dossier */}
          {activeTab === 'briefing' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 modal-no-print">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-blue-700" />
                    <span>Single-Application Audit Dossier: {site.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Formatted for crisp US Letter print and PDF output. High contrast text, no dark backgrounds, and Section 508 breakdown.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
                <PrintableAuditReport mode="single" site={site} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between modal-no-print">
          <span className="text-xs text-slate-500 font-medium">
            Last evaluated: {site.lastAudited}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors shadow-2xs"
            >
              <span>Open Target Website</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
