'use client';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to pastel' : 'Switch to dark'}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
      style={{
        color: 'var(--t3)',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--ac-08)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--t1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--t3)';
      }}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 1V2.5M7 11.5V13M13 7H11.5M2.5 7H1M11.2 2.8L10.2 3.8M3.8 10.2L2.8 11.2M11.2 11.2L10.2 10.2M3.8 3.8L2.8 2.8"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M12 8.5A5.5 5.5 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
