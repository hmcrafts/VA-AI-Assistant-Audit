import React, { useState } from 'react';
import { WebsiteAuditData, AudienceType } from '../types';
import {
  ShieldCheck,
  ExternalLink,
  ArrowUpDown,
  Download,
  Users,
  Radio,
  BarChart2,
  TrendingUp,
  Share2,
} from 'lucide-react';

interface ComparativeTableProps {
  websites: WebsiteAuditData[];
  onSelectSite: (site: WebsiteAuditData) => void;
}

export const ComparativeTable: React.FC<ComparativeTableProps> = ({
  websites,
  onSelectSite,
}) => {
  const [viewMode, setViewMode] = useState<'traffic' | 'accessibility'>('traffic');
  const [sortField, setSortField] = useState<'users' | 'score' | 'title' | 'direct' | 'organic' | 'referral'>('users');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterAudience, setFilterAudience] = useState<'All' | AudienceType>('All');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filtered = websites.filter((site) => {
    if (filterAudience === 'All') return true;
    return site.audience === filterAudience;
  });

  const sorted = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortField === 'users') {
      comp = a.analytics.estimatedMonthlyUsers - b.analytics.estimatedMonthlyUsers;
    } else if (sortField === 'score') {
      comp = a.accessibility.overallScore - b.accessibility.overallScore;
    } else if (sortField === 'direct') {
      comp = a.analytics.standardChannels.direct - b.analytics.standardChannels.direct;
    } else if (sortField === 'organic') {
      comp = a.analytics.standardChannels.organicSearch - b.analytics.standardChannels.organicSearch;
    } else if (sortField === 'referral') {
      comp = a.analytics.standardChannels.referral - b.analytics.standardChannels.referral;
    } else {
      comp = a.title.localeCompare(b.title);
    }
    return sortDirection === 'asc' ? comp : -comp;
  });

  const exportCSV = () => {
    const headers = [
      'Application Title',
      'Target Domain',
      'Audience',
      'Type',
      'Est. Monthly Active Users',
      'Est. Monthly Sessions',
      'Direct & Intranet (%)',
      'Organic Search (%)',
      'Referral Traffic (%)',
      'Social & Forums (%)',
      'Internal Email & Comms (%)',
      'Primary Traffic Channel',
      'GA4 Measurement ID',
      'Accessibility Score',
      'WCAG 2.1 Level',
      'URL',
    ];

    const rows = sorted.map((s) => [
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.domain}"`,
      s.audience,
      s.type,
      s.analytics.estimatedMonthlyUsers,
      s.analytics.estimatedMonthlySessions,
      s.analytics.standardChannels.direct,
      s.analytics.standardChannels.organicSearch,
      s.analytics.standardChannels.referral,
      s.analytics.standardChannels.social,
      s.analytics.standardChannels.emailInternal,
      `"${s.analytics.topSources[0]?.name || ''}"`,
      s.analytics.measurementId || 'Pending Dedicated Tag',
      s.accessibility.overallScore,
      s.accessibility.wcagLevel,
      s.url,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VA_AI_Assistant_Comparative_Traffic_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Table Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              Comparative Analysis
            </span>
            <span className="text-xs text-slate-500">10 Domains Evaluated</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Domain Traffic & Accessibility Comparative Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side comparison of modeled monthly traffic, acquisition channels, and Section 508 compliance.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
            <span className="font-bold">Source Note:</span>
            <span>Monthly user & session numbers are federal benchmark projections. GA4 measurement tags are verified live where instrumented.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="p-1 bg-slate-200/80 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('traffic')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'traffic'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Traffic & Sources</span>
            </button>

            <button
              onClick={() => setViewMode('accessibility')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'accessibility'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accessibility Scores</span>
            </button>
          </div>

          {/* Audience Filter */}
          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value as any)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Audiences</option>
            <option value="Veterans">Veterans Focus</option>
            <option value="VA Staff">VA Staff Focus</option>
            <option value="Both">Dual Audience</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            title="Download comparative data in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Traffic Summary Strip */}
      {viewMode === 'traffic' && (
        <div className="bg-blue-50/60 px-5 py-2.5 border-b border-blue-100 flex flex-wrap items-center justify-between text-xs text-blue-950 gap-3">
          <div className="flex items-center gap-4">
            <span className="font-bold">Traffic Channels Key:</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span> Direct / Intranet
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-700"></span> Organic Search
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Referral (Hub)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Internal / Email
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Social / Forums
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            *Estimates synthesized from active GA4 streams & VA referral telemetry
          </span>
        </div>
      )}

      {/* Responsive Comparative Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider select-none">
              <th
                onClick={() => handleSort('title')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Application Domain</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4">Audience</th>

              {viewMode === 'traffic' ? (
                <>
                  <th
                    onClick={() => handleSort('users')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    title="Estimated Monthly Active Users based on federal pilot model"
                  >
                    <div className="flex items-center gap-1">
                      <span>Est. Users (Model)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th className="py-3 px-4" title="Estimated Monthly Sessions based on federal pilot model">
                    Est. Sessions (Model)
                  </th>

                  <th
                    onClick={() => handleSort('direct')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    title="Direct Intranet Bookmarks & PIV Portal Launches"
                  >
                    <div className="flex items-center gap-1">
                      <span>Direct %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('organic')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    title="Google & Bing Organic Search Queries"
                  >
                    <div className="flex items-center gap-1">
                      <span>Organic %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('referral')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    title="Library Hub & Ecosystem Cross-Referrals"
                  >
                    <div className="flex items-center gap-1">
                      <span>Referral %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th className="py-3 px-4">Social / Comms %</th>
                  <th className="py-3 px-4">Traffic Mix Visualization</th>
                  <th className="py-3 px-4">Google Analytics 4</th>
                </>
              ) : (
                <>
                  <th
                    onClick={() => handleSort('score')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Section 508 Score</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">WCAG Standard</th>
                  <th className="py-3 px-4">Color Contrast</th>
                  <th className="py-3 px-4">Key Functional Capabilities</th>
                  <th className="py-3 px-4">Framework Stack</th>
                </>
              )}

              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {sorted.map((site) => (
              <tr
                key={site.id}
                onClick={() => onSelectSite(site)}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                {/* Domain & Title */}
                <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                  <div className="font-bold group-hover:text-blue-700 transition-colors truncate">
                    {site.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                    {site.domain}
                  </div>
                </td>

                {/* Audience Badge */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      site.audience === 'Veterans'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : site.audience === 'VA Staff'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    {site.audience}
                  </span>
                </td>

                {/* VIEW MODE: TRAFFIC */}
                {viewMode === 'traffic' ? (
                  <>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {site.analytics.estimatedMonthlyUsers.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">MAU</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">
                        {site.analytics.estimatedMonthlySessions.toLocaleString()}
                      </span>
                    </td>

                    {/* Direct % */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {site.analytics.standardChannels.direct}%
                      </span>
                    </td>

                    {/* Organic Search % */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {site.analytics.standardChannels.organicSearch}%
                      </span>
                    </td>

                    {/* Referral % */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {site.analytics.standardChannels.referral}%
                      </span>
                    </td>

                    {/* Social / Comms % */}
                    <td className="py-3.5 px-4">
                      {site.analytics.standardChannels.social > 0 ? (
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {site.analytics.standardChannels.social}% Social
                        </span>
                      ) : site.analytics.standardChannels.emailInternal > 0 ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {site.analytics.standardChannels.emailInternal}% Comms
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Horizontal Visual Breakdown Bar */}
                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex border border-slate-200">
                        <div
                          style={{ width: `${site.analytics.standardChannels.direct}%` }}
                          className="bg-blue-700 h-full"
                          title={`Direct: ${site.analytics.standardChannels.direct}%`}
                        ></div>
                        <div
                          style={{ width: `${site.analytics.standardChannels.organicSearch}%` }}
                          className="bg-indigo-700 h-full"
                          title={`Organic Search: ${site.analytics.standardChannels.organicSearch}%`}
                        ></div>
                        <div
                          style={{ width: `${site.analytics.standardChannels.referral}%` }}
                          className="bg-blue-400 h-full"
                          title={`Referral: ${site.analytics.standardChannels.referral}%`}
                        ></div>
                        <div
                          style={{ width: `${site.analytics.standardChannels.emailInternal}%` }}
                          className="bg-emerald-600 h-full"
                          title={`Internal/Email: ${site.analytics.standardChannels.emailInternal}%`}
                        ></div>
                        <div
                          style={{ width: `${site.analytics.standardChannels.social}%` }}
                          className="bg-amber-500 h-full"
                          title={`Social: ${site.analytics.standardChannels.social}%`}
                        ></div>
                      </div>
                    </td>

                    {/* GA Tag */}
                    <td className="py-3.5 px-4">
                      {site.analytics.measurementId ? (
                        <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {site.analytics.measurementId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">
                          Pending Tag
                        </span>
                      )}
                    </td>
                  </>
                ) : (
                  /* VIEW MODE: ACCESSIBILITY */
                  <>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {site.accessibility.overallScore}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Grade {site.accessibility.grade}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {site.accessibility.wcagLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-medium text-slate-800">
                        {site.accessibility.contrastRatio.ratio}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <span className="text-slate-600">
                        {site.coreFeatures.map((f) => f.title).join(', ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {site.architectureDetails.framework}
                    </td>
                  </>
                )}

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectSite(site)}
                      className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 rounded transition-colors"
                    >
                      Dossier
                    </button>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title="Open website directly"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
