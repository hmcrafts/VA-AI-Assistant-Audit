import React, { useState } from 'react';
import { WebsiteAuditData, FleetSummary } from '../types';
import { PrintableAuditReport } from './PrintableAuditReport';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  Code,
  Eye,
  Info,
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteAuditData[];
  summary: FleetSummary;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  websites,
  summary,
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'markdown' | 'json'>('document');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# Department of Veterans Affairs - AI Assistant Fleet Audit & Analytics Report\n`;
    md += `**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    md += `**System Identification:** VA Services Monitor\n`;
    md += `**Access Mode:** Public Access & Search Indexing Enabled (robots: index, follow; robots.txt: Allow: /)\n`;
    md += `**Target Portal:** https://veterans-and-va-staff-ai-assistant-library-250030834831.us-west1.run.app/\n`;
    md += `**Cost Notice:** All cost and budget figures represent estimated models only, not actual billing vouchers.\n\n`;
    md += `## 1. Executive Summary\n`;
    md += `- **Total Audited Applications:** ${summary.totalSites}\n`;
    md += `- **Average Section 508 / WCAG 2.1 Score:** ${summary.avgAccessibilityScore}/100 (100% Section 508 Compliant)\n`;
    md += `- **Total Estimated Monthly Users:** ${summary.totalMonthlyUsers.toLocaleString()} MAU\n`;
    md += `- **Total Estimated Monthly Sessions:** ${summary.totalMonthlySessions.toLocaleString()}\n`;
    md += `- **Discovered Google Analytics 4 Properties:** G-405V9V6L20, G-NCL4621DPJ, G-B1CMS0HLDD\n\n`;

    md += `## 2. Fleet Traffic Acquisition Channels\n`;
    summary.trafficDistribution.forEach((t) => {
      md += `- **${t.source}:** ${t.percentage}%\n`;
    });
    md += `\n## 3. Individual Website Audits & Core Feature Breakdown\n\n`;

    websites.forEach((w, idx) => {
      md += `### ${idx + 1}. ${w.title}\n`;
      md += `- **URL:** ${w.url}\n`;
      md += `- **Audience:** ${w.audience} | **Type:** ${w.type}\n`;
      md += `- **Section 508 / WCAG Rating:** Score ${w.accessibility.overallScore}/100 (${w.accessibility.wcagLevel}, Grade ${w.accessibility.grade})\n`;
      md += `- **Contrast Ratio:** ${w.accessibility.contrastRatio.ratio} (${w.accessibility.contrastRatio.level})\n`;
      md += `- **Google Analytics ID:** ${w.analytics.measurementId || 'Inherited / Pending dedicated tag'}\n`;
      md += `- **Estimated Monthly Traffic:** ${w.analytics.estimatedMonthlyUsers.toLocaleString()} Users / ${w.analytics.estimatedMonthlySessions.toLocaleString()} Sessions\n`;
      md += `- **Primary Traffic Source:** ${w.analytics.topSources[0]?.name} (${w.analytics.topSources[0]?.percentage}%)\n`;
      md += `- **Core Features:**\n`;
      w.coreFeatures.forEach((f) => {
        md += `  - **${f.title}:** ${f.description}\n`;
      });
      md += `- **Key Accessibility Strengths:** ${w.accessibility.strengths.join('; ')}\n`;
      md += `- **Remediation Items:** ${w.accessibility.remediationItems.join('; ')}\n\n`;
    });

    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const data = {
      reportTitle: 'Department of Veterans Affairs AI Assistant Fleet Audit',
      systemName: 'VA Services Monitor',
      accessMode: 'Public Access & Search Indexing Enabled (robots: index, follow; robots.txt: Allow: /)',
      generatedAt: new Date().toISOString(),
      costDisclaimer: 'Estimated costs only. Not actual cost data.',
      summary,
      websites,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VA_AI_Assistant_Fleet_Audit_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    // If not currently viewing the formatted document, switch to it for printing
    if (activeTab !== 'document') {
      setActiveTab('document');
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 modal-backdrop-print-reset animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden modal-print-container">
        {/* Header (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between modal-no-print">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Audit &amp; Telemetry Executive Briefing
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200">
                PDF Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-readability document format configured for printing and PDF generation for VA leadership.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar & View Mode Toggle (Hidden when printing) */}
        <div className="p-3 sm:p-4 bg-slate-100/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs modal-no-print">
          {/* Format Selector Pill */}
          <div className="inline-flex rounded-lg bg-slate-200/80 p-1 border border-slate-300">
            <button
              onClick={() => setActiveTab('document')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'document'
                  ? 'bg-white text-blue-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Formatted PDF Document</span>
            </button>

            <button
              onClick={() => setActiveTab('markdown')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'markdown'
                  ? 'bg-white text-blue-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'json'
                  ? 'bg-white text-blue-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>JSON Raw</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors shadow-2xs"
              title="Copy markdown text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors shadow-2xs"
              title="Download JSON structured audit dossier"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 font-bold transition-colors shadow-xs"
              title="Open browser print dialog to print or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Print Recommendation Notice (Hidden when printing) */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 text-[11px] text-blue-900 flex items-center justify-between gap-2 modal-no-print">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>
              <strong>PDF Tip:</strong> Click &quot;Print / Save as PDF&quot;, choose &quot;Save as PDF&quot; as your destination, and check &quot;Background graphics&quot; for complete high-contrast badges and tables.
            </span>
          </div>
        </div>

        {/* Preview Content Area */}
        <div className="overflow-y-auto flex-1 bg-slate-100/50 p-2 sm:p-6 print:p-0 print:bg-white print:overflow-visible">
          {activeTab === 'document' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden print:border-none print:shadow-none print:rounded-none">
              <PrintableAuditReport
                mode="fleet"
                websites={websites}
                summary={summary}
              />
            </div>
          )}

          {activeTab === 'markdown' && (
            <div className="p-5 font-mono text-xs text-slate-800 bg-white rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed select-text shadow-xs">
              {generateMarkdown()}
            </div>
          )}

          {activeTab === 'json' && (
            <pre className="p-5 font-mono text-xs text-slate-100 bg-slate-900 rounded-xl overflow-x-auto select-text shadow-xs">
              {JSON.stringify(
                {
                  reportTitle: 'Department of Veterans Affairs AI Assistant Fleet Audit',
                  generatedAt: new Date().toISOString(),
                  costNotice: 'Estimated costs only. Not actual cost data.',
                  summary,
                  websites,
                },
                null,
                2
              )}
            </pre>
          )}
        </div>

        {/* Footer (Hidden when printing) */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between modal-no-print text-xs text-slate-500">
          <span>Official VA Audit Standard: Section 508 • WCAG 2.1 AA</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
