import React, { useState } from 'react';
import { WebsiteAuditData } from '../types';
import {
  X,
  Radio,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Database,
  Key,
  AlertCircle,
  FileCode,
  Sparkles,
  Play,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AnalyticsActionModalProps {
  site: WebsiteAuditData | null;
  onClose: () => void;
}

export const AnalyticsActionModal: React.FC<AnalyticsActionModalProps> = ({
  site,
  onClose,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [isTestingQuery, setIsTestingQuery] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  if (!site) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleTestQuery = async () => {
    const propertyId = site.analytics.measurementId ? '40599620' : '40599620';
    setIsTestingQuery(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ga4/run-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, startDate: '30daysAgo', endDate: 'today' }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTestingQuery(false);
    }
  };

  const hasTag = Boolean(site.analytics.measurementId);
  const measurementId = site.analytics.measurementId || 'G-XXXXXXXXXX';

  const clientGtagSnippet = `<!-- Google tag (gtag.js) for ${site.title} -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // Privacy-preserving configuration complying with Federal OMB guidance
  gtag('config', '${measurementId}', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure',
    'send_page_view': true
  });
</script>`;

  const dapFederalSnippet = `<!-- GSA Digital Analytics Program (DAP) Unified Federal Tag -->
<script async type="text/javascript" id="_fed_an_ua_tag"
  src="https://dap.digitalgov.gov/Universal-Federated-Analytics-Min.js?agency=VA&subagency=VBA&sp=lookup,query&dclink=true">
</script>`;

  const nodeApiSnippet = `import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsClient = new BetaAnalyticsDataClient();

async function fetchActualMetrics(propertyId) {
  const [response] = await analyticsClient.runReport({
    property: \`properties/\${propertyId}\`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
  });
  return response.rows;
}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                Action Plan & Data Provenance
              </span>
              <span className="text-xs font-mono text-slate-500 truncate max-w-xs">{site.domain}</span>
            </div>
            <h3 id="action-modal-title" className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Data Ingestion Playbook: {site.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Review current telemetry status and follow recommended actions to connect verifiable actual traffic.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Current Status Card */}
          <div className={`p-4 rounded-xl border ${hasTag ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {hasTag ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                )}
                <span className="font-bold text-slate-900">
                  Current Status:{' '}
                  {hasTag
                    ? `Verified Stream Active (${site.analytics.measurementId})`
                    : 'Uninstrumented Pilot Application'}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${hasTag ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                {hasTag ? 'Tag Present' : 'Tag Missing'}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-700">
              {hasTag ? (
                <>
                  The measurement tag <strong>{site.analytics.measurementId}</strong> was directly verified in this application&apos;s running client-side source code. However, the traffic volume figures (<strong>{site.analytics.estimatedMonthlyUsers.toLocaleString()} monthly users</strong>) are modeled benchmark estimates because an authenticated Google Analytics Data API service account has not yet been linked to this audit portal.
                </>
              ) : (
                <>
                  This pilot micro-app does not currently contain an active Google Analytics 4 tag in its DOM. The traffic metrics shown (<strong>{site.analytics.estimatedMonthlyUsers.toLocaleString()} monthly users</strong>) are benchmark model projections based on federal digital service heuristics.
                </>
              )}
            </p>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Recommended Steps to Acquire Actual Verifiable Data
            </h4>

            {/* Action 1: Client Tag Deployment (if missing) */}
            {!hasTag && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center">
                      1
                    </span>
                    <span className="font-bold text-slate-900">Deploy Google Tag (gtag.js) to HTML &lt;head&gt;</span>
                  </div>
                  <button
                    onClick={() => handleCopy(clientGtagSnippet, 'gtag')}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-300 text-blue-700 hover:bg-blue-50"
                  >
                    {copiedSnippet === 'gtag' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'gtag' ? 'Copied' : 'Copy Snippet'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  Insert this privacy-preserving snippet into the application&apos;s root <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">index.html</code> file:
                </p>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {clientGtagSnippet}
                </pre>
              </div>
            )}

            {/* Action 2: GSA Digital Analytics Program (DAP) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center">
                    {hasTag ? '1' : '2'}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Participate in GSA Digital Analytics Program (DAP)</span>
                    <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Federal Standard
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(dapFederalSnippet, 'dap')}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-300 text-blue-700 hover:bg-blue-50"
                >
                  {copiedSnippet === 'dap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'dap' ? 'Copied' : 'Copy Tag'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600">
                To have this assistant&apos;s visits publicly verified on <a href="https://analytics.usa.gov" target="_blank" rel="noreferrer" className="text-blue-700 underline font-medium inline-flex items-center gap-0.5">analytics.usa.gov <ExternalLink className="w-2.5 h-2.5" /></a>, embed the federal DAP unified tag:
              </p>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                {dapFederalSnippet}
              </pre>
            </div>

            {/* Action 3: Google Analytics Data API Ingestion */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center">
                    {hasTag ? '2' : '3'}
                  </span>
                  <span className="font-bold text-slate-900">Query Live Telemetry via GA4 Data API (v1beta)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestQuery}
                    disabled={isTestingQuery}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white shadow-2xs transition-colors"
                  >
                    {isTestingQuery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Test fetchActualMetrics</span>
                  </button>
                  <button
                    onClick={() => handleCopy(nodeApiSnippet, 'node')}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-300 text-blue-700 hover:bg-blue-50"
                  >
                    {copiedSnippet === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'node' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Create a Google Cloud Service Account with <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">roles/analytics.viewer</code> permission on the GA4 property. Use the official client to automate reporting:
              </p>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                {nodeApiSnippet}
              </pre>

              {testResult && (
                <div className="p-2.5 rounded-lg border border-slate-300 bg-white text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {testResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>Server Query Status ({testResult.success ? 'Success' : 'Credentials Notice'})</span>
                  </div>
                  {testResult.success ? (
                    <div className="text-[11px] text-slate-700 font-mono">
                      Received {testResult.rowCount} rows from GA4 Data API via <code className="text-blue-700">fetchActualMetrics</code>.
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-900 leading-relaxed">
                      {testResult.error || 'Server BetaAnalyticsDataClient is ready. Set GA4_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS to query live data.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action 4: BigQuery Streaming Export */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center">
                  {hasTag ? '3' : '4'}
                </span>
                <span className="font-bold text-slate-900">Configure BigQuery Streaming Export for Audit Records</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In the Google Analytics 4 admin console, navigate to <strong>Property &gt; BigQuery Links</strong>. Link your VA Google Cloud Project to stream raw un-sampled event logs into a BigQuery dataset (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">analytics_&lt;property_id&gt;.events_*</code>). This provides tamper-evident, SQL-queryable audit trails.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Adheres to OMB M-17-06 Policies for Federal Public Websites and Digital Services
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
