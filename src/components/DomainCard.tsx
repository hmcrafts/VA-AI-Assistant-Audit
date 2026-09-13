import React from 'react';
import { WebsiteAuditData } from '../types';
import {
  ExternalLink,
  ShieldCheck,
  Users,
  Activity,
  ChevronRight,
  Radio,
  Clock,
  Sparkles,
  LayoutGrid,
  HeartPulse,
  MessageSquareText,
  FileSearch,
  ShieldAlert,
  BarChart3,
  SunMoon,
  Languages,
  BookOpen,
  Cpu,
} from 'lucide-react';

interface DomainCardProps {
  site: WebsiteAuditData;
  onSelectSite: (site: WebsiteAuditData) => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({ site, onSelectSite }) => {
  // Map feature icons
  const getFeatureIcon = (name: string) => {
    switch (name) {
      case 'LayoutGrid': return <LayoutGrid className="w-3.5 h-3.5" />;
      case 'HeartPulse': return <HeartPulse className="w-3.5 h-3.5" />;
      case 'MessageSquareText': return <MessageSquareText className="w-3.5 h-3.5" />;
      case 'FileSearch': return <FileSearch className="w-3.5 h-3.5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'BarChart3': return <BarChart3 className="w-3.5 h-3.5" />;
      case 'SunMoon': return <SunMoon className="w-3.5 h-3.5" />;
      case 'Languages': return <Languages className="w-3.5 h-3.5" />;
      case 'BookOpen': return <BookOpen className="w-3.5 h-3.5" />;
      case 'Cpu': return <Cpu className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getAudienceBadgeClass = (audience: string) => {
    switch (audience) {
      case 'Veterans':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'VA Staff':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      default:
        return 'bg-purple-100 text-purple-900 border-purple-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 93) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 88) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const topTrafficSource = site.analytics.topSources[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getAudienceBadgeClass(
                site.audience
              )}`}
            >
              {site.audience}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {site.type}
            </span>
            {site.status === 'Hub' || site.status === 'Production' ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-700 text-white">
                Primary Portal
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                Pilot
              </span>
            )}
          </div>

          {/* Accessibility Score Pill */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs shrink-0 ${getScoreColor(
              site.accessibility.overallScore
            )}`}
            title={`Accessibility: ${site.accessibility.overallScore}/100 - ${site.accessibility.wcagLevel}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Score {site.accessibility.overallScore}</span>
          </div>
        </div>

        {/* Title and Domain Link */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
          {site.title}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">{site.subtitle}</p>

        {/* Live URL Link */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/70 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="truncate flex-1">{site.domain}</span>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-700 hover:text-blue-900 shrink-0 ml-1 p-0.5 rounded hover:bg-slate-200"
            title="Launch website directly in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Narrative Description */}
        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {site.description}
        </p>

        {/* Core Features Preview */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Core Features ({site.coreFeatures.length})
          </span>
          <div className="space-y-1.5">
            {site.coreFeatures.slice(0, 2).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-blue-700 mt-0.5 shrink-0">{getFeatureIcon(feat.iconName)}</span>
                <span className="line-clamp-1 font-medium">{feat.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic & Telemetry Footer */}
      <div className="bg-slate-50/90 border-t border-slate-200 p-4">
        {/* Estimated Users & Top Channel */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold" title="Modeled benchmark estimate based on federal pilot heuristics">
            <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{site.analytics.estimatedMonthlyUsers.toLocaleString()}</span>
            <span className="text-slate-500 font-normal">est. users (model)</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{site.analytics.avgEngagementTime} avg</span>
          </div>
        </div>

        {/* Top traffic source progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="truncate">Top: {topTrafficSource.name}</span>
            <span className="font-semibold text-slate-700 ml-1">{topTrafficSource.percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-700 h-full rounded-full"
              style={{ width: `${topTrafficSource.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* GA Tag & View Details Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Radio className="w-3 h-3 text-emerald-600 shrink-0" />
            {site.analytics.measurementId ? (
              <span className="font-mono text-slate-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                {site.analytics.measurementId}
              </span>
            ) : (
              <span className="text-slate-500 italic text-[11px]">Pending Dedicated GA4</span>
            )}
          </div>

          <button
            onClick={() => onSelectSite(site)}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Review Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
