import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { WebsiteAuditData } from '../types';
import { X, Send, Sparkles, Bot, User, Loader2, Maximize2, Zap, BrainCircuit } from 'lucide-react';
import { GeminiModelType, ChatbotRoleId } from './GeminiChatbot';

interface AiFleetAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteAuditData[];
  onOpenFullChat?: () => void;
}

export const AiFleetAdvisor: React.FC<AiFleetAdvisorProps> = ({
  isOpen,
  onClose,
  websites,
  onOpenFullChat,
}) => {
  const [roleId, setRoleId] = useState<ChatbotRoleId>('accessibility_specialist');
  const [model, setModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; modelUsed?: string }>
  >([
    {
      role: 'assistant',
      text: 'Hello! I am the **VA Assistant Fleet Advisor** powered by Gemini. I can perform Section 508 accessibility audits, analyze GA4 traffic telemetry, and compare features across all 10 VA AI Assistant applications.',
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, text: q }];
    setMessages(newMessages);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const apiHistory = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: apiHistory.slice(0, -1),
          model,
          roleId,
        }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: data.answer || 'No response received',
          modelUsed: data.modelUsed || model,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: '⚠️ Error contacting AI fleet advisor. Please verify server connectivity.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Which tools have the highest Section 508 accessibility ratings?',
    'Summarize Google Analytics traffic sources for the VA Benefits Copilot.',
    'What features distinguish the VA DD-214 Copilot from other assistants?',
    'Are bilingual features (Spanish) accessible for screen readers?',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">Gemini Fleet Advisor</h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded">
                  Multi-Turn
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Grounded in the 10 VA AI Assistant websites</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenFullChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullChat();
                }}
                className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                title="Expand to Full View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role & Model Controls Strip */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500">Role:</span>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value as ChatbotRoleId)}
              className="text-xs font-semibold py-1 px-1.5 rounded border border-slate-300 bg-white text-slate-800"
            >
              <option value="accessibility_specialist">Section 508 Auditor</option>
              <option value="traffic_analyst">GA4 Traffic Strategist</option>
              <option value="fleet_architect">Fleet Architect</option>
              <option value="executive_advisor">Policy Advisor</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500">Model:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as GeminiModelType)}
              className="text-xs font-bold py-1 px-1.5 rounded border border-slate-300 bg-white text-indigo-900"
            >
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
            </select>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3 rounded-xl max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-blue-700 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80'
                }`}
              >
                {m.role === 'user' ? (
                  m.text
                ) : (
                  <div className="markdown-body space-y-1.5 text-xs text-slate-800 break-words">
                    <Markdown>{m.text}</Markdown>
                  </div>
                )}
                {m.modelUsed && m.role === 'assistant' && (
                  <div className="mt-1 pt-1 border-t border-slate-200/60 text-[10px] text-indigo-700 font-mono">
                    {m.modelUsed}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Consulting Gemini ({model})...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Inquiries:
          </span>
          <div className="flex flex-wrap gap-1">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 text-left truncate max-w-full"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-slate-200 bg-white flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about accessibility, features, or traffic..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

