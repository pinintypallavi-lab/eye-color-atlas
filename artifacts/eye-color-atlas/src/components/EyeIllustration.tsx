import { useId } from "react";

interface EyeIllustrationProps {
  irisColor: string;
  size?: number;
  selected?: boolean;
  label?: string;
  onClick?: () => void;
}

export default function EyeIllustration({
  irisColor,
  size = 80,
  selected = false,
  label,
  onClick,
}: EyeIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const w = size;
  const h = size * 0.68;
  const cx = w / 2;
  const cy = h / 2;
  const eyeRx = w * 0.44;
  const eyeRy = h * 0.46;
  const irisR = Math.min(eyeRx, eyeRy) * 0.82;
  const pupilR = irisR * 0.48;

  const gIris = `ig${uid}`;
  const gPupil = `pg${uid}`;
  const gSclera = `sg${uid}`;
  const gFiber = `fg${uid}`;
  const clip = `cl${uid}`;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl transition-all duration-200 focus:outline-none ${
        onClick ? "p-2.5 cursor-pointer" : "cursor-default"
      } ${
        selected
          ? "bg-white shadow-md ring-2 ring-gray-900 scale-[1.07]"
          : onClick
          ? "bg-gray-100 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200"
          : ""
      }`}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id={gIris} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor={lighten(irisColor, 40)} />
            <stop offset="45%" stopColor={irisColor} />
            <stop offset="100%" stopColor={darken(irisColor, 30)} />
          </radialGradient>

          <radialGradient id={gPupil} cx="40%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <radialGradient id={gSclera} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e8e4e0" />
          </radialGradient>

          <radialGradient id={gFiber} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="transparent" />
            <stop offset="100%" stopColor={darken(irisColor, 20)} stopOpacity="0.5" />
          </radialGradient>

          <clipPath id={clip}>
            <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} />
          </clipPath>
        </defs>

        {/* Sclera */}
        <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill={`url(#${gSclera})`} />

        {/* Iris */}
        <circle cx={cx} cy={cy} r={irisR} fill={`url(#${gIris})`} clipPath={`url(#${clip})`} />

        {/* Iris fiber ring depth */}
        <circle cx={cx} cy={cy} r={irisR} fill={`url(#${gFiber})`} clipPath={`url(#${clip})`} />

        {/* Iris outline ring */}
        <circle cx={cx} cy={cy} r={irisR} fill="none" stroke={darken(irisColor, 40)} strokeWidth="0.8" opacity="0.5" clipPath={`url(#${clip})`} />

        {/* Pupil */}
        <circle cx={cx} cy={cy} r={pupilR} fill={`url(#${gPupil})`} clipPath={`url(#${clip})`} />

        {/* Primary specular highlight */}
        <ellipse cx={cx - irisR * 0.22} cy={cy - irisR * 0.26} rx={irisR * 0.19} ry={irisR * 0.12} fill="white" opacity="0.85" clipPath={`url(#${clip})`} />

        {/* Secondary small highlight */}
        <circle cx={cx + irisR * 0.25} cy={cy + irisR * 0.15} r={irisR * 0.07} fill="white" opacity="0.45" clipPath={`url(#${clip})`} />

        {/* Upper eyelid shadow */}
        <ellipse cx={cx} cy={cy - eyeRy * 0.55} rx={eyeRx * 0.95} ry={eyeRy * 0.45} fill="rgba(0,0,0,0.08)" clipPath={`url(#${clip})`} />

        {/* Eyelid outline */}
        <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill="none" stroke="#c4a882" strokeWidth="1" opacity="0.6" />

        {/* Upper lash line */}
        <path d={`M ${cx - eyeRx} ${cy} Q ${cx} ${cy - eyeRy * 1.15} ${cx + eyeRx} ${cy}`} fill="none" stroke="#5c3d2e" strokeWidth="1.5" opacity="0.55" />

        {/* Lower lash line */}
        <path d={`M ${cx - eyeRx * 0.9} ${cy + eyeRy * 0.2} Q ${cx} ${cy + eyeRy * 0.85} ${cx + eyeRx * 0.9} ${cy + eyeRy * 0.2}`} fill="none" stroke="#c4a882" strokeWidth="0.8" opacity="0.35" />
      </svg>

      {label && (
        <span className={`text-xs font-semibold leading-none ${selected ? "text-gray-900" : "text-gray-500"}`}>
          {label}
        </span>
      )}

      {selected && <div className="w-1.5 h-1.5 rounded-full bg-gray-900 -mt-0.5" />}
    </button>
  );
}

function lighten(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `rgb(${r},${g},${b})`;
}
