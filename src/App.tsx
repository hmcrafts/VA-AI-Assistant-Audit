import React, { useState, useEffect, useMemo } from 'react';
import { WebsiteAuditData, FleetSummary, AudienceType } from './types';
import { VA_WEBSITES_DATA, FLEET_SUMMARY } from './data/vaWebsitesData';
import { Header } from './components/Header';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { DomainCard } from './components/DomainCard';
import { DomainDetailModal } from './components/DomainDetailModal';
import { ComparativeTable } from './components/ComparativeTable';
import { GoogleAnalyticsExplorer } from './components/GoogleAnalyticsExplorer';
import { CloudBillingAnalytics } from './components/CloudBillingAnalytics';
import { LiveAuditor } from './components/LiveAuditor';
import { AiFleetAdvisor } from './components/AiFleetAdvisor';
import { GeminiChatbot } from './components/GeminiChatbot';
import { ExportReportModal } from './components/ExportReportModal';
import { ShieldCheck, Sparkles, ExternalLink, Filter } from 'lucide-react';

export function App() {
  const [websites, setWebsites] = useState<WebsiteAuditData[]>(VA_WEBSITES_DATA);
  const [summary, setSummary] = useState<FleetSummary>(FLEET_SUMMARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<'All' | AudienceType>('All');
  const [activeView, setActiveView] = useState<'cards' | 'table' | 'analytics' | 'billing' | 'auditor' | 'chatbot'>('cards');
  const [selectedSite, setSelectedSite] = useState<WebsiteAuditData | null>(null);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch from server on mount
  useEffect(() => {
    fetch('/api/websites')
      .then((res) => res.json())
      .then((data) => {
        if (data.websites && data.websites.length > 0) {
          setWebsites(data.websites);
        }
        if (data.summary) {
          setSummary(data.summary);
        }
      })
      .catch((err) => {
        console.warn('Using client-side fallback data:', err);
      });
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Live crawl across all 10 Cloud Run microservices to detect GA4 tags and status
      const res = await fetch('/api/analytics/recheck-tags');
      const data = await res.json();
      if (data.websites && data.websites.length > 0) {
        setWebsites(data.websites);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.warn('Live tag recheck error, falling back to cached websites data:', e);
      try {
        const fallbackRes = await fetch('/api/websites');
        const fallbackData = await fallbackRes.json();
        if (fallbackData.websites) setWebsites(fallbackData.websites);
        if (fallbackData.summary) setSummary(fallbackData.summary);
      } catch (err) {
        console.error(err);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Filtered websites
  const filteredWebsites = useMemo(() => {
    return websites.filter((site) => {
      // Audience filter
      if (selectedAudience !== 'All' && site.audience !== selectedAudience) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = site.title.toLowerCase().includes(q);
        const matchesDomain = site.domain.toLowerCase().includes(q);
        const matchesDesc = site.description.toLowerCase().includes(q);
        const matchesTag = site.tags.some((t) => t.toLowerCase().includes(q));
        const matchesFeatures = site.coreFeatures.some((f) =>
          f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
        );
        const matchesGA = site.analytics.measurementId?.toLowerCase().includes(q);
        return matchesTitle || matchesDomain || matchesDesc || matchesTag || matchesFeatures || matchesGA;
      }
      return true;
    });
  }, [websites, selectedAudience, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-200">
      {/* Navigation Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isRefreshing={isRefreshing}
        onRefreshAll={handleRefreshAll}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Executive Summary Cards */}
        <ExecutiveSummary
          summary={summary}
          selectedAudience={selectedAudience}
          onSelectAudience={setSelectedAudience}
          totalFiltered={filteredWebsites.length}
        />

        {/* View 1: Domain Cards Grid */}
        {activeView === 'cards' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Audited Applications ({filteredWebsites.length})
                </h3>
                {searchQuery && (
                  <span className="text-xs text-slate-500 font-medium">
                    Matching "{searchQuery}"
                  </span>
                )}
              </div>

              <span className="text-xs text-slate-500">
                Click any application card for Section 508 & traffic deep-dive
              </span>
            </div>

            {filteredWebsites.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <Filter className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No applications found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No websites in the VA AI library match your current audience or search filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAudience('All');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWebsites.map((site) => (
                  <DomainCard
                    key={site.id}
                    site={site}
                    onSelectSite={setSelectedSite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* View 2: Comparative Matrix */}
        {activeView === 'table' && (
          <ComparativeTable
            websites={websites}
            onSelectSite={setSelectedSite}
          />
        )}

        {/* View 3: Google Analytics Hub */}
        {activeView === 'analytics' && (
          <GoogleAnalyticsExplorer
            websites={websites}
            onSelectSite={setSelectedSite}
            onWebsitesUpdated={(updatedSites, updatedSummary) => {
              setWebsites(updatedSites);
              if (updatedSummary) setSummary(updatedSummary);
            }}
          />
        )}

        {/* View 4: Cloud Infrastructure Billing & Cost Analytics */}
        {activeView === 'billing' && (
          <CloudBillingAnalytics
            websites={websites}
            onSelectSite={setSelectedSite}
          />
        )}

        {/* View 5: Live URL Inspector */}
        {activeView === 'auditor' && (
          <LiveAuditor
            websites={websites}
            onSelectSite={setSelectedSite}
          />
        )}

        {/* View 5: Gemini Chatbot */}
        {activeView === 'chatbot' && (
          <GeminiChatbot
            websites={websites}
            initialWebsiteId={selectedSite?.id}
            onSelectSite={setSelectedSite}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              VA
            </span>
            <span className="font-semibold text-slate-300">
              Department of Veterans Affairs AI Services Audit System
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Section 508 Standards</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliance</span>
            <span>•</span>
            <span>Google Analytics 4 Telemetry</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <DomainDetailModal
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
        onConsultChatbot={(site) => {
          setSelectedSite(site);
          setActiveView('chatbot');
        }}
      />

      <AiFleetAdvisor
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        websites={websites}
        onOpenFullChat={() => setActiveView('chatbot')}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        websites={websites}
        summary={summary}
      />
    </div>
  );
}

export default App;
