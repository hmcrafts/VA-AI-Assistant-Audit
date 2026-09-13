import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { WebsiteAuditData } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  Download,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Settings2,
  Zap,
  BrainCircuit,
  Scale,
  Activity,
  Compass,
  FileCheck2,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  Info,
  DollarSign,
} from 'lucide-react';

export type GeminiModelType = 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

export type ChatbotRoleId =
  | 'accessibility_specialist'
  | 'traffic_analyst'
  | 'fleet_architect'
  | 'executive_advisor'
  | 'cloud_cost_analyst';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleUsed?: string;
}

interface GeminiChatbotProps {
  websites: WebsiteAuditData[];
  initialWebsiteId?: string;
  onSelectSite?: (site: WebsiteAuditData) => void;
}

const ROLES: Array<{
  id: ChatbotRoleId;
  name: string;
  shortName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  defaultPrompt: string;
  recommendedModel: GeminiModelType;
  starterQuestions: string[];
}> = [
  {
    id: 'accessibility_specialist',
    name: 'Section 508 & WCAG Accessibility Lead Auditor',
    shortName: 'Section 508 Auditor',
    description: 'Expert on WCAG 2.1 AA/AAA compliance, contrast thresholds, ARIA semantics, and screen-reader workflows.',
    icon: Scale,
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    defaultPrompt:
      'You are the Senior Section 508 & WCAG Accessibility Compliance Officer for the U.S. Department of Veterans Affairs.',
    recommendedModel: 'gemini-3.5-flash',
    starterQuestions: [
      'Which websites have the highest and lowest Section 508 compliance scores?',
      'How do the contrast ratios compare across the 10 websites?',
      'What are the priority remediation items for the VA Benefits Assistant?',
      'Are the Spanish translation features in the Staff Skills Survey accessible to screen readers?',
    ],
  },
  {
    id: 'traffic_analyst',
    name: 'Google Analytics & Digital Traffic Strategist',
    shortName: 'GA4 Traffic Strategist',
    description: 'Specializes in GA4 measurement tags, user volume, channel attribution, bounce rates, and traffic estimation.',
    icon: Activity,
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    defaultPrompt:
      'You are the Lead Digital Analytics & Traffic Strategist for VA Digital Services specializing in GA4 telemetry and multi-channel attribution.',
    recommendedModel: 'gemini-3.5-flash',
    starterQuestions: [
      'Summarize the Google Analytics 4 properties discovered across the library.',
      'Which website receives the largest share of organic search traffic and why?',
      'Compare estimated monthly active users between Veteran-facing and Staff-facing tools.',
      'How does the Library Portal function as a central referral hub for the other 9 tools?',
    ],
  },
  {
    id: 'fleet_architect',
    name: 'VA Fleet Product & Features Architect',
    shortName: 'Fleet Architect',
    description: 'Evaluates functional overlap, system integrations (ServiceNow, PIV, EHRM, FAR), and UX workflows.',
    icon: Compass,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    defaultPrompt:
      'You are the Chief Enterprise Architect evaluating the core features, integrations, and technical architecture of all 10 VA AI applications.',
    recommendedModel: 'gemini-3.1-pro-preview',
    starterQuestions: [
      'What core capabilities differentiate the VA DD-214 Copilot from generic AI assistants?',
      'How do the VA Supply Chain and VA Budget Insight tools integrate federal compliance standards?',
      'Compare the technical stacks across the 10 Cloud Run micro-applications.',
      'What architectural improvements would you recommend for the ServiceNow ticketing agent?',
    ],
  },
  {
    id: 'executive_advisor',
    name: 'Executive Policy & Modernization Advisor',
    shortName: 'Policy Advisor',
    description: 'Generates decision-ready briefings, compliance memos, risk assessments, and resource allocation roadmaps.',
    icon: FileCheck2,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    defaultPrompt:
      'You are the Executive Policy Advisor to the VA Under Secretary providing strategic, high-level briefing summaries.',
    recommendedModel: 'gemini-3.1-flash-lite',
    starterQuestions: [
      'Provide a 3-bullet executive briefing on the overall health and compliance of the VA AI Assistant fleet.',
      'What are the key policy and security considerations for staff using the Supervisory Copilot?',
      'Draft a leadership memo summarizing constituent adoption of the VA Veteran Dashboard.',
      'What ROI or efficiency metrics should be tracked for the automated ServiceNow assistant?',
    ],
  },
  {
    id: 'cloud_cost_analyst',
    name: 'Cloud Infrastructure & FinOps Lead',
    shortName: 'Cloud FinOps Lead',
    description: 'Expert on Google Cloud Run compute costs, Gemini API token consumption, Section 508 non-visual chart compliance, and FY2026 budget forecasting.',
    icon: DollarSign,
    badgeColor: 'bg-blue-100 text-blue-950 border-blue-300',
    defaultPrompt:
      'You are the Principal Cloud Infrastructure & FinOps Lead for the VA Office of Information & Technology (OIT). You analyze GCP Cloud Run hosting, Gemini API token costs, and Section 508 non-visual chart compliance for VA Budget Insight AI and the Library Portal.',
    recommendedModel: 'gemini-3.5-flash',
    starterQuestions: [
      'Compare hosting and token expenses between VA Budget Insight AI and the Library Portal backend.',
      'How does VA Budget Insight AI comply with WCAG 2.1 SC 1.1.1 (Non-text Content) for fiscal cost charts?',
      'What is our projected monthly burn rate across the 10 Cloud Run micro-apps if query volume surges?',
      'How can we leverage BigQuery Google Cloud Billing exports to track real-time container CPU-hours in us-west1?',
    ],
  },
];

