'use client';
import type { Provider } from '@/lib/ai/providers';
import { PROVIDER_MODELS } from '@/lib/ai/providers';

interface ProviderSelectorProps {
  value: Provider;
  onChange: (provider: Provider) => void;
  compact?: boolean;
}

const PROVIDERS: { id: Provider; label: string; short: string }[] = [
  { id: 'anthropic', label: 'Claude (Anthropic)', short: 'Claude' },
  { id: 'openai',    label: 'GPT-4o (OpenAI)',   short: 'GPT-4o' },
  { id: 'gemini',    label: 'Gemini (Google)',    short: 'Gemini' },
  { id: 'ollama',    label: 'Ollama (local)',      short: 'Ollama' },
];

export function ProviderSelector({ value, onChange, compact = false }: ProviderSelectorProps) {
  if (compact) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Provider)}
        className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
        title="AI model"
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>{p.short} — {PROVIDER_MODELS[p.id]}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Model</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Provider)}
        className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>{p.label} — {PROVIDER_MODELS[p.id]}</option>
        ))}
      </select>
    </div>
  );
}
