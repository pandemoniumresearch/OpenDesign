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

const selectStyle = {
  background: 'var(--bg-input)',
  border: '1px solid var(--bd-1)',
  color: 'var(--t2)',
} as React.CSSProperties;

export function ProviderSelector({ value, onChange, compact = false }: ProviderSelectorProps) {
  if (compact) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Provider)}
        className="rounded-md px-2 py-1 text-xs focus:outline-none transition-colors"
        style={selectStyle}
        title="AI model"
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>{p.short} /{PROVIDER_MODELS[p.id]}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--t4)' }}>Model</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Provider)}
        className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
        style={selectStyle}
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>{p.label} /{PROVIDER_MODELS[p.id]}</option>
        ))}
      </select>
    </div>
  );
}
