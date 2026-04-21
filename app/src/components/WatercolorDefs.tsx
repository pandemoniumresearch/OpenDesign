export function WatercolorDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="watercolor-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="watercolor-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <radialGradient id="rg-lav" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--pigment-lavender)" stopOpacity="0.95" />
          <stop offset="60%" stopColor="var(--pigment-lavender)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--pigment-lavender)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg-peach" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--pigment-peach)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="var(--pigment-peach)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--pigment-peach)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg-mint" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--pigment-mint)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="var(--pigment-mint)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--pigment-mint)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg-butter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--pigment-butter)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="var(--pigment-butter)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--pigment-butter)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg-sky" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--pigment-sky)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="var(--pigment-sky)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--pigment-sky)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg-rose" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--pigment-rose)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="var(--pigment-rose)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--pigment-rose)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