const MODELS: Array<{
  id: GeminiModelType;
  label: string;
  tag: string;
  speed: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'gemini-3.1-flash-lite',
    label: 'gemini-3.1-flash-lite',
    tag: '⚡ Fast & Low Latency',
    speed: '< 1s latency',
    description: 'Optimized for rapid Q&A, fast lookups, and immediate answers.',
    icon: Zap,
  },
  {
    id: 'gemini-3.5-flash',
    label: 'gemini-3.5-flash',
    tag: '🧠 General Fleet Analysis',
    speed: '~ 2s latency',
    description: 'Default model for rich multi-turn reasoning and balanced answers.',
    icon: Sparkles,
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'gemini-3.1-pro-preview',
    tag: '🔬 Deep Complex Reasoning',
    speed: '~ 4s latency',
    description: 'Deep architectural audits, complex policy reasoning, and detailed VPAT evaluations.',
    icon: BrainCircuit,
  },
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  websites,
  initialWebsiteId,
  onSelectSite,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatbotRoleId>('accessibility_specialist');
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [focusedWebsiteId, setFocusedWebsiteId] = useState<string>(initialWebsiteId || 'all');
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>('');
  const [isSystemConfigOpen, setIsSystemConfigOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multi-turn conversation history state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      text: `### Welcome to the VA AI Assistant Fleet Intelligence Chatbot
I am grounded in the comprehensive empirical audit data of all **10 digital applications** in the [VA AI Assistant Library](https://veterans-and-va-staff-ai-assistant-library-250030834831.us-west1.run.app/).

**Available Capabilities:**
- **Section 508 & WCAG Audits**: Contrast ratios, screen-reader semantics, remediation steps
- **Google Analytics 4 Intelligence**: Measurement IDs (\`G-405V9V6L20\`, \`G-NCL4621DPJ\`, \`G-B1CMS0HLDD\`), monthly active users, and traffic channels
- **Feature Deep-Dives**: Detailed functional walkthroughs of tools for Veterans and VA Staff

Select a persona role or model above, or select any of the starter prompts below to begin our conversation!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      roleUsed: 'Section 508 & WCAG Accessibility Lead Auditor',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePersona = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessageObj: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessageObj];
    setMessages(newHistory);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare history excluding the initial welcome message for leaner token transmission
      const apiHistory = newHistory
        .filter((m) => m.id !== 'welcome-message')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: apiHistory.slice(0, -1), // previous turns
          model: selectedModel,
          roleId: selectedRole,
          customSystemInstruction: customSystemInstruction.trim() || undefined,
          websiteId: focusedWebsiteId !== 'all' ? focusedWebsiteId : undefined,
        }),
      });

      const data = await res.json();

      const assistantMessageObj: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.answer || 'No response text received from model.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        roleUsed: data.roleUsed || activePersona.name,
      };

      setMessages((prev) => [...prev, assistantMessageObj]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Connection Error**: Unable to complete the request with Gemini.\n\n*Details:* ${err.message || 'Server communication error'}. Please verify backend server connectivity.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear conversation history and restart with a fresh session?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          text: `Conversation history cleared. Ready for your questions as **${activePersona.name}** using **${selectedModel}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
          roleUsed: activePersona.name,
        },
      ]);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTranscript = () => {
    let transcript = `# VA AI Assistant Fleet - Gemini Chat Transcript\n`;
    transcript += `**Date:** ${new Date().toLocaleString()}\n`;
    transcript += `**Active Role:** ${activePersona.name}\n`;
    transcript += `**Active Model:** ${selectedModel}\n`;
    transcript += `**Scope:** ${focusedWebsiteId === 'all' ? 'All 10 VA AI Assistant Websites' : focusedWebsiteId}\n\n`;
    transcript += `---\n\n`;

    messages.forEach((m) => {
      transcript += `### [${m.timestamp}] ${m.role === 'user' ? 'USER' : `GEMINI (${m.roleUsed || activePersona.shortName})`}\n\n`;
      transcript += `${m.text}\n\n`;
    });

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VA_AI_Chat_Transcript_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[750px] max-h-[85vh]">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Header Title & Status */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Gemini Multi-Turn Intelligence Assistant
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    Live Multi-Turn
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Role-grounded consultation across Section 508, Google Analytics, and feature audits.
                </p>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Website Focus Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-semibold hidden sm:inline">Scope:</span>
              <select
                value={focusedWebsiteId}
                onChange={(e) => setFocusedWebsiteId(e.target.value)}
                className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 max-w-[200px] truncate"
              >
                <option value="all">Entire Fleet (10 Websites)</option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-1 text-xs">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModelType)}
                className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                title="Select Gemini Model"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.tag.split(' ')[1] || m.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* System Instruction Drawer Toggle */}
            <button
              onClick={() => setIsSystemConfigOpen(!isSystemConfigOpen)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isSystemConfigOpen
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="Configure Role & System Instructions"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">System Instruction</span>
              {isSystemConfigOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Export Transcript */}
            <button
              onClick={handleExportTranscript}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Download Conversation Transcript (.md)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Clear History */}
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
              title="Clear Conversation History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Persona Roles Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Chatbot Role:
          </span>
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  // also update suggested model for this role
                  setSelectedModel(role.recommendedModel);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{role.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* System Instruction / Persona Configuration Drawer */}
        {isSystemConfigOpen && (
          <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                Active System Persona: {activePersona.name}
              </span>
              <span className="text-[11px] text-slate-500">
                Recommended Model: <strong className="text-slate-700">{activePersona.recommendedModel}</strong>
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-2 rounded border border-slate-100 font-mono">
              {activePersona.defaultPrompt}
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Add Custom System Instruction Directives (Optional):
              </label>
              <input
                type="text"
                value={customSystemInstruction}
                onChange={(e) => setCustomSystemInstruction(e.target.value)}
                placeholder="e.g., 'Format all numerical answers in markdown tables', 'Focus on mobile viewport'..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Message Thread Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`flex flex-col ${
                  isUser ? 'items-end' : 'items-start'
                } max-w-[90%] sm:max-w-[85%]`}
              >
                {/* Message Header / Meta */}
                <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600">
                    {isUser ? 'You' : message.roleUsed || activePersona.shortName}
                  </span>
                  <span>•</span>
                  <span>{message.timestamp}</span>
                  {!isUser && message.modelUsed && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                        {message.modelUsed}
                      </span>
                    </>
                  )}
                </div>

                {/* Message Body */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                    isUser
                      ? 'bg-blue-700 text-white font-medium rounded-tr-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <div className="markdown-body space-y-2 text-slate-800 leading-relaxed break-words">
                      <Markdown>{message.text}</Markdown>
                    </div>
                  )}

                  {/* Copy Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(message.text, message.id)}
                      className="absolute bottom-2 right-2 p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy message"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-600 shadow-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>
                <strong>{activePersona.name}</strong> is generating answer using{' '}
                <code className="font-mono font-semibold text-indigo-700">{selectedModel}</code>...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries / Prompt Chips */}
      <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-2 overflow-x-auto select-none">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          Suggested Prompts:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {activePersona.starterQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md border border-slate-300 font-medium transition-colors truncate max-w-xs shadow-2xs disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ${activePersona.shortName} about accessibility, GA4 traffic, or feature architecture...`}
          disabled={isLoading}
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
