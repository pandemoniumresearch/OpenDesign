'use client';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '#overview',        label: 'Overview' },
  { href: '#getting-started', label: 'Getting started' },
  { href: '#generating',      label: 'Generating' },
  { href: '#design-tokens',   label: 'Design tokens' },
  { href: '#exporting',       label: 'Exporting' },
  { href: '#sharing',         label: 'Sharing' },
  { href: '#settings',        label: 'Settings' },
  { href: '#self-hosting',    label: 'Self-hosting' },
  { href: '#troubleshooting', label: 'Troubleshooting' },
];

export function DocsSidebar() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.href.slice(1));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-8% 0px -78% 0px', threshold: 0 },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside style={{ position: 'sticky', top: 32, width: 220, flexShrink: 0 }}>
      <div style={{
        fontSize: 10, fontFamily: 'var(--font-geist-mono)',
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: 'var(--ink-4)', marginBottom: 10,
      }}>
        On this page
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.href.slice(1);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                style={{
                  display: 'block', fontSize: 13, textDecoration: 'none',
                  padding: '6px 10px 6px 12px', borderRadius: 7,
                  color: isActive ? 'var(--ac)' : 'var(--ink-3)',
                  fontWeight: isActive ? 500 : 400,
                  background: isActive ? 'var(--ac-bg)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'var(--ac)' : 'transparent'}`,
                  transition: 'color 150ms, background 150ms, border-color 150ms',
                }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>

      <div style={{
        marginTop: 28, padding: '13px 14px',
        background: 'var(--ac-bg)', border: '1px solid var(--ac-bd-15)',
        borderRadius: 10,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ac)', marginBottom: 5 }}>
          Need help?
        </div>
        <a
          href="https://github.com/Pandemonium-Research/OpenDesign/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none', lineHeight: 1.5 }}
        >
          Open an issue on GitHub
        </a>
      </div>
    </aside>
  );
}
