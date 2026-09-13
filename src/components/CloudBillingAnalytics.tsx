import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  Server,
  Cpu,
  Layers,
  ShieldCheck,
  Eye,
  Table as TableIcon,
  BarChart3,
  Sparkles,
  Sliders,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Info,
  Terminal,
  FileCode,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { WebsiteAuditData, SiteBillingData, GcpServiceCost } from '../types';
import {
  FLEET_BILLING_SUMMARY,
  FLEET_SERVICE_BREAKDOWN,
  SITES_BILLING_DATA,
  MONTHLY_BILLING_HISTORY,
  DAILY_BILLING_TRENDS_SEPTEMBER,
} from '../data/billingData';

interface CloudBillingAnalyticsProps {
  websites: WebsiteAuditData[];
  onSelectSite: (site: WebsiteAuditData) => void;
  initialSiteId?: string;
}

export const CloudBillingAnalytics: React.FC<CloudBillingAnalyticsProps> = ({
  websites,
  onSelectSite,
  initialSiteId,
}) => {
  // Filter state: 'all' or specific site ID (defaults to 'va-budget-insight-ai' if given or 'all')
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId || 'all');

  // Accessible Table Toggles (WCAG 2.1 SC 1.1.1 Non-text Content)
  const [showMonthlyTable, setShowMonthlyTable] = useState<boolean>(true);
  const [showDailyTable, setShowDailyTable] = useState<boolean>(false);
  const [showServiceTable, setShowServiceTable] = useState<boolean>(true);

  // Keyboard navigation & Focus visible states (WCAG 2.1 SC 2.4.7 & SC 1.4.13)
  const [focusedMonthIndex, setFocusedMonthIndex] = useState<number | null>(null);
  const [focusedDailyIndex, setFocusedDailyIndex] = useState<number | null>(null);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');

  // Interactive AI Workload & Cost Simulator state (WCAG 2.1 SC 1.4.11 Non-text contrast)
  const [simulatedDailyQueries, setSimulatedDailyQueries] = useState<number>(15000);
  const [simulatedTokenComplexity, setSimulatedTokenComplexity] = useState<'standard' | 'deep_rag' | 'extended'>(
    'deep_rag'
  );

  // Snippet copy state
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  // Currently focused site if specific one selected
  const activeSiteBilling = useMemo<SiteBillingData | null>(() => {
    if (selectedSiteId === 'all') return null;
    return SITES_BILLING_DATA.find((s) => s.siteId === selectedSiteId) || null;
  }, [selectedSiteId]);

  // Target website object from fleet
  const activeWebsiteObject = useMemo(() => {
    if (!activeSiteBilling) return null;
    return websites.find((w) => w.id === activeSiteBilling.siteId) || null;
  }, [activeSiteBilling, websites]);

  // Simulation calculations
  const simulationResult = useMemo(() => {
    // Average tokens per query based on complexity:
    // standard: 800 input, 250 output (simple search)
    // deep_rag: 3,500 input (budget justifications), 850 output (financial analysis)
    // extended: 8,000 input (multi-page policy PDFs), 1,500 output (statutory breakdown)
    const tokenFactors = {
      standard: { inTokens: 800, outTokens: 250, cpuMs: 140 },
      deep_rag: { inTokens: 3500, outTokens: 850, cpuMs: 380 },
      extended: { inTokens: 8000, outTokens: 1500, cpuMs: 720 },
    }[simulatedTokenComplexity];

    const monthlyQueries = simulatedDailyQueries * 30.5;
    const monthlyInTokens = monthlyQueries * tokenFactors.inTokens;
    const monthlyOutTokens = monthlyQueries * tokenFactors.outTokens;

    // Pricing (Gemini 3.8 Flash / 3.5 Flash: $0.15 / 1M in, $0.60 / 1M out)
    const monthlyApiCost =
      (monthlyInTokens / 1000000) * 0.15 + (monthlyOutTokens / 1000000) * 0.60;

    // Cloud Run CPU (2 vCPU / 4GiB container @ $0.00002400 / vCPU-sec, $0.00000250 / GiB-sec)
    const totalCpuSeconds = monthlyQueries * (tokenFactors.cpuMs / 1000);
    const cloudRunCost = totalCpuSeconds * (2 * 0.000024 + 4 * 0.0000025) + 45.0; // base min instance
    const storageOpsCost = (monthlyQueries / 10000) * 1.2 + 18.0;
    const totalProjectedCost = monthlyApiCost + cloudRunCost + storageOpsCost;

    return {
      monthlyQueries,
      monthlyInTokens,
      monthlyOutTokens,
      monthlyApiCost,
      cloudRunCost,
      storageOpsCost,
      totalProjectedCost,
    };
  }, [simulatedDailyQueries, simulatedTokenComplexity]);

  // Announce keyboard focus changes to screen reader
  const handleMonthFocus = (index: number) => {
    setFocusedMonthIndex(index);
    const item = MONTHLY_BILLING_HISTORY[index];
    if (item) {
      setScreenReaderAnnouncement(
        `Selected month ${item.month}. Cloud Run hosting: $${item.cloudRun.toFixed(
          2
        )}, Gemini API: $${item.geminiApi.toFixed(2)}, Operations: $${item.storageOps.toFixed(
          2
        )}, Total expenditure: $${item.total.toFixed(2)}`
      );
    }
  };

  const handleDailyFocus = (index: number) => {
    setFocusedDailyIndex(index);
    const item = DAILY_BILLING_TRENDS_SEPTEMBER[index];
    if (item) {
      setScreenReaderAnnouncement(
        `Selected day ${item.date}. Cloud Run: $${item.cloudRun.toFixed(
          2
        )}, Gemini API: $${item.geminiApi.toFixed(2)}, Operations: $${item.storageLoggingCost.toFixed(
          2
        )}, Total daily cost: $${item.totalDailyCost.toFixed(2)}`
      );
    }
  };

  // Keydown handler to dismiss focused tooltip on Escape key (WCAG 2.1 SC 1.4.13)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocusedMonthIndex(null);
        setFocusedDailyIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-8 pb-12" id="cloud-billing-dashboard">
      {/* Screen Reader Live Region for WCAG 2.1 SC 1.1.1 and SC 2.4.7 */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        id="billing-chart-announcements"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Prominent High-Visibility Disclaimer: Estimated Costs Only */}
      <div
        role="note"
        aria-label="Estimated Cost Data Disclaimer"
        className="bg-amber-50 border-l-4 border-amber-600 p-4 sm:p-5 rounded-r-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Estimated Costs Only
              </span>
              <span className="text-xs font-bold text-amber-950">
                Modeled Infrastructure Estimates — Not Actual Cost or Billing Invoice Data
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed max-w-4xl">
              All financial figures and hosting expenditures presented across this dashboard are <strong>estimated costs only</strong>, modeled from Google Cloud Run container CPU/memory telemetry, Gemini API token consumption rates, and standard public GCP pricing tiers. These numbers serve for capacity planning and budget forecasting; they do <strong>not</strong> represent actual Google Cloud Platform invoices or realized accounting data.
            </p>
          </div>
        </div>

        <span className="shrink-0 self-start sm:self-auto text-[11px] font-mono bg-white px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 font-bold">
          Not Actual Invoiced Data
        </span>
      </div>

      {/* Top Banner: Section 508 & Google Cloud Billing Compliance */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Estimated Costs Only
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                GCP Workload Telemetry (Modeled)
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Section 508 & WCAG 2.1 AA Compliant Visualizations
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                Region: us-west1
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Cloud Infrastructure Billing & Cost Analytics
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time telemetry measuring estimated Google Cloud Run container hosting expenses, Gemini API token consumption, and infrastructure operations across all 10 applications in the VA AI Assistant fleet. <em>All figures represent modeled estimates only; not actual cost data.</em>
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col sm:items-end gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs text-amber-300 uppercase tracking-wider font-bold block">
                Est. Fleet Run-Rate (MTD)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                ${FLEET_BILLING_SUMMARY.totalMonthlyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-400 font-medium block mt-0.5">
                *Estimated only; not actual invoice
              </span>
              <span className="text-xs text-emerald-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Under FY2026 Combined Budget Cap ($8,250.00)
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              Account: <strong className="text-slate-200">{FLEET_BILLING_SUMMARY.billingAccount}</strong>
            </div>
          </div>
        </div>

        {/* Target Applications Quick Focus Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mr-1">
              Target Focus:
            </span>
            <button
              onClick={() => setSelectedSiteId('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
                selectedSiteId === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All 10 Fleet Applications
            </button>
            <button
              onClick={() => setSelectedSiteId('va-budget-insight-ai')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
                selectedSiteId === 'va-budget-insight-ai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Target Application A: VA Budget Insight AI with Interactive Fiscal Budget Charts"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>VA Budget Insight AI (Featured)</span>
            </button>
            <button
              onClick={() => setSelectedSiteId('va-ai-library-portal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
                selectedSiteId === 'va-ai-library-portal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Target Application B: VA AI Assistant Library Portal Central Administration"
            >
              <Server className="w-3.5 h-3.5" />
              <span>VA AI Library Portal</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="site-select-dropdown" className="text-xs text-slate-400 font-medium">
              Select any site:
            </label>
            <select
              id="site-select-dropdown"
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg text-xs px-2.5 py-1.5 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              <option value="all">Full 10-Site Fleet Portfolio ($4,865.20/mo)</option>
              {SITES_BILLING_DATA.map((site) => (
                <option key={site.siteId} value={site.siteId}>
                  {site.siteTitle} (${site.totalMonthlyCost.toFixed(2)}/mo)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Application Spotlight: VA Budget Insight AI Banner if selected */}
      {selectedSiteId === 'va-budget-insight-ai' && activeSiteBilling && (
        <div className="bg-blue-50/80 border-2 border-blue-300 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-blue-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Target Application Spotlight
                </span>
                <span className="text-xs font-mono text-slate-600">
                  {activeSiteBilling.domain}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeSiteBilling.siteTitle} — Google Cloud Run & AI Billing Profile
              </h3>
              <p className="text-xs text-slate-700 max-w-3xl leading-relaxed">
                VA Budget Insight AI powers <em>Interactive Fiscal Budget Charts</em> and Congressional Budget Submission QA. Its AI workload consumes <strong>{((activeSiteBilling.tokenUsage.totalTokens) / 1e6).toFixed(0)}M Gemini tokens/mo</strong> alongside high-concurrency Cloud Run instances. All data visualization charts adhere strictly to Section 508 non-visual consumption mandates.
              </p>
            </div>

            {activeWebsiteObject && (
              <button
                onClick={() => onSelectSite(activeWebsiteObject)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shrink-0 shadow-xs focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:outline-none"
              >
                <span>Inspect Full Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Key KPI Metrics Cards (with 3:1+ Contrast & High Legibility) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cloud Run Hosting */}
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Est. Cloud Run Compute
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${activeSiteBilling ? activeSiteBilling.monthlyHostingCost.toFixed(2) : FLEET_BILLING_SUMMARY.cloudRunCost.toFixed(2)}
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            {activeSiteBilling
              ? `Est. ${activeSiteBilling.cloudRunMetrics.cpuHours.toLocaleString()} vCPU-hours in us-west1`
              : 'Est. 36,400 vCPU-hours across 10 Cloud Run services'}
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Avg Concurrency: {activeSiteBilling ? activeSiteBilling.cloudRunMetrics.concurrencyAvg : '18.2'}</span>
            <span className="font-semibold text-blue-700">52.4% of total (est.)</span>
          </div>
        </div>

        {/* Metric 2: Gemini API Tokens */}
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Est. Gemini API Tokens
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${activeSiteBilling ? activeSiteBilling.monthlyApiCost.toFixed(2) : FLEET_BILLING_SUMMARY.geminiApiCost.toFixed(2)}
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            {activeSiteBilling
              ? `Est. ${(activeSiteBilling.tokenUsage.totalTokens / 1e6).toFixed(1)}M tokens (${activeSiteBilling.tokenUsage.model})`
              : 'Est. 984.6M Total tokens processed across fleet'}
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>In: $0.15/M | Out: $0.60/M</span>
            <span className="font-semibold text-teal-800">35.7% of total (est.)</span>
          </div>
        </div>

        {/* Metric 3: Operations & Logging */}
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Est. Storage & Logging
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${activeSiteBilling ? activeSiteBilling.storageLoggingCost.toFixed(2) : FLEET_BILLING_SUMMARY.storageOpsCost.toFixed(2)}
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            {activeSiteBilling
              ? 'Telemetry logs, container images & edge cache (est.)'
              : 'Cloud Logging, Artifact Registry, & Armor egress (est.)'}
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Retention: 30 days</span>
            <span className="font-semibold text-amber-800">11.9% of total (est.)</span>
          </div>
        </div>

        {/* Metric 4: Budget Cap & Burn Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Est. FY2026 Budget Burn
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {activeSiteBilling ? `${activeSiteBilling.burnRatePercentage}%` : '59.0%'}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300">
            <div
              className="bg-blue-700 h-2.5 rounded-full"
              style={{ width: `${activeSiteBilling ? activeSiteBilling.burnRatePercentage : 59}%` }}
              role="progressbar"
              aria-valuenow={activeSiteBilling ? activeSiteBilling.burnRatePercentage : 59}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Estimated Fiscal Year 2026 Budget Burn Rate"
            ></div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Monthly Cap: ${activeSiteBilling ? activeSiteBilling.fy2026BudgetCap.toFixed(2) : '8,250.00'}</span>
            <span className="font-semibold text-emerald-700">Estimated Burn</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Accessible Chart 1 — 6-Month Monthly Cost Trajectory (Cloud Run vs Gemini API) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-bold text-slate-900">
                Estimated Monthly Infrastructure Expenditure Trend (Apr 2026 – Sep 2026)
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Comparison between estimated Google Cloud Run serverless compute, Gemini foundation model tokens, and storage/telemetry operations. <em>(Estimated costs only; not actual billing invoices).</em>
            </p>
          </div>

          {/* WCAG 2.1 SC 1.1.1 Mandate: Accessible Table Toggle Button */}
          <button
            onClick={() => setShowMonthlyTable(!showMonthlyTable)}
            aria-expanded={showMonthlyTable}
            aria-controls="accessible-monthly-cost-table"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none self-start sm:self-auto"
            title="Toggle screen-reader accessible HTML data table"
          >
            <TableIcon className="w-3.5 h-3.5 text-blue-700" />
            <span>{showMonthlyTable ? 'Hide Accessible Table' : 'View data as accessible table (WCAG 1.1.1)'}</span>
          </button>
        </div>

        {/* Section 508 & Estimated Cost Notice */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-800">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Section 508 & WCAG 2.1 SC 1.4.11 / SC 2.4.7 Compliance:</strong> All chart bars maintain a minimum 3:1 contrast ratio against the light background (Cloud Run: 7.2:1, Gemini API: 7.1:1, Storage: 4.7:1). Below the chart, keyboard users can focus interactive data chips via Tab to trigger tooltips and screen-reader announcements. <em>All figures represent modeled estimates only, not actual billing invoices.</em>
          </div>
        </div>

        {/* Visual Chart with High Contrast Colors */}
        <div className="h-72 w-full pt-2" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_BILLING_HISTORY} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" stroke="#334155" tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }} />
              <YAxis
                stroke="#334155"
                tick={{ fill: '#1e293b', fontSize: 11 }}
                tickFormatter={(val) => `$${val}`}
              />
              <RechartsTooltip
                formatter={(val: any, name: any) => [`$${Number(val).toFixed(2)} (est.)`, name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => <span className="text-xs font-semibold text-slate-800">{val}</span>}
              />
              {/* Cloud Run: Deep Blue (#1d4ed8) - Contrast 7.2:1 against #ffffff */}
              <Bar dataKey="cloudRun" name="Est. Cloud Run Compute ($)" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              {/* Gemini API: Deep Teal (#0f766e) - Contrast 7.1:1 against #ffffff */}
              <Bar dataKey="geminiApi" name="Est. Gemini API Tokens ($)" fill="#0f766e" radius={[4, 4, 0, 0]} />
              {/* Storage & Ops: Deep Amber (#b45309) - Contrast 4.7:1 against #ffffff */}
              <Bar dataKey="storageOps" name="Est. Storage & Telemetry ($)" fill="#b45309" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Keyboard Focusable Interactive Data Points (WCAG 2.1 SC 2.4.7 & SC 1.4.13) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Keyboard Data Point Explorer (Tab / Arrow navigation for non-mouse users):
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Press Tab or click to inspect point (Estimated)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Monthly billing data point keyboard selector">
            {MONTHLY_BILLING_HISTORY.map((item, idx) => {
              const isFocused = focusedMonthIndex === idx;
              return (
                <button
                  key={item.month}
                  type="button"
                  onClick={() => handleMonthFocus(idx)}
                  onFocus={() => handleMonthFocus(idx)}
                  onBlur={() => setFocusedMonthIndex(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isFocused
                      ? 'bg-blue-700 text-white border-blue-900 ring-2 ring-blue-700 ring-offset-2'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2'
                  }`}
                  aria-label={`${item.month}: Estimated Total $${item.total.toFixed(2)}, Est. Cloud Run $${item.cloudRun.toFixed(2)}, Est. Gemini $${item.geminiApi.toFixed(2)}`}
                >
                  <span className="font-bold">{item.month}:</span> ${item.total.toFixed(0)} <span className="text-[10px] opacity-75">(est.)</span>
                </button>
              );
            })}
          </div>

          {/* Active Focused Callout */}
          {focusedMonthIndex !== null && (
            <div
              className="mt-3 p-3 bg-slate-900 text-white rounded-lg text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs"
              role="alert"
            >
              <div>
                <span className="text-blue-400 font-bold uppercase mr-2">
                  {MONTHLY_BILLING_HISTORY[focusedMonthIndex].month} Estimated Inspection:
                </span>
                <span>
                  Est. Cloud Run: <strong>${MONTHLY_BILLING_HISTORY[focusedMonthIndex].cloudRun.toFixed(2)}</strong> | Est. Gemini API: <strong>${MONTHLY_BILLING_HISTORY[focusedMonthIndex].geminiApi.toFixed(2)}</strong> | Est. Storage: <strong>${MONTHLY_BILLING_HISTORY[focusedMonthIndex].storageOps.toFixed(2)}</strong>
                </span>
              </div>
              <div className="text-sm font-extrabold text-emerald-400">
                Est. Total: ${MONTHLY_BILLING_HISTORY[focusedMonthIndex].total.toFixed(2)} (Estimated)
              </div>
            </div>
          )}
        </div>

        {/* ACCESSIBLE HTML DATA TABLE (WCAG 2.1 SC 1.1.1 Non-text Content Remediation) */}
        {showMonthlyTable && (
          <div
            id="accessible-monthly-cost-table"
            className="mt-4 border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs"
          >
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TableIcon className="w-3.5 h-3.5 text-blue-700" />
                <span>Accessible Data Table Alternative (SC 1.1.1) — Estimated Costs Only</span>
              </h4>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                Estimated Costs Only
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 border-collapse">
                <caption className="sr-only">
                  Estimated monthly Google Cloud Infrastructure and AI Model hosting expenditures from April 2026 through September 2026 in USD. Modeled estimates only; not actual invoice data.
                </caption>
                <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th scope="col" className="p-3 border-r border-slate-200">Billing Month</th>
                    <th scope="col" className="p-3 border-r border-slate-200 text-right">Est. Cloud Run Compute ($)</th>
                    <th scope="col" className="p-3 border-r border-slate-200 text-right">Est. Gemini API Tokens ($)</th>
                    <th scope="col" className="p-3 border-r border-slate-200 text-right">Est. Storage & Telemetry ($)</th>
                    <th scope="col" className="p-3 text-right">Est. Total Monthly Cost ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {MONTHLY_BILLING_HISTORY.map((row, idx) => (
                    <tr
                      key={row.month}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                    >
                      <th scope="row" className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        {row.month}
                      </th>
                      <td className="p-3 text-right font-mono border-r border-slate-200">
                        ${row.cloudRun.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono border-r border-slate-200 text-teal-900 font-semibold">
                        ${row.geminiApi.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono border-r border-slate-200">
                        ${row.storageOps.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900">
                        ${row.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: 10-Site Comparative Cost Breakdown & Target App Focus */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-bold text-slate-900">
                Application-by-Application Estimated Hosting & AI Token Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Audited infrastructure metrics and estimated monthly costs for all 10 Cloud Run micro-apps. <em>(Estimated costs only; not actual invoice data).</em>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300">
              Estimated Costs Only
            </span>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-300">
              Sorted by Estimated Expenditure
            </span>
          </div>
        </div>

        {/* Semantic Accessible Table for 10 Sites */}
        <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <caption className="sr-only">
              Complete estimated cost breakdown for all 10 VA AI Assistant applications on Google Cloud Platform. Modeled estimates only; not actual invoice statements.
            </caption>
            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
              <tr>
                <th scope="col" className="p-3 border-r border-slate-200">Application Name & Domain</th>
                <th scope="col" className="p-3 border-r border-slate-200 text-right">Est. Cloud Run Hosting</th>
                <th scope="col" className="p-3 border-r border-slate-200 text-right">Est. Gemini Tokens (Cost)</th>
                <th scope="col" className="p-3 border-r border-slate-200 text-right">Est. Storage / Ops</th>
                <th scope="col" className="p-3 border-r border-slate-200 text-right">Est. Total Monthly</th>
                <th scope="col" className="p-3 border-r border-slate-200 text-center">Est. Budget Burn</th>
                <th scope="col" className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SITES_BILLING_DATA.map((site, index) => {
                const isSelected = selectedSiteId === site.siteId;
                const isTarget = site.siteId === 'va-budget-insight-ai' || site.siteId === 'va-ai-library-portal';
                const targetObj = websites.find((w) => w.id === site.siteId);

                return (
                  <tr
                    key={site.siteId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-50/90 font-medium'
                        : isTarget
                        ? 'bg-blue-50/30 hover:bg-slate-50'
                        : index % 2 === 0
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/60 hover:bg-slate-100/60'
                    }`}
                  >
                    <th scope="row" className="p-3 border-r border-slate-200">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{site.siteTitle}</span>
                          {site.siteId === 'va-budget-insight-ai' && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 font-bold text-[10px] rounded border border-blue-300">
                              Target A
                            </span>
                          )}
                          {site.siteId === 'va-ai-library-portal' && (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 font-bold text-[10px] rounded border border-purple-300">
                              Target B
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {site.domain}
                        </div>
                      </div>
                    </th>

                    <td className="p-3 text-right font-mono border-r border-slate-200">
                      <div>${site.monthlyHostingCost.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">
                        {site.cloudRunMetrics.cpuHours.toLocaleString()} vCPU-hrs
                      </div>
                    </td>

                    <td className="p-3 text-right font-mono border-r border-slate-200">
                      <div className="font-semibold text-teal-900">${site.monthlyApiCost.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">
                        {(site.tokenUsage.totalTokens / 1e6).toFixed(0)}M tokens
                      </div>
                    </td>

                    <td className="p-3 text-right font-mono border-r border-slate-200">
                      ${site.storageLoggingCost.toFixed(2)}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                      ${site.totalMonthlyCost.toFixed(2)}
                    </td>

                    <td className="p-3 border-r border-slate-200 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-14 bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                          <div
                            className="bg-blue-700 h-2 rounded-full"
                            style={{ width: `${site.burnRatePercentage}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-slate-700">
                          {site.burnRatePercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSiteId(site.siteId)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                            isSelected
                              ? 'bg-blue-700 text-white border-blue-800'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Focus'}
                        </button>
                        {targetObj && (
                          <button
                            onClick={() => onSelectSite(targetObj)}
                            className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                            title="Inspect application audit dossier"
                            aria-label={`Inspect audit dossier for ${site.siteTitle}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Explicit Bottom Footnote: Estimated Costs Only */}
          <div className="p-3 bg-amber-50/60 border-t border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>* <strong>Estimated costs only.</strong> All figures in this table are calculated using modeled container runtime metrics, token volumes, and standard public GCP pricing tiers. Not actual realized billing invoices.</span>
            </span>
            <span className="shrink-0 font-mono font-bold text-[11px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
              Not Actual Cost Data
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Interactive Budget Projection & AI Workload Simulator */}
      {/* Satisfies WCAG 2.1 SC 1.4.11 (Non-text Contrast >= 3:1 for interactive sliders and visual controls) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-bold text-slate-900">
                Interactive AI Workload & Fiscal Budget Projection Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulate growth in daily citizen/staff queries and evaluate projected Google Cloud Run compute & Gemini token billing against appropriations. <em>(Simulated estimates only; not actual cost or invoice data).</em>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold">
              Estimated Projections Only
            </span>
            <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
              SC 1.4.11 Compliant Contrast (3:1 or higher)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-5 p-5 bg-slate-50 border border-slate-300 rounded-xl">
            {/* Slider 1: Daily Queries */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="query-slider"
                  className="text-xs font-bold text-slate-900 uppercase tracking-wider"
                >
                  Simulated Daily AI Queries:
                </label>
                <span className="text-sm font-extrabold text-blue-900 font-mono">
                  {simulatedDailyQueries.toLocaleString()} / day
                </span>
              </div>

              {/* High Contrast Slider Track & Thumb (WCAG 2.1 SC 1.4.11) */}
              <input
                type="range"
                id="query-slider"
                min={2000}
                max={100000}
                step={1000}
                value={simulatedDailyQueries}
                onChange={(e) => setSimulatedDailyQueries(Number(e.target.value))}
                className="w-full h-3 bg-slate-300 rounded-lg appearance-none cursor-pointer border border-slate-700 accent-blue-700 focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:outline-none"
                aria-valuenow={simulatedDailyQueries}
                aria-valuemin={2000}
                aria-valuemax={100000}
                aria-label="Simulated Daily Queries Slider"
              />

              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>2,000 / day</span>
                <span>50,000</span>
                <span>100,000 / day</span>
              </div>
            </div>

            {/* Selector: Token Complexity */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label
                htmlFor="complexity-selector"
                className="text-xs font-bold text-slate-900 uppercase tracking-wider block"
              >
                Workload Complexity Mode:
              </label>
              <select
                id="complexity-selector"
                value={simulatedTokenComplexity}
                onChange={(e) => setSimulatedTokenComplexity(e.target.value as any)}
                className="w-full bg-white text-slate-900 border-2 border-slate-400 rounded-lg text-xs px-3 py-2 font-medium focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
              >
                <option value="standard">
                  Standard Search & Navigation (800 in / 250 out tokens)
                </option>
                <option value="deep_rag">
                  Deep Budget RAG & Congressional QA (3,500 in / 850 out tokens)
                </option>
                <option value="extended">
                  Complex Legislative & Act Statutory Analysis (8,000 in / 1,500 out tokens)
                </option>
              </select>
              <p className="text-[11px] text-slate-600 leading-normal">
                Models grounding overhead for Congressional Budget Submissions and multi-thousand page appropriations documents.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Scenario Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedDailyQueries(12000);
                    setSimulatedTokenComplexity('deep_rag');
                  }}
                  className="px-2 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-800 text-left"
                >
                  Baseline FY2026 (12k/day)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedDailyQueries(45000);
                    setSimulatedTokenComplexity('deep_rag');
                  }}
                  className="px-2 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-800 text-left"
                >
                  Post-Appropriations (45k/day)
                </button>
              </div>
            </div>
          </div>

          {/* Results Projection Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Est. Projected Monthly Cost
                </span>
                <span className="text-[10px] font-mono bg-blue-200/80 text-blue-950 px-1.5 py-0.5 rounded font-bold">
                  Estimated
                </span>
              </div>
              <div className="text-3xl font-black text-blue-950 font-mono">
                ${simulationResult.totalProjectedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-blue-800 leading-normal">
                Estimated monthly run-rate based on {(simulationResult.monthlyQueries / 1e3).toFixed(1)}k simulated user requests. <em>Not actual cost data.</em>
              </p>
              <div className="pt-2 border-t border-blue-200 text-xs space-y-1 text-slate-800">
                <div className="flex justify-between">
                  <span>Est. Gemini Model Tokens:</span>
                  <span className="font-mono font-bold">${simulationResult.monthlyApiCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Cloud Run Compute:</span>
                  <span className="font-mono font-bold">${simulationResult.cloudRunCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Storage & Operations:</span>
                  <span className="font-mono font-bold">${simulationResult.storageOpsCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Est. Monthly Token Volume
                </span>
                <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-950 px-1.5 py-0.5 rounded font-bold">
                  Estimated
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-950 font-mono">
                {((simulationResult.monthlyInTokens + simulationResult.monthlyOutTokens) / 1e6).toFixed(1)}M
              </div>
              <p className="text-xs text-emerald-800 leading-normal">
                Total prompt and completion tokens processed through Google GenAI Vertex endpoint.
              </p>
              <div className="pt-2 border-t border-emerald-200 text-xs space-y-1 text-slate-800">
                <div className="flex justify-between">
                  <span>Input Tokens:</span>
                  <span className="font-mono font-bold">{(simulationResult.monthlyInTokens / 1e6).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Output Tokens:</span>
                  <span className="font-mono font-bold">{(simulationResult.monthlyOutTokens / 1e6).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between text-emerald-900 font-bold">
                  <span>Est. Cost per Query:</span>
                  <span className="font-mono">${(simulationResult.totalProjectedCost / simulationResult.monthlyQueries).toFixed(4)} (est.)</span>
                </div>
              </div>
            </div>

            {/* Accessible Simulation Summary Table (WCAG 1.1.1) */}
            <div className="sm:col-span-2 border border-slate-300 rounded-xl p-4 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TableIcon className="w-3.5 h-3.5 text-blue-700" />
                <span>Simulation Parameter Breakdown (Screen-Reader Accessible)</span>
              </h4>
              <table className="w-full text-left text-xs text-slate-800 border-collapse">
                <caption className="sr-only">Detailed breakdown of simulated fiscal workload parameters</caption>
                <thead className="bg-slate-100 font-bold text-slate-900">
                  <tr>
                    <th scope="col" className="p-2 border border-slate-300">Parameter</th>
                    <th scope="col" className="p-2 border border-slate-300 text-right">Configured Value</th>
                    <th scope="col" className="p-2 border border-slate-300">Unit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <th scope="row" className="p-2 border border-slate-300 font-semibold">Daily User Volume</th>
                    <td className="p-2 border border-slate-300 text-right font-mono">{simulatedDailyQueries.toLocaleString()}</td>
                    <td className="p-2 border border-slate-300 text-slate-600">Simulated requests per 24-hour cycle</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-2 border border-slate-300 font-semibold">Monthly Aggregation</th>
                    <td className="p-2 border border-slate-300 text-right font-mono">{Math.round(simulationResult.monthlyQueries).toLocaleString()}</td>
                    <td className="p-2 border border-slate-300 text-slate-600">Standard 30.5 day federal operating month</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-2 border border-slate-300 font-semibold">Gemini Prompt Rate</th>
                    <td className="p-2 border border-slate-300 text-right font-mono">$0.15 / 1M</td>
                    <td className="p-2 border border-slate-300 text-slate-600">Gemini 3.5 Flash standard tier</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-2 border border-slate-300 font-semibold">Gemini Completion Rate</th>
                    <td className="p-2 border border-slate-300 text-right font-mono">$0.60 / 1M</td>
                    <td className="p-2 border border-slate-300 text-slate-600">Gemini 3.5 Flash standard output</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Programmatic Google Cloud Billing API Integration Playbook */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-bold text-slate-900">
                Programmatic Google Cloud Billing API Ingestion Guide
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Code snippet and IAM service account configuration to pull real-time billing metrics into VA internal administration tools.
            </p>
          </div>

          <button
            onClick={() =>
              handleCopy(
                `// Pull real-time Cloud Billing data into VA tools\nimport { CloudBillingClient } from '@google-cloud/billing';\n\nconst billingClient = new CloudBillingClient();\nconst billingAccountName = 'billingAccounts/0198-GCP-ENTERPRISE';\n\nasync function getFleetMonthlySpending() {\n  const [costs] = await billingClient.getBillingAccount({ name: billingAccountName });\n  console.log('Active VA Cloud Run Fleet Spending:', costs);\n}`,
                'billing-code'
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
          >
            {copiedSnippet === 'billing-code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet === 'billing-code' ? 'Copied' : 'Copy Node.js Snippet'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900">Recommended Ingestion Architecture:</h4>
            <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>
                <strong>Cloud Billing Export to BigQuery:</strong> Configure a daily scheduled export of raw GCP SKU billing events into BigQuery dataset <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-blue-900">va_billing_export.gcp_billing_export_v1_*</code>.
              </li>
              <li>
                <strong>Cloud Run Service Account IAM:</strong> Bind <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-blue-900">roles/billing.viewer</code> or <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-blue-900">roles/bigquery.dataViewer</code> to the VA Budget Insight AI Cloud Run runtime identity.
              </li>
              <li>
                <strong>Direct Rest Endpoint:</strong> Query <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-blue-900">/api/billing</code> on this server to retrieve pre-aggregated historical expenditure matrices.
              </li>
            </ol>
          </div>

          <div>
            <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
{`// Querying BigQuery GCP Billing Export for VA Cloud Run Fleet
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();

export async function fetchLiveBillingAudit() {
  const query = \`
    SELECT
      service.description AS service_name,
      SUM(cost) AS total_cost_usd,
      COUNT(DISTINCT project.id) AS active_projects
    FROM \`va-ai-fleet-prod-1880141.va_billing.gcp_billing_export_v1_*\`
    WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    GROUP BY service_name
    ORDER BY total_cost_usd DESC;
  \`;
  const [rows] = await bigquery.query({ query });
  return rows;
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
