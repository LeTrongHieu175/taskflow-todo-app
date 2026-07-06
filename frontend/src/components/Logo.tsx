interface LogoProps {
  size?: 'md' | 'lg';
}

export function Logo({ size = 'lg' }: LogoProps) {
  return (
    <div className={`brand-logo ${size === 'md' ? 'brand-logo-md' : 'brand-logo-lg'}`} role="img" aria-label="TaskFlow logo">
      <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
        <title>TaskFlow logo</title>
        <defs>
          <linearGradient id="taskflow-logo-gradient" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="taskflow-logo-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(248,250,252,0.94)" />
            <stop offset="100%" stopColor="rgba(191,219,254,0.9)" />
          </linearGradient>
        </defs>

        <rect x="15" y="13" width="28" height="20" rx="8" fill="url(#taskflow-logo-card)" opacity="0.78" />
        <rect x="20" y="20" width="29" height="20" rx="8" fill="url(#taskflow-logo-card)" opacity="0.62" />
        <rect x="25" y="27" width="24" height="19" rx="8" fill="url(#taskflow-logo-gradient)" />
        <path
          d="M31 36.5 35 40.5 43 31.5"
          fill="none"
          stroke="#f8fafc"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 45c4.4 3.5 11 5.5 18 5.5 11.5 0 20.8-4.7 20.8-10.5"
          fill="none"
          stroke="url(#taskflow-logo-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
