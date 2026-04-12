export default function Logo({ size = 36 }: { size?: number }) {
  const w = size * 2.2;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;
  const eyeRx = w * 0.46;
  const eyeRy = h * 0.46;
  const globeR = eyeRy * 0.82;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        {/* Sclera (eye white) */}
        <radialGradient id="logo-sclera" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8eaf6" />
        </radialGradient>

        {/* Globe ocean gradient */}
        <radialGradient id="logo-ocean" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>

        {/* Iris ring rainbow */}
        <linearGradient id="logo-iris-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="33%" stopColor="#10b981" />
          <stop offset="66%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Eyelid gradient top */}
        <linearGradient id="logo-lid-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="75%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Eyelid gradient bottom */}
        <linearGradient id="logo-lid-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Globe highlight */}
        <radialGradient id="logo-globe-shine" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        <clipPath id="logo-eye-clip">
          <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} />
        </clipPath>
      </defs>

      {/* Eye white */}
      <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill="url(#logo-sclera)" />

      {/* Iris rainbow ring */}
      <circle
        cx={cx}
        cy={cy}
        r={globeR + 3}
        fill="none"
        stroke="url(#logo-iris-ring)"
        strokeWidth="3"
        clipPath="url(#logo-eye-clip)"
      />

      {/* Globe — ocean base */}
      <circle cx={cx} cy={cy} r={globeR} fill="url(#logo-ocean)" clipPath="url(#logo-eye-clip)" />

      {/* Globe — continent shapes (simplified land masses) */}
      <g clipPath="url(#logo-eye-clip)">
        {/* North America */}
        <ellipse cx={cx - globeR * 0.38} cy={cy - globeR * 0.18} rx={globeR * 0.22} ry={globeR * 0.28} fill="#22c55e" opacity="0.9" transform={`rotate(-15,${cx - globeR * 0.38},${cy - globeR * 0.18})`} />
        {/* South America */}
        <ellipse cx={cx - globeR * 0.28} cy={cy + globeR * 0.28} rx={globeR * 0.14} ry={globeR * 0.22} fill="#16a34a" opacity="0.9" transform={`rotate(10,${cx - globeR * 0.28},${cy + globeR * 0.28})`} />
        {/* Europe */}
        <ellipse cx={cx + globeR * 0.05} cy={cy - globeR * 0.3} rx={globeR * 0.13} ry={globeR * 0.12} fill="#4ade80" opacity="0.85" />
        {/* Africa */}
        <ellipse cx={cx + globeR * 0.1} cy={cy + globeR * 0.08} rx={globeR * 0.16} ry={globeR * 0.27} fill="#22c55e" opacity="0.9" transform={`rotate(5,${cx + globeR * 0.1},${cy + globeR * 0.08})`} />
        {/* Asia */}
        <ellipse cx={cx + globeR * 0.38} cy={cy - globeR * 0.12} rx={globeR * 0.26} ry={globeR * 0.22} fill="#16a34a" opacity="0.85" transform={`rotate(-8,${cx + globeR * 0.38},${cy - globeR * 0.12})`} />
        {/* Australia */}
        <ellipse cx={cx + globeR * 0.42} cy={cy + globeR * 0.32} rx={globeR * 0.12} ry={globeR * 0.09} fill="#4ade80" opacity="0.85" />

        {/* Globe latitude lines */}
        <ellipse cx={cx} cy={cy} rx={globeR} ry={globeR * 0.22} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        <ellipse cx={cx} cy={cy} rx={globeR} ry={globeR * 0.55} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        {/* Globe vertical meridian */}
        <line x1={cx} y1={cy - globeR} x2={cx} y2={cy + globeR} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        <line x1={cx - globeR * 0.7} y1={cy - globeR * 0.72} x2={cx - globeR * 0.7} y2={cy + globeR * 0.72} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
        <line x1={cx + globeR * 0.7} y1={cy - globeR * 0.72} x2={cx + globeR * 0.7} y2={cy + globeR * 0.72} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />

        {/* Globe shine */}
        <circle cx={cx} cy={cy} r={globeR} fill="url(#logo-globe-shine)" />
      </g>

      {/* Upper eyelid shadow */}
      <ellipse
        cx={cx}
        cy={cy - eyeRy * 0.5}
        rx={eyeRx * 0.9}
        ry={eyeRy * 0.42}
        fill="rgba(0,0,0,0.07)"
        clipPath="url(#logo-eye-clip)"
      />

      {/* Eyelid outline — top (colorful) */}
      <path
        d={`M ${cx - eyeRx} ${cy} Q ${cx} ${cy - eyeRy * 1.3} ${cx + eyeRx} ${cy}`}
        fill="none"
        stroke="url(#logo-lid-top)"
        strokeWidth={size * 0.095}
        strokeLinecap="round"
      />

      {/* Eyelid outline — bottom */}
      <path
        d={`M ${cx - eyeRx * 0.88} ${cy + eyeRy * 0.18} Q ${cx} ${cy + eyeRy * 1.05} ${cx + eyeRx * 0.88} ${cy + eyeRy * 0.18}`}
        fill="none"
        stroke="url(#logo-lid-bottom)"
        strokeWidth={size * 0.07}
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Corner dots (inner/outer canthus) */}
      <circle cx={cx - eyeRx + size * 0.05} cy={cy} r={size * 0.06} fill="#f59e0b" />
      <circle cx={cx + eyeRx - size * 0.05} cy={cy} r={size * 0.06} fill="#10b981" />
    </svg>
  );
}
