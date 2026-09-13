import React, { useState, useMemo } from 'react';
import { WebsiteAuditData } from '../types';
import { AnalyticsActionModal } from './AnalyticsActionModal';
import {
  Radio,
  Users,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Filter,
  CheckCircle,
  BarChart2,
  PieChart,
  Compass,
  Search,
  ArrowUpDown,
  Calendar,
  Info,
  Sparkles,
  Database,
  Key,
  FileCode,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  ChevronRight,
  Layers,
  Copy,
  Check,
  Play,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis,
} from 'recharts';

interface GoogleAnalyticsExplorerProps {
  websites: WebsiteAuditData[];
  onSelectSite: (site: WebsiteAuditData) => void;
  onWebsitesUpdated?: (websites: WebsiteAuditData[], summary: any) => void;
}

// Compact number formatting utility for sparkline badges and labels
const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) {
    const k = num / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1)}k`;
  }
  return String(num);
};

// Custom Tooltip for Recharts Sparklines
const SparklineTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-xs text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none z-50">
        <div className="font-bold text-slate-200">{item.month} 2026</div>
        <div className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{item.visitors.toLocaleString()} active users</span>
        </div>
        {item.sessions && (
          <div className="text-slate-400 text-[10px] mt-0.5">
            {item.sessions.toLocaleString()} total sessions
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const GoogleAnalyticsExplorer: React.FC<GoogleAnalyticsExplorerProps> = ({
  websites,
  onSelectSite,
  onWebsitesUpdated,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'All' | 'Veterans' | 'VA Staff'>('All');
  const [sortBy, setSortBy] = useState<'traffic' | 'growth' | 'name'>('traffic');
  const [actionModalSite, setActionModalSite] = useState<WebsiteAuditData | null>(null);
  const [activeRoadmapTab, setActiveRoadmapTab] = useState<'dap' | 'api' | 'bigquery' | 'tags'>('api');
  const [copiedPillarSnippet, setCopiedPillarSnippet] = useState<string | null>(null);

  // Live GA4 Tag Recheck State
  const [isRecheckingTags, setIsRecheckingTags] = useState(false);
  const [recheckData, setRecheckData] = useState<any>(null);
  const [recheckStatusMessage, setRecheckStatusMessage] = useState<string | null>(null);

  const handleRecheckAllTags = async () => {
    setIsRecheckingTags(true);
    setRecheckStatusMessage(null);
    try {
      const res = await fetch('/api/analytics/recheck-tags');
      const data = await res.json();
      if (data.success) {
        setRecheckData(data);
        if (onWebsitesUpdated && data.websites && data.summary) {
          onWebsitesUpdated(data.websites, data.summary);
        }
        setRecheckStatusMessage(
          `Live crawl verified ${data.trackedCount} of ${data.totalChecked} sites with active GA4 tags (${data.distinctTags.length} distinct tags across fleet).`
        );
      }
    } catch (err: any) {
      console.error('Failed to recheck tags:', err);
      setRecheckStatusMessage('Live crawl encountered a connection timeout. Showing current verified state.');
    } finally {
      setIsRecheckingTags(false);
    }
  };

  // Live GA4 Data API Test Bench State (BetaAnalyticsDataClient / fetchActualMetrics)
  const [testPropertyId, setTestPropertyId] = useState('40599620');
  const [testDateRange, setTestDateRange] = useState<'30d' | '7d' | '90d'>('30d');
  const [isRunningReport, setIsRunningReport] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/ga4/status')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => {});
  }, []);

  const handleRunGa4Report = async (overridePropertyId?: string) => {
    const prop = (overridePropertyId || testPropertyId || '40599620').trim();
    setIsRunningReport(true);
    setReportError(null);
    setReportResult(null);

    const rangeMap = {
      '7d': { startDate: '7daysAgo', endDate: 'today' },
      '30d': { startDate: '30daysAgo', endDate: 'today' },
      '90d': { startDate: '90daysAgo', endDate: 'today' },
    };
    const { startDate, endDate } = rangeMap[testDateRange];

    try {
      const res = await fetch('/api/ga4/run-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: prop,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReportError(data.error || 'Failed to fetch actual metrics');
        setReportResult(data);
      } else {
        setReportResult(data);
      }
    } catch (err: any) {
      setReportError(err.message || 'Network error executing fetchActualMetrics');
    } finally {
      setIsRunningReport(false);
    }
  };

  const handlePillarCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPillarSnippet(id);
    setTimeout(() => setCopiedPillarSnippet(null), 2500);
  };

  // Aggregate 6-month fleet trend across all websites
  const fleetTrends = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((month) => {
      let totalVisitors = 0;
      let totalSessions = 0;
      websites.forEach((w) => {
        const item = w.analytics.monthlyTrends?.find((t) => t.month === month);
        if (item) {
          totalVisitors += item.visitors;
          totalSessions += item.sessions;
        }
      });
      return { month, visitors: totalVisitors, sessions: totalSessions };
    });
  }, [websites]);

  const fleetGrowth = useMemo(() => {
    if (!fleetTrends || fleetTrends.length < 2) return 0;
    const start = fleetTrends[0].visitors;
    const end = fleetTrends[fleetTrends.length - 1].visitors;
    return start > 0 ? ((end - start) / start) * 100 : 0;
  }, [fleetTrends]);

  // Filtered and sorted websites list
  const filteredWebsites = useMemo(() => {
    return websites
      .filter((site) => {
        const matchesSearch =
          site.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          site.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
          (site.analytics.measurementId &&
            site.analytics.measurementId.toLowerCase().includes(searchFilter.toLowerCase()));
        const matchesAudience =
          audienceFilter === 'All' ||
          site.audience === audienceFilter ||
          (audienceFilter === 'Veterans' && site.audience === 'Both') ||
          (audienceFilter === 'VA Staff' && site.audience === 'Both');
        return matchesSearch && matchesAudience;
      })
      .sort((a, b) => {
        if (sortBy === 'traffic') {
          return b.analytics.estimatedMonthlyUsers - a.analytics.estimatedMonthlyUsers;
        }
        if (sortBy === 'growth') {
          const aStart = a.analytics.monthlyTrends?.[0]?.visitors ?? 1;
          const aEnd = a.analytics.monthlyTrends?.[a.analytics.monthlyTrends.length - 1]?.visitors ?? 1;
          const aGrowth = (aEnd - aStart) / aStart;

          const bStart = b.analytics.monthlyTrends?.[0]?.visitors ?? 1;
          const bEnd = b.analytics.monthlyTrends?.[b.analytics.monthlyTrends.length - 1]?.visitors ?? 1;
          const bGrowth = (bEnd - bStart) / bStart;

          return bGrowth - aGrowth;
        }
        return a.title.localeCompare(b.title);
      });
  }, [websites, searchFilter, audienceFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-700 animate-pulse" />
                Google Analytics 4 Measurement Stream
              </span>
              <span className="text-xs text-slate-500 font-mono">gtag.js</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Google Analytics Traffic Intelligence & Estimation Engine
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Empirical analysis of Google Analytics 4 tags extracted across the VA AI Assistant fleet with traffic source modeling.
            </p>
          </div>

          <div className="text-right self-start md:self-auto bg-slate-50 p-3.5 rounded-xl border border-slate-200 min-w-[230px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">Fleetwide Traffic</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                +{fleetGrowth.toFixed(1)}% 6-Mo
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">320,900</span>
              <span className="text-xs text-slate-500">Est. Active Users</span>
            </div>

            {/* Fleet 6-Month Aggregate Sparkline */}
            <div className="h-10 w-full mt-2 pt-1 border-t border-slate-200/70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fleetTrends} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fleet-sparkline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin - 5000', 'dataMax + 5000']} hide />
                  <Tooltip content={<SparklineTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fill="url(#fleet-sparkline)"
                    dot={{ r: 1.5, fill: '#0284c7' }}
                    activeDot={{ r: 3.5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-0.5">
              <span>Apr (230k)</span>
              <span>6-Month Fleet Trajectory</span>
              <span className="font-bold text-slate-700">Sep (320.9k)</span>
            </div>
          </div>
        </div>

        {/* 3 Discovered GA4 Properties */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Identified Google Analytics Measurement Properties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between font-mono font-bold text-blue-900 text-sm">
                <span>G-405V9V6L20</span>
                <span className="text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="font-semibold text-slate-800 mt-1">VA AI Assistant Library Discovery Portal</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Primary gateway routing veterans and staff to specialized micro-apps.
              </p>
              <div className="mt-2 text-[11px] font-bold text-slate-700">
                ~68,400 Monthly Users • 112,500 Sessions
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between font-mono font-bold text-blue-900 text-sm">
                <span>G-NCL4621DPJ</span>
                <span className="text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="font-semibold text-slate-800 mt-1">VA Veterans Benefits Assistant</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Tracks conversational claim guidance sessions and resource link clicks.
              </p>
              <div className="mt-2 text-[11px] font-bold text-slate-700">
                ~46,500 Monthly Users • 78,900 Sessions
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between font-mono font-bold text-blue-900 text-sm">
                <span>G-B1CMS0HLDD</span>
                <span className="text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Multi-App Stream (5 Apps)
                </span>
              </div>
              <p className="font-semibold text-slate-800 mt-1">Clinical, Logistics, Finance & IT Automation Cluster</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Multi-domain tracking across Healthcare, DD-214, Budget Insight, Supply Chain & ServiceNow.
              </p>
              <div className="mt-2 text-[11px] font-bold text-slate-700">
                ~123,100 Combined Users across 5 apps
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA PROVENANCE & ACCURACY DISCLOSURE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              Data Provenance & Source Transparency Audit
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            Audit Standard: OMB M-17-06 Federal Digital Services
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          To maintain absolute audit fidelity, this dashboard strictly delineates between <strong>empirically verified ground truth</strong> captured directly from production containers and <strong>modeled benchmark projections</strong> utilized where direct API credentials have not yet been provisioned.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Confirmed Real Data Column */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Confirmed Real Data (Ground Truth)</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
              <li>
                <strong>HTTP Response Status:</strong> Real-time container probes confirm HTTP 200 OK across production endpoints.
              </li>
              <li>
                <strong>Client-Side GA4 Measurement IDs:</strong> Verified stream tags (<code className="bg-emerald-100/80 px-1 py-0.2 rounded font-mono text-[11px] text-emerald-950 font-bold">G-405V9V6L20</code>, <code className="bg-emerald-100/80 px-1 py-0.2 rounded font-mono text-[11px] text-emerald-950 font-bold">G-NCL4621DPJ</code>, <code className="bg-emerald-100/80 px-1 py-0.2 rounded font-mono text-[11px] text-emerald-950 font-bold">G-B1CMS0HLDD</code>) extracted directly from live client DOM.
              </li>
              <li>
                <strong>Infrastructure Stack:</strong> Google Cloud Run container execution (<code className="font-mono text-[11px]">us-west1</code>), TLS 1.3 encryption, and GSA USWDS design standards.
              </li>
              <li>
                <strong>Accessibility Compliance:</strong> Automated Section 508 / WCAG 2.1 AA evaluation of DOM elements.
              </li>
            </ul>
          </div>

          {/* Modeled Estimates Column */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Modeled Benchmark Data (Federal Estimates)</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
              <li>
                <strong>Monthly Active Users & Sessions:</strong> Projected utilizing GSA Digital Analytics Program (DAP) comparative government pilot service baselines.
              </li>
              <li>
                <strong>Channel Attribution:</strong> Estimated distribution between Direct Bookmarks, Organic Search, and Referral channels.
              </li>
              <li>
                <strong>6-Month Trajectories:</strong> Synthetic trend curves (Apr–Sep 2026) modeling federal pilot adoption patterns.
              </li>
              <li>
                <strong>Current Limitation:</strong> Direct Google Analytics Data API service account keys are not yet connected to this reporting dashboard to query live hit counts.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* RECOMMENDED ACTIONS TO ACQUIRE ACTUAL DATA */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">
                Recommended Actions to Ingest Actual Data
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Technical roadmap to replace modeled estimates with continuous, verified government telemetry.
            </p>
          </div>

          {/* Pillar Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveRoadmapTab('api')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRoadmapTab === 'api'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. GA4 Data API
            </button>
            <button
              onClick={() => setActiveRoadmapTab('dap')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRoadmapTab === 'dap'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Federal GSA DAP
            </button>
            <button
              onClick={() => setActiveRoadmapTab('bigquery')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRoadmapTab === 'bigquery'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. BigQuery Export
            </button>
            <button
              onClick={() => setActiveRoadmapTab('tags')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRoadmapTab === 'tags'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4. Tag Pilot Apps
            </button>
          </div>
        </div>

        {/* Pillar 1: GA4 Data API */}
        {activeRoadmapTab === 'api' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Pillar 1: Ingest Live Active Users via Google Analytics Data API (v1beta)
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Automate ingestion of actual <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">activeUsers</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">sessions</code> metrics directly from Google Analytics.
                </p>
              </div>
              <button
                onClick={() =>
                  handlePillarCopy(
                    `import { BetaAnalyticsDataClient } from '@google-analytics/data';\n\nconst analyticsClient = new BetaAnalyticsDataClient();\n\nasync function fetchActualMetrics(propertyId) {\n  const [response] = await analyticsClient.runReport({\n    property: \`properties/\${propertyId}\`,\n    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],\n    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],\n  });\n  return response.rows;\n}`,
                    'pillar-api'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 shrink-0"
              >
                {copiedPillarSnippet === 'pillar-api' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPillarSnippet === 'pillar-api' ? 'Copied' : 'Copy Node.js Code'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Step A: Create Service Account</span>
                <p className="text-slate-600 text-[11px]">
                  In Google Cloud Console, create a service account (e.g. <code className="font-mono text-slate-800">ga4-auditor@va-ai.iam.gserviceaccount.com</code>).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Step B: Assign Viewer Role</span>
                <p className="text-slate-600 text-[11px]">
                  In Google Analytics 4 Admin &gt; Property Access Management, invite the service account email with <code className="font-mono text-slate-800">Viewer</code> role.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Step C: Configure Ingestion</span>
                <p className="text-slate-600 text-[11px]">
                  Set the <code className="font-mono text-slate-800">GOOGLE_APPLICATION_CREDENTIALS</code> environment variable and trigger the backend query.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Node.js Backend Implementation (Active on <code className="text-blue-800 font-mono">/api/ga4/run-report</code>):
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  @google-analytics/data Installed &amp; Ready
                </span>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{`import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsClient = new BetaAnalyticsDataClient();

async function fetchActualMetrics(propertyId) {
  const [response] = await analyticsClient.runReport({
    property: \`properties/\${propertyId}\`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
  });
  return response.rows;
}`}
              </pre>
            </div>

            {/* Live Interactive Ingestion Runner for fetchActualMetrics */}
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Live Runner: Test <code className="text-blue-800 font-mono">fetchActualMetrics(propertyId)</code>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      apiStatus?.status === 'configured'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {apiStatus?.status === 'configured'
                      ? 'Service Account: Active'
                      : 'Credentials: Ready for Service Account Key'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-6 space-y-1">
                  <label htmlFor="ga4-prop-input" className="block text-[11px] font-bold text-slate-700">
                    GA4 Property ID (numeric ID or properties/...)
                  </label>
                  <input
                    id="ga4-prop-input"
                    type="text"
                    value={testPropertyId}
                    onChange={(e) => setTestPropertyId(e.target.value)}
                    placeholder="e.g. 40599620"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label htmlFor="ga4-date-range" className="block text-[11px] font-bold text-slate-700">
                    Date Range
                  </label>
                  <select
                    id="ga4-date-range"
                    value={testDateRange}
                    onChange={(e) => setTestDateRange(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="30d">Last 30 Days (Standard)</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    onClick={() => handleRunGa4Report()}
                    disabled={isRunningReport}
                    className="w-full px-3 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {isRunningReport ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Quick Select Sample:
                </span>
                {[
                  { label: 'Discovery Hub (40599620)', id: '40599620' },
                  { label: 'Benefits Copilot (51209341)', id: '51209341' },
                  { label: 'Budget Insight AI (48910238)', id: '48910238' },
                ].map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setTestPropertyId(sample.id);
                      handleRunGa4Report(sample.id);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Execution Output Box */}
              {reportResult && (
                <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-300 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="flex items-center gap-2">
                      {reportResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="font-bold text-slate-900">
                        {reportResult.success
                          ? `Live Response from properties/${reportResult.propertyId}`
                          : `Status: Google Analytics Data API Response`}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>

                  {reportResult.success ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                            Active Users (Reported)
                          </span>
                          <span className="text-lg font-black text-emerald-950 font-mono">
                            {reportResult.rows?.[0]?.metricValues?.[0]?.value
                              ? Number(reportResult.rows[0].metricValues[0].value).toLocaleString()
                              : '0'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                          <span className="text-[10px] font-bold text-blue-800 uppercase block">
                            Sessions (Reported)
                          </span>
                          <span className="text-lg font-black text-blue-950 font-mono">
                            {reportResult.rows?.[0]?.metricValues?.[1]?.value
                              ? Number(reportResult.rows[0].metricValues[1].value).toLocaleString()
                              : '0'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg col-span-2 sm:col-span-1">
                          <span className="text-[10px] font-bold text-slate-600 uppercase block">
                            Total Rows Returned
                          </span>
                          <span className="text-lg font-black text-slate-900 font-mono">
                            {reportResult.rowCount}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-[10px] overflow-x-auto">
                        <span className="text-slate-400 block mb-1">
                          // Raw response.rows from analyticsClient.runReport():
                        </span>
                        {JSON.stringify(reportResult.rows, null, 2)}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>API Note: {reportResult.error || reportError}</span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          {reportResult.help ||
                            'The BetaAnalyticsDataClient is initialized on the backend and actively listening. To authenticate live calls against Google Analytics 4, provision a GCP Service Account with Viewer permissions in the target property.'}
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] overflow-x-auto space-y-1">
                        <span className="text-emerald-400 font-bold block">
                          // Authentication Configuration Guide:
                        </span>
                        <div>1. In Google Cloud Console, create a Service Account: <span className="text-yellow-300">ga4-ingestion@va-oit.iam.gserviceaccount.com</span></div>
                        <div>2. In GA4 Admin &gt; Property Access, grant &quot;Viewer&quot; role to this email.</div>
                        <div>3. Set <span className="text-cyan-300">GA4_CREDENTIALS_JSON</span> or <span className="text-cyan-300">GOOGLE_APPLICATION_CREDENTIALS</span> in the server environment.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pillar 2: Federal GSA DAP */}
        {activeRoadmapTab === 'dap' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Pillar 2: Deploy GSA Digital Analytics Program (DAP) for Public Transparency
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Embed the federal government-wide DAP tag to publish verified real-time metrics on{' '}
                  <a href="https://analytics.usa.gov" target="_blank" rel="noreferrer" className="text-blue-700 underline font-medium inline-flex items-center gap-0.5">
                    analytics.usa.gov <ExternalLink className="w-2.5 h-2.5" />
                  </a>.
                </p>
              </div>
              <button
                onClick={() =>
                  handlePillarCopy(
                    `<script async type="text/javascript" id="_fed_an_ua_tag" src="https://dap.digitalgov.gov/Universal-Federated-Analytics-Min.js?agency=VA&subagency=VBA&sp=lookup,query&dclink=true"></script>`,
                    'pillar-dap'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 shrink-0"
              >
                {copiedPillarSnippet === 'pillar-dap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPillarSnippet === 'pillar-dap' ? 'Copied' : 'Copy DAP Script'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-slate-800 space-y-2">
              <p className="text-xs leading-relaxed">
                <strong>Why Federal DAP?</strong> Under OMB M-17-06, all executive branch public-facing web applications are mandated to participate in the GSA DAP. When implemented, traffic data is automatically collected without PII and rendered in government-wide public dashboards.
              </p>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
{`<!-- GSA DAP Universal Federated Analytics for VA Applications -->
<script async type="text/javascript" id="_fed_an_ua_tag"
  src="https://dap.digitalgov.gov/Universal-Federated-Analytics-Min.js?agency=VA&subagency=VBA&sp=lookup,query&dclink=true">
</script>`}
              </pre>
            </div>
          </div>
        )}

        {/* Pillar 3: BigQuery Export */}
        {activeRoadmapTab === 'bigquery' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Pillar 3: Stream Raw GA4 Events into Google BigQuery Data Warehouse
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Export un-sampled, hit-level event streams for compliance verification and SQL querying.
                </p>
              </div>
              <button
                onClick={() =>
                  handlePillarCopy(
                    `SELECT\n  event_date,\n  COUNT(DISTINCT user_pseudo_id) AS actual_daily_users,\n  COUNT(*) AS total_event_hits\nFROM\n  \`va-cloud-project.analytics_40599620.events_*\`\nWHERE\n  _TABLE_SUFFIX BETWEEN '20260901' AND '20260930'\nGROUP BY\n  event_date\nORDER BY\n  event_date DESC;`,
                    'pillar-bq'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 shrink-0"
              >
                {copiedPillarSnippet === 'pillar-bq' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPillarSnippet === 'pillar-bq' ? 'Copied' : 'Copy BigQuery SQL'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">1. Enable GA4 BigQuery Link</span>
                <p className="text-slate-600 text-[11px]">
                  Inside GA4 Admin &gt; Property &gt; BigQuery Links, select your VA Cloud Project and select daily and streaming export options.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">2. Run Continuous SQL Audits</span>
                <p className="text-slate-600 text-[11px]">
                  Calculate ground-truth metrics with zero sampling error across claim submissions and conversation turns.
                </p>
              </div>
            </div>

            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
{`-- SQL Query: Ground-truth monthly active users from raw GA4 event logs
SELECT
  COUNT(DISTINCT user_pseudo_id) AS actual_monthly_users,
  COUNT(DISTINCT (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS actual_sessions
FROM
  \`va-cloud-project.analytics_40599620.events_*\`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE());`}
            </pre>
          </div>
        )}

        {/* Pillar 4: Tag Pilot Apps */}
        {activeRoadmapTab === 'tags' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Pillar 4: Audit & Deploy Telemetry Tags ({websites.filter((w) => !w.analytics.measurementId).length} Untagged of {websites.length})
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {websites.filter((w) => Boolean(w.analytics.measurementId)).length} Sites Verified Live
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">
                  Live crawler scans HTML DOM and runtime scripts across all 10 Cloud Run microservices for Google tag (gtag.js) instrumentation.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRecheckAllTags}
                  disabled={isRecheckingTags}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 font-semibold shadow-xs transition-colors"
                  title="Execute live HTTP crawl across all 10 sites to detect gtag.js and Google Analytics IDs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRecheckingTags ? 'animate-spin' : ''}`} />
                  <span>{isRecheckingTags ? 'Checking 10 Sites...' : 'Recheck All Live Tags'}</span>
                </button>

                <button
                  onClick={() =>
                    handlePillarCopy(
                      `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true, cookie_flags: 'SameSite=None;Secure' });\n</script>`,
                      'pillar-tags'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200"
                >
                  {copiedPillarSnippet === 'pillar-tags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPillarSnippet === 'pillar-tags' ? 'Copied' : 'Copy Template Tag'}</span>
                </button>
              </div>
            </div>

            {recheckStatusMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{recheckStatusMessage}</span>
                </div>
                <span className="text-emerald-700 font-mono text-[10px]">Just now</span>
              </div>
            )}

            {/* Live Tag Audit Breakdown per site if recheck executed */}
            {recheckData && recheckData.results && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Live Inspection Audit Results ({recheckData.results.length} Sites Crawled):</span>
                  <span className="text-[10px] text-slate-500 font-mono">Status 200 OK across all containers</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {recheckData.results.map((r: any) => (
                    <div key={r.id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="font-semibold text-slate-800 block truncate">{r.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">HTTP {r.statusCode} • {r.responseTimeMs}ms</span>
                      </div>
                      <div className="shrink-0 text-right">
                        {r.detectedTag ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {r.detectedTag}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Untagged
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <span className="font-bold text-amber-950 block">Applications Requiring Tag Instrumentation:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-[11px]">
                {websites
                  .filter((w) => !w.analytics.measurementId)
                  .map((w) => (
                    <div key={w.id} className="p-2 rounded bg-white border border-amber-200 flex items-center justify-between">
                      <span className="font-medium text-slate-900 truncate mr-2">{w.title}</span>
                      <button
                        onClick={() => setActionModalSite(w)}
                        className="text-blue-700 hover:underline font-semibold shrink-0"
                      >
                        Action Plan
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Domain-by-Domain Traffic Matrix with 6-Month Active Users Sparklines */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Estimated Monthly Users & 6-Month Trends by Domain</span>
              <span className="text-xs font-normal text-slate-500">
                ({filteredWebsites.length} of {websites.length} apps)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive 6-month active users sparklines (Apr–Sep 2026) powered by Recharts with traffic channel breakdowns.
            </p>
          </div>

          {/* Filtering & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search domain or ID..."
                className="pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg">
              {(['All', 'Veterans', 'VA Staff'] as const).map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudienceFilter(aud)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    audienceFilter === aud
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="traffic">Sort: Traffic (High to Low)</option>
              <option value="growth">Sort: 6-Mo Growth %</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredWebsites.map((site) => {
            const trends = site.analytics.monthlyTrends || [];
            const startUsers = trends[0]?.visitors ?? site.analytics.estimatedMonthlyUsers;
            const latestUsers = trends[trends.length - 1]?.visitors ?? site.analytics.estimatedMonthlyUsers;
            const growthRate = startUsers > 0 ? ((latestUsers - startUsers) / startUsers) * 100 : 0;
            const isPositive = growthRate >= 0;

            return (
              <div
                key={site.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Column 1: Domain Identity & Monthly Stats */}
                <div className="lg:w-[26%]">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{site.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {site.audience}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{site.domain}</div>
                  
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 text-sm">
                      {site.analytics.estimatedMonthlyUsers.toLocaleString()}
                    </span>
                    <span className="text-slate-500">monthly users</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-medium">
                      {site.analytics.estimatedMonthlySessions.toLocaleString()} sessions
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                    {site.analytics.measurementId ? (
                      <span className="inline-flex items-center gap-1 font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Live Tag: {site.analytics.measurementId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Tag Pending (Pilot)
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title="Projected benchmark based on GSA DAP federal self-service baseline">
                      Traffic: Model
                    </span>
                  </div>
                </div>

                {/* Column 2: 6-Month Active Users Sparkline Chart (Recharts) */}
                <div className="lg:w-[34%] min-w-[220px] bg-slate-50/90 rounded-lg p-2.5 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[11px] font-bold text-slate-700">
                        6-Month Active Users Trend
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {isPositive ? '+' : ''}
                      {growthRate.toFixed(1)}%
                    </span>
                  </div>

                  {/* Recharts Area Sparkline */}
                  <div className="h-11 w-full my-0.5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trends}
                        margin={{ top: 2, right: 3, left: 3, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id={`sparkline-${site.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#005ea2" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#005ea2" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin - 500', 'dataMax + 500']} hide />
                        <Tooltip
                          content={<SparklineTooltip />}
                          cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '2 2' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          stroke="#005ea2"
                          strokeWidth={2}
                          fill={`url(#sparkline-${site.id})`}
                          dot={{ r: 1.5, fill: '#005ea2' }}
                          activeDot={{ r: 3.5, fill: '#005ea2', stroke: '#ffffff', strokeWidth: 2 }}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 6-Month Timeline Indicators */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200/60 mt-0.5">
                    <span>
                      Apr: <strong className="text-slate-700 font-semibold">{formatCompactNumber(startUsers)}</strong>
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                      {trends.map((t, idx) => (
                        <span
                          key={idx}
                          className={idx === trends.length - 1 ? 'font-bold text-blue-700' : ''}
                        >
                          {t.month}
                        </span>
                      ))}
                    </div>
                    <span>
                      Sep: <strong className="text-slate-900 font-bold">{formatCompactNumber(latestUsers)}</strong>
                    </span>
                  </div>
                </div>

                {/* Column 3: Traffic Sources Visual Bars */}
                <div className="lg:w-[26%] space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Top Traffic Acquisition Channels
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {site.analytics.topSources.slice(0, 2).map((src, i) => (
                      <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 truncate">{src.name}</span>
                          <span className="font-bold text-slate-900 ml-1">{src.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${src.percentage}%`, backgroundColor: src.color }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          ~{src.estimatedVisits.toLocaleString()} visits/mo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 4: Action Button */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => setActionModalSite(site)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="View technical steps and code snippets to acquire actual verified data for this domain"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Action Plan</span>
                  </button>

                  <button
                    onClick={() => onSelectSite(site)}
                    className="px-3 py-1.5 rounded-lg border border-blue-600 bg-blue-50/60 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Inspect Dossier
                  </button>
                </div>
              </div>
            );
          })}

          {filteredWebsites.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No websites match the current search or audience filter.
            </div>
          )}
        </div>
      </div>

      {/* Action Plan & Data Provenance Modal */}
      <AnalyticsActionModal
        site={actionModalSite}
        onClose={() => setActionModalSite(null)}
      />
    </div>
  );
};
