'use client';

import { useState } from 'react';

type KeyStatus = { isSet: boolean; masked?: string };

interface Props {
  initialStatus: {
    anthropic: KeyStatus;
    openai: KeyStatus;
    google: KeyStatus;
  };
}

interface ProviderConfig {
  id: 'anthropic' | 'openai' | 'google';
  label: string;
  description: string;
  placeholder: string;
  docsUrl: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'Powers Claude models (claude-sonnet-4-6). Required for the default provider.',
    placeholder: 'sk-ant-api03-…',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'Powers GPT-4o. Select OpenAI as the provider in the editor.',
    placeholder: 'sk-…',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'google',
    label: 'Google Gemini',
    description: 'Powers Gemini 2.0 Flash. Select Gemini as the provider in the editor.',
    placeholder: 'AIzaSy…',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
];

function StatusDot({ isSet }: { isSet: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: isSet ? '#3daa78' : 'var(--rule-2)',
      boxShadow: isSet ? '0 0 8px rgba(61,170,120,0.5)' : 'none',
      flexShrink: 0,
    }} />
  );
}

function ProviderCard({ config, status }: { config: ProviderConfig; status: KeyStatus }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  async function save() {
    if (!value.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [config.id]: value.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      const masked = value.trim().length <= 4 ? '••••' : `••••••••${value.trim().slice(-4)}`;
      setCurrentStatus({ isSet: true, masked });
      setValue('');
      setEditing(false);
      setFeedback({ type: 'ok', msg: 'Saved' });
    } catch (e: unknown) {
      setFeedback({ type: 'err', msg: e instanceof Error ? e.message : 'Error' });
    } finally {
      setLoading(false);
    }
  }

  async function clear() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [config.id]: null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setCurrentStatus({ isSet: false });
      setEditing(false);
      setFeedback({ type: 'ok', msg: 'Removed' });
    } catch (e: unknown) {
      setFeedback({ type: 'err', msg: e instanceof Error ? e.message : 'Error' });
    } finally {
      setLoading(false);
    }
  }

  function cancel() {
    setValue('');
    setEditing(false);
    setFeedback(null);
  }

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--rule)',
      borderRadius: 16,
      padding: '24px 24px 20px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <StatusDot isSet={currentStatus.isSet} />
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{config.label}</span>
            {currentStatus.isSet && (
              <span style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: 11,
                color: 'var(--ink-4)',
                background: 'var(--paper-2)',
                border: '1px solid var(--rule)',
                borderRadius: 6,
                padding: '1px 7px',
              }}>
                {currentStatus.masked}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
            {config.description}{' '}
            <a href={config.docsUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--ac)', textDecoration: 'none' }}>
              Get key →
            </a>
          </p>
        </div>

        {!editing && (
          <button
            onClick={() => { setEditing(true); setFeedback(null); }}
            style={{
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 500,
              padding: '7px 14px',
              borderRadius: 999,
              border: '1px solid var(--rule-2)',
              background: 'transparent',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              transition: 'border-color 150ms, color 150ms',
            }}
          >
            {currentStatus.isSet ? 'Replace' : 'Add key'}
          </button>
        )}
      </div>

      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="password"
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            placeholder={config.placeholder}
            style={{
              width: '100%',
              fontFamily: 'var(--font-geist-mono)',
              fontSize: 13,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--rule-2)',
              background: 'var(--paper-2)',
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={save}
              disabled={loading || !value.trim()}
              className="btn-wc-primary"
              style={{ fontSize: 13, padding: '8px 18px', opacity: loading || !value.trim() ? 0.5 : 1 }}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={cancel}
              style={{
                fontSize: 13, padding: '8px 14px', borderRadius: 999,
                border: '1px solid var(--rule)', background: 'transparent',
                color: 'var(--ink-3)', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            {currentStatus.isSet && (
              <button
                onClick={clear}
                disabled={loading}
                style={{
                  fontSize: 13, padding: '8px 14px', borderRadius: 999,
                  border: '1px solid var(--err-bd)', background: 'transparent',
                  color: 'var(--err)', cursor: 'pointer', marginLeft: 'auto',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Remove key
              </button>
            )}
          </div>
        </div>
      )}

      {feedback && (
        <p style={{
          fontSize: 12,
          marginTop: 10,
          color: feedback.type === 'ok' ? 'var(--ok)' : 'var(--err)',
          fontFamily: 'var(--font-geist-mono)',
        }}>
          {feedback.type === 'ok' ? '✓ ' : '✗ '}{feedback.msg}
        </p>
      )}
    </div>
  );
}

export function SettingsClient({ initialStatus }: Props) {
  return (
    <div>
      <div style={{
        background: 'var(--ac-bg)',
        border: '1px solid var(--ac-bd-15)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 28,
        fontSize: 13,
        color: 'var(--ac)',
        lineHeight: 1.55,
      }}>
        Keys are encrypted with AES-256-GCM before storage. They are used only to call AI APIs on your behalf.
      </div>

      {PROVIDERS.map(p => (
        <ProviderCard key={p.id} config={p} status={initialStatus[p.id]} />
      ))}

      <div style={{
        marginTop: 24,
        padding: '18px 24px',
        borderRadius: 16,
        border: '1px dashed var(--rule-2)',
        fontSize: 13,
        color: 'var(--ink-4)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Ollama (local)</strong>
        No key required. Runs on your own machine — configure the endpoint in your environment variables.
      </div>
    </div>
  );
}
