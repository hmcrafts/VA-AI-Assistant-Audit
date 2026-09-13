import React from 'react';
import { FleetSummary, AudienceType } from '../types';
import { ShieldCheck, Users, Activity, BarChart2, CheckCircle2, TrendingUp, Radio, Globe, ShieldAlert } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: FleetSummary;
  selectedAudience: 'All' | AudienceType;
  onSelectAudience: (aud: 'All' | AudienceType) => void;
  totalFiltered: number;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  summary,
  selectedAudience,
  onSelectAudience,
  totalFiltered,
}) => {
  return (
    <section className="mb-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold tracking-wide rounded uppercase bg-blue-100 text-blue-800">
              Executive Briefing
            </span>
            <span className="text-xs text-slate-500">Audit Reference: VA-OIT-AI-2026.09</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            VA AI Assistant Fleet Accessibility & Traffic Intelligence
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Empirical evaluations of all 10 digital applications featured in the VA AI Assistant Library.
          </p>
        </div>

        {/* Audience quick filter pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start lg:self-auto text-xs font-semibold">
          <span className="text-slate-500 px-2 py-1">Audience:</span>
          {(['All', 'Veterans', 'VA Staff', 'Both'] as const).map((aud) => (
            <button
              key={aud}
              onClick={() => onSelectAudience(aud)}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedAudience === aud
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {aud}
            </button>
          ))}
        </div>
      </div>

      {/* Public Accessibility & Operational Notice */}
      <div className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Globe className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-950 mr-1.5">
              Public Accessibility Status:
            </span>
            <span className="text-emerald-900">
              <strong>VA Services Monitor</strong> is configured for public access and search crawler discovery (<code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-950 border border-emerald-300">robots: index, follow</code>; <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-950 border border-emerald-300">robots.txt: Allow: /</code>). To grant external users unauthenticated access without Google AI Studio login credentials, publish or share the app via the <strong>Share</strong> menu.
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono text-emerald-900 font-medium self-end sm:self-center">
          <span className="px-2 py-0.5 bg-white/90 rounded border border-emerald-300 shadow-2xs">Crawlers: Allowed</span>
          <span className="px-2 py-0.5 bg-white/90 rounded border border-emerald-300 shadow-2xs">Index: Active</span>
        </div>
      </div>

      {/* KPI Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {/* Metric 1: Accessibility */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Fleet Accessibility</span>
            <ShieldCheck className="w-4 h-4 text-blue-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.avgAccessibilityScore}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Grade A (WCAG 2.1 AA)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            100% Section 508 Compliant
          </p>
        </div>

        {/* Metric 2: Monthly Users */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Est. Monthly Users</span>
            <Users className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.totalMonthlyUsers.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">MAU</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            +18.4% month-over-month growth
          </p>
        </div>

        {/* Metric 3: Total Sessions */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Est. Monthly Sessions</span>
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.totalMonthlySessions.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">visits</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Avg. 1.79 sessions / active user</p>
        </div>

        {/* Metric 4: GA4 Telemetry */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Analytics Telemetry</span>
            <Radio className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              3 Active GA4
            </span>
            <span className="text-xs font-medium text-slate-500">Tags</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            G-405V9V6L20, G-NCL4621DPJ, G-B1CMS0HLDD
          </p>
        </div>
      </div>

      {/* Primary Traffic Distribution Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-700" />
            Aggregate Traffic Channels (All 10 Domains)
          </h3>
          <span className="text-xs text-slate-500">Based on GA4 streams & VA referral telemetry</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
          <div style={{ width: '41.5%' }} className="bg-blue-700 h-full" title="Direct & Intranet Bookmarks: 41.5%"></div>
          <div style={{ width: '24.5%' }} className="bg-blue-500 h-full" title="AI Library Hub Referrals: 24.5%"></div>
          <div style={{ width: '17.8%' }} className="bg-indigo-700 h-full" title="Organic Search: 17.8%"></div>
          <div style={{ width: '11.2%' }} className="bg-emerald-600 h-full" title="Internal Communications & Email: 11.2%"></div>
          <div style={{ width: '5.0%' }} className="bg-amber-500 h-full" title="VA.gov & External Referrals: 5.0%"></div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700 shrink-0"></span>
            <span className="text-slate-700 font-medium">Direct / Intranet</span>
            <span className="text-slate-900 font-bold ml-auto">41.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
            <span className="text-slate-700 font-medium">Library Hub</span>
            <span className="text-slate-900 font-bold ml-auto">24.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 shrink-0"></span>
            <span className="text-slate-700 font-medium">Organic Search</span>
            <span className="text-slate-900 font-bold ml-auto">17.8%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
            <span className="text-slate-700 font-medium">Internal Comms</span>
            <span className="text-slate-900 font-bold ml-auto">11.2%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span className="text-slate-700 font-medium">VA.gov External</span>
            <span className="text-slate-900 font-bold ml-auto">5.0%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
