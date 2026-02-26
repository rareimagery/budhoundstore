import { getPotencyInfo } from "../lib/constants";

export default function PotencyBar({ potencyRange, showLabel = true }) {
  const info = getPotencyInfo(potencyRange);
  if (!potencyRange) return null;

  const widthPercent = Math.min(info.percent * 2.5, 100);

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-xs text-brand-muted font-medium whitespace-nowrap">
          THC
        </span>
      )}
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${widthPercent}%`,
            background: `linear-gradient(90deg, #22c55e, ${
              info.level >= 3 ? "#CA8A04" : "#22c55e"
            })`,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400 font-mono whitespace-nowrap">
          {info.label}
        </span>
      )}
    </div>
  );
}
